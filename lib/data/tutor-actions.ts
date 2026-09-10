"use server";
import { revalidatePath } from "next/cache";
import { tutorDatabase } from "./tutor-auth";
import type { CustomQuestion, Level } from "@/lib/engine/types";
import {isGeneratedFamily,subjectFamily} from "@/lib/engine/families";
import { evaluate } from "@/lib/engine/exercises";
type ActionState = { error: string; success: string; id?: string };
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
    const family=String(form.get("family")??subjectFamily(subject));
    if(mode!=="custom"&&!isGeneratedFamily(family))return {error:"Selecciona un generador disponible.",success:""};
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
          !["number", "fraction", "coefficients", "expression"].includes(format) ||
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
        const image = String(form.getAll("image")[i] ?? "");
        if (
          image &&
          (!/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(
            image,
          ) ||
            image.length > 450000)
        )
          return {
            error: `Imagen ${i + 1}: usa una imagen de menos de 330 KB.`,
            success: "",
          };
        questions.push({
          ...question,
          image: image || undefined,
          imageAlt: String(
            form.getAll("imageAlt")[i] ?? "Ilustración del ejercicio",
          ).slice(0, 300),
        });
      }
      if (!questions.length)
        return { error: "Añade al menos una pregunta propia.", success: "" };
    }
    if (questions.length > 60)
      return { error: "Guarda hasta 60 preguntas por habilidad.", success: "" };
    if (questions.reduce((n, q) => n + (q.image?.length ?? 0), 0) > 3000000)
      return {
        error:
          "Las imágenes juntas superan 3 MB. Recorta más o divide el material en dos habilidades.",
        success: "",
      };
    const practiceDays = form
      .getAll("practiceDay")
      .map(Number)
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
    const fixedLevel = false;
    const classTopic=String(form.get("classTopic")??"").trim().slice(0,300);
    const values = {
      name,
      description,
      subject,
      active: form.get("active") === "on",
      priority,
      base_difficulty: difficulty,
    };
    const levels = ([1, 2, 3, 4] as const).map((level) => ({
      level,
      description: JSON.stringify(mode === "custom" ? {kind:"custom",practiceDays,fixedLevel,classTopic,questions:questions.filter(q=>q.level===level)} : {kind:"generated",family,practiceDays,fixedLevel,classTopic}),
    }));
    const saved=await db.rpc("save_skill_atomic",{p_id:id || String(form.get("clientId") || crypto.randomUUID()),p_values:{...values,is_test:process.env.NODE_ENV!=="production"},p_levels:levels});
    if(saved.error)throw new Error("No se guardaron cambios. Tus preguntas siguen aquí; vuelve a intentarlo.");
    revalidatePath("/tutor");
    revalidatePath("/");
    return {
      error: "",
      id: String(saved.data),
      success: id
        ? "Cambios guardados."
        : values.active ? "Habilidad creada. Ya está disponible para la próxima misión." : "Borrador guardado. Actívalo cuando termines de revisarlo.",
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
    const { error } = await db.from("tutor_notes").insert({
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
export async function saveClassTopic(skillId:string,topic:string){
 if(typeof topic!=='string'||topic.length>300)throw new Error('El tema admite hasta 300 caracteres.');
 const db=await tutorDatabase();const {data:skill,error}=await db.from('skills').select('*,skill_levels(level,description)').eq('id',skillId).single();
 if(error||!skill)throw new Error('Elige una microhabilidad disponible.');
 const levels=(skill.skill_levels as {level:number;description:string}[]).map(l=>{let config:Record<string,unknown>={kind:'generated'};try{config=JSON.parse(l.description) as Record<string,unknown>;}catch{/* Plain legacy generator description. */}return {level:l.level,description:JSON.stringify({...config,classTopic:topic.trim(),fixedLevel:false})};});
 const saved=await db.rpc('save_skill_atomic',{p_id:skillId,p_values:{name:skill.name,description:skill.description,subject:skill.subject,priority:skill.priority,active:skill.active,base_difficulty:1,is_test:process.env.NODE_ENV!=='production'},p_levels:levels});
 if(saved.error)throw new Error('No se guardó el tema. Reintenta.');revalidatePath('/');revalidatePath('/tutor');return {success:true};
}
