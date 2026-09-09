import {equivalentExpressions, parseExpression, expressionSymbols} from "./algebra";
import type { Family, Level, Exercise, Skill, Question } from "./types";
import { random } from "./random";
import { equations } from "./generators/equations";
import { units } from "./generators/units";
import { chemistry } from "./generators/chemistry";
export function generate(
  family: Family,
  skillId: string,
  level: Level,
  seed: string,
): Exercise {
  if (family === "custom")
    throw new Error("Selecciona una pregunta del tutor.");
  return { equations, units, chemistry }[family](skillId, level, seed);
}
export function exerciseFor(skill: Skill, question: Question): Exercise {
  if(skill.family === "equations")return equations(skill.id,question.level,question.seed,skill.classTopic);
  if (skill.family !== "custom")
    return generate(skill.family, skill.id, question.level, question.seed);
  const bank = skill.questions ?? [];
  const matching = bank.filter((q) => q.level === question.level);
  const choices = matching.length ? matching : bank;
  if (!choices.length)
    throw new Error("Esta habilidad necesita al menos una pregunta.");
  const match = question.seed.match(/^(.*):(\d+)(:repaso)?$/);
  const base = match?.[1] ?? question.seed;
  const offset = Math.floor(random(base)() * choices.length);
  const index = Number(match?.[2] ?? 0) + (match?.[3] ? 3 : 0);
  const picked = choices[(offset + index) % choices.length];
  return {
    ...picked,
    skillId: skill.id,
    level: question.level,
    seed: question.seed,
    errorSignatures: [],
  };
}
function numeric(raw: string): number | null {
  const text = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (
    !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(
      text,
    )
  )
    return null;
  const parts = text.split("/").map(Number);
  const result = parts.length === 2 ? parts[0] / parts[1] : parts[0];
  return Number.isFinite(result) && Math.abs(result) <= 1e12 ? result : null;
}
export type Evaluation =
  | { valid: false; message: string }
  | { valid: true; correct: boolean; errorType: string | null };
export function evaluate(exercise: Exercise, input: string): Evaluation {
  if (input.length > 100)
    return { valid: false, message: "La respuesta es demasiado larga." };
  if (exercise.answerFormat === "expression") {
    const raw=input.trim();
    const pieces=raw.split('=');
    if(pieces.length>2 || (pieces.length===2 && pieces[0].trim()!==exercise.target))return {valid:false,message:`Escribe solo la expresión${exercise.target ? ` o ${exercise.target} = …` : ''}.`};
    const value=pieces.at(-1) ?? '';
    const allowed=expressionSymbols(exercise.formula ?? exercise.answer);
    try {
      parseExpression(value);
      if(expressionSymbols(value).some(s=>!allowed.includes(s)))return {valid:false,message:'Usa las letras de la fórmula; mayúsculas y minúsculas son distintas.'};
      if(exercise.target && expressionSymbols(value).includes(exercise.target))return {valid:true,correct:false,errorType:'VARIABLE_SIN_AISLAR'};
      if(equivalentExpressions(value,exercise.answer))return {valid:true,correct:true,errorType:null};
      return {valid:true,correct:false,errorType:exercise.errorSignatures.find(s=>equivalentExpressions(value,s.value))?.errorType ?? 'UNKNOWN'};
    } catch {return {valid:false,message:'Completa la expresión con letras, operaciones y paréntesis. Por ejemplo F/a.'};}
  }
  if (exercise.answerFormat === "coefficients") {
    const parts = input.trim().split(/[,;\s]+/);
    const expected = exercise.answer.split(",").map(Number);
    if (
      parts.length !== expected.length ||
      parts.some(
        (v) => !/^\d+$/.test(v) || Number(v) <= 0 || Number(v) > 100000,
      )
    )
      return {
        valid: false,
        message: `Escribe ${expected.length} enteros positivos separados por comas.`,
      };
    const numbers = parts.map(Number),
      answer = numbers.join(",");
    if (answer === exercise.answer)
      return { valid: true, correct: true, errorType: null };
    const ratios = numbers.map((n, i) => n / expected[i]);
    const multiple =
      ratios.every((r) => Math.abs(r - ratios[0]) < 1e-9) && ratios[0] > 1;
    return {
      valid: true,
      correct: false,
      errorType: multiple
        ? "RATIO_NO_MINIMO"
        : (exercise.errorSignatures.find((s) => s.value === answer)
            ?.errorType ?? "UNKNOWN"),
    };
  }
  const value = numeric(input);
  if (value === null)
    return {
      valid: false,
      message: "Escribe un número o una fracción, por ejemplo 0,5 o 1/2.",
    };
  const expected = numeric(exercise.answer);
  if (expected === null) throw new Error("Respuesta canónica inválida");
  const close = (a: number, b: number) =>
    Math.abs(a - b) <= (exercise.tolerance ?? 1e-9);
  if (close(value, expected))
    return { valid: true, correct: true, errorType: null };
  return {
    valid: true,
    correct: false,
    errorType:
      exercise.errorSignatures.find((s) => {
        const v = numeric(s.value);
        return v !== null && close(value, v);
      })?.errorType ?? "UNKNOWN",
  };
}
