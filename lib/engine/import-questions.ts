import type { CustomQuestion } from "./types";
import { evaluate } from "./exercises";
export function validateQuestions(value: unknown): CustomQuestion[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 60)
    throw new Error("Usa entre 1 y 60 preguntas.");
  return value.map((item: unknown, index) => {
    if (!item || typeof item !== "object")
      throw new Error(`Pregunta ${index + 1}: formato inválido.`);
    const q = item as Record<string, unknown>;
    if (
      typeof q.prompt !== "string" ||
      !q.prompt.trim() ||
      q.prompt.length > 4000 ||
      typeof q.answer !== "string" ||
      !Array.isArray(q.hints) ||
      q.hints.length !== 3 ||
      q.hints.some((h) => typeof h !== "string" || !h.trim()) ||
      !["number", "fraction", "coefficients"].includes(
        String(q.answerFormat),
      ) ||
      ![1, 2, 3, 4].includes(Number(q.level))
    )
      throw new Error(
        `Pregunta ${index + 1}: revisa enunciado, respuesta, formato, nivel y tres pistas.`,
      );
    const question: CustomQuestion = {
      prompt: q.prompt,
      answer: q.answer,
      answerFormat: q.answerFormat as CustomQuestion["answerFormat"],
      level: Number(q.level) as CustomQuestion["level"],
      hints: q.hints as CustomQuestion["hints"],
    };
    if (
      typeof q.image === "string" &&
      /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(q.image) &&
      q.image.length <= 450000
    ) {
      question.image = q.image;
      question.imageAlt =
        typeof q.imageAlt === "string" ? q.imageAlt : "Imagen del ejercicio";
    }
    if (
      !evaluate(
        { ...question, skillId: "import", seed: "import", errorSignatures: [] },
        question.answer,
      ).valid
    )
      throw new Error(
        `Pregunta ${index + 1}: respuesta no válida para su formato.`,
      );
    return question;
  });
}
