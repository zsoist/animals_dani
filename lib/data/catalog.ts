import "server-only";
import type { CustomQuestion, Skill } from "@/lib/engine/types";
export function prepareSkill(row: Record<string, unknown>): Skill {
  const levels = Array.isArray(row.skill_levels)
    ? (row.skill_levels as { description: string }[])
    : [];
  const questions: CustomQuestion[] = [];
  let custom = false;
  let practiceDays: number[] = [];
  let fixedLevel = false;
  for (const level of levels) {
    try {
      const parsed = JSON.parse(level.description) as {
        kind?: string;
        practiceDays?: number[];
        fixedLevel?: boolean;
        questions?: CustomQuestion[];
      };
      practiceDays = parsed.practiceDays ?? practiceDays;
      fixedLevel = parsed.fixedLevel ?? fixedLevel;
      if (parsed.kind === "custom") {
        custom = true;
        questions.push(...(parsed.questions ?? []));
      }
    } catch {
      /* Generated levels have plain descriptions. */
    }
  }
  return {
    id: String(row.id),
    name: String(row.name),
    subject: String(row.subject),
    description: String(row.description),
    active: Boolean(row.active),
    priority: Number(row.priority),
    base_difficulty: Number(row.base_difficulty) as Skill["base_difficulty"],
    created_at: String(row.created_at),
    family: custom
      ? "custom"
      : row.subject === "matematicas"
        ? "equations"
        : row.subject === "fisica"
          ? "units"
          : "chemistry",
    questions,
    practiceDays,
    fixedLevel,
  };
}
