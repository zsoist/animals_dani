"use server";
import { revalidatePath } from "next/cache";
import { database } from "./server";
import type { CustomQuestion, Level } from "@/lib/engine/types";
import { evaluate } from "@/lib/engine/exercises";
type ActionState = { error: string; success: string };
async function tutorDatabase() {
  const db = await database();
  const { data } = await db.auth.getUser();
  if (!data.user) throw new Error("Entra como Admin para guardar.");
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profile?.role !== "tutor") throw new Error("Acceso reservado al tutor.");
  return db;
}
export async function saveSkill(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const db = await tutorDatabase();
    const id = String(form.get("id") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const subject = String(form.get("subject") ?? "");
    const mode = String(form.get("mode") ?? "generated");
    const priority = Number(form.get("priority"));
    const difficulty = Number(form.get("difficulty"));
    if (
      !name ||
      name.length > 100 ||
      !description ||
      !["matematicas", "fisica", "quimica"].includes(subject) ||
      !Number.isInteger(priority) ||
      priority < 1 ||
      priority > 10 ||
      !Number.isInteger(difficulty) ||
      difficulty < 1 ||
      difficulty > 4
    )
      return {
        error: "Completa los campos. Prioridad de 1 a 10 y nivel de 1 a 4.",
        success: "",
      };
    const questions: CustomQuestion[] = [];
    if (mode === "custom") {
      const prompts = form.getAll("prompt");
      for (let i = 0; i < prompts.length; i++) {
        const prompt = String(prompts[i]).trim();
        let answer = String(form.getAll("answer")[i] ?? "").trim();
        const format = String(form.getAll("format")[i] ?? "number");
        if (format === "coefficients")
          answer = answer
            .split(/[,;\s]+/)
            .map(Number)
            .join(",");
        const level = Number(form.getAll("level")[i]);
        const hints = [1, 2, 3].map((n) =>
          String(form.getAll(`hint${n}`)[i] ?? "").trim(),
        ) as [string, string, string];
        if (
          !prompt ||
          !answer ||
          hints.some((h) => !h) ||
          !["number", "fraction", "coefficients"].includes(format) ||
          !Number.isInteger(level) ||
          level < 1 ||
          level > 4
        )
          return {
            error: `Completa la pregunta ${i + 1}, su respuesta y sus tres pistas.`,
            success: "",
          };
        const question = {
          prompt,
          answer,
          hints,
          level: level as Level,
          answerFormat: format as CustomQuestion["answerFormat"],
        };
        const evaluation = evaluate(
          {
            ...question,
            skillId: "validation",
            seed: "validation",
            errorSignatures: [],
          },
          answer,
        );
        if (!evaluation.valid)
          return {
            error: `Pregunta ${i + 1}: ${evaluation.message}`,
            success: "",
          };
        questions.push(question);
      }
      if (!questions.length)
        return { error: "Añade al menos una pregunta propia.", success: "" };
    }
    const values = {
      name,
      description,
      subject,
      active: form.get("active") === "on",
      priority,
      base_difficulty: difficulty,
    };
    const saved = id
      ? await db
          .from("skills")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await db
          .from("skills")
          .insert({ ...values, active: false })
          .select("id")
          .single();
    if (saved.error) throw new Error("No se pudo guardar la habilidad.");
    const levels = ([1, 2, 3, 4] as const).map((level) => ({
      skill_id: saved.data.id,
      level,
      description:
        mode === "custom"
          ? JSON.stringify({
              kind: "custom",
              questions: questions.filter((q) => q.level === level),
            })
          : ["Primeros pasos", "Práctica guiada", "Más desafío", "Aplicación"][
              level - 1
            ],
    }));
    const savedLevels = await db.from("skill_levels").upsert(levels);
    if (savedLevels.error)
      throw new Error("No se pudieron guardar las preguntas.");
    const activated = await db
      .from("skills")
      .update({ active: values.active })
      .eq("id", saved.data.id);
    if (activated.error) throw new Error("No se pudo activar la habilidad.");
    revalidatePath("/tutor");
    revalidatePath("/");
    return {
      error: "",
      success: id
        ? "Cambios guardados."
        : "Habilidad creada. Ya está disponible para la próxima misión.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo guardar. Inténtalo de nuevo.",
      success: "",
    };
  }
}
export async function removeSkill(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const db = await tutorDatabase();
    const { error } = await db
      .from("skills")
      .delete()
      .eq("id", String(form.get("id")));
    if (error)
      return {
        error:
          "Esta habilidad tiene progreso guardado. Desactívala para conservarlo.",
        success: "",
      };
    revalidatePath("/tutor");
    revalidatePath("/");
    return { error: "", success: "Habilidad eliminada." };
  } catch {
    return { error: "No se pudo eliminar la habilidad.", success: "" };
  }
}
export async function saveNote(
  _previous: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const db = await tutorDatabase();
    const body = String(form.get("body") ?? "").trim();
    if (!body) return { error: "Escribe una nota.", success: "" };
    const { error } = await db
      .from("tutor_notes")
      .insert({
        user_id: String(form.get("user_id")),
        skill_id: String(form.get("skill_id")),
        body,
      });
    if (error) throw error;
    revalidatePath("/tutor");
    return { error: "", success: "Nota guardada." };
  } catch {
    return { error: "No se pudo guardar la nota.", success: "" };
  }
}
