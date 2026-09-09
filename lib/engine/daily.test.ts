import { describe, it, expect } from "vitest";
import { selectDaily, dailySkill } from "./selector";
import { validateQuestions } from "./import-questions";
import { exerciseFor } from "./exercises";
import type { Skill, CustomQuestion } from "./types";
const skills: Skill[] = ["equations", "units", "chemistry"].map(
  (family, i) => ({
    id: String(i),
    family: family as Skill["family"],
    name: family,
    active: true,
    subject: "matematicas",
    description: family,
    priority: 1,
    base_difficulty: 2,
    created_at: "2026-01-01",
  }),
);
describe("Una sola habilidad cada día", () => {
  it("no mezcla habilidades en diez preguntas aunque cambie la semilla de sesión", () => {
    for (let day = 1; day < 29; day++) {
      const date = `2026-09-${String(day).padStart(2, "0")}`;
      const a = selectDaily(skills, [], date, "first");
      const b = selectDaily(skills, [], date, "second");
      expect(new Set(a.map((q) => q.skillId)).size).toBe(1);
      expect(a[0].skillId).toBe(b[0].skillId);
      expect(new Set(a.map((q) => q.seed)).size).toBe(10);
    }
  });
  it("respeta el tema ya empezado aunque se cambien prioridades", () => {
    expect(dailySkill(skills, "2026-09-09", "2")?.id).toBe("2");
  });
  it("respeta el calendario del tutor", () => {
    const scheduled = skills.map((s, i) => ({
      ...s,
      practiceDays: [i === 1 ? 3 : 1],
    }));
    expect(dailySkill(scheduled, "2026-09-09")?.id).toBe("1");
  });
  it("respeta el mínimo de dificultad y el nivel fijo", () => {
    expect(selectDaily(skills, [], "2026-09-09", "a")[0].level).toBe(2);
    const s = { ...skills[0], fixedLevel: true };
    expect(
      selectDaily(
        [s],
        [
          {
            skill_id: s.id,
            current_level: 4,
            mastery_score: 90,
            recent_accuracy: 1,
            attempts_total: 9,
            last_practiced_at: null,
          },
        ],
        "2026-09-09",
        "a",
      )[0].level,
    ).toBe(2);
  });
  it("no selecciona habilidades desactivadas", () =>
    expect(
      selectDaily(
        skills.map((s) => ({ ...s, active: false })),
        [],
        "2026-09-09",
        "a",
      ),
    ).toEqual([]));
});
const question: CustomQuestion = {
  prompt: "Resuelve 3(x + 2) = 21",
  answer: "5",
  hints: ["Distribuye o divide ambos lados.", "x + 2 = 7", "Resta 2: x = 5."],
  answerFormat: "number",
  level: 3,
};
describe("Importación revisable", () => {
  it("valida contenido y rechaza respuestas incompatibles", () => {
    expect(validateQuestions([question])).toEqual([question]);
    expect(() =>
      validateQuestions([{ ...question, answer: "texto" }]),
    ).toThrow();
    expect(() => validateQuestions([{ ...question, hints: [] }])).toThrow();
    expect(() => validateQuestions([])).toThrow();
  });
  it("mantiene imágenes seguras y descarta URLs externas", () => {
    expect(
      validateQuestions([
        { ...question, image: "https://unknown.example/a.jpg" },
      ])[0].image,
    ).toBeUndefined();
    expect(
      validateQuestions([
        { ...question, image: "data:image/png;base64,YQ==" },
      ])[0].image,
    ).toBeDefined();
  });
  it("recorre preguntas propias sin repetir antes de agotar el banco", () => {
    const bank = Array.from({ length: 10 }, (_, i) => ({
      ...question,
      prompt: `Pregunta ${i}`,
    }));
    const s: Skill = {
      ...skills[0],
      family: "custom",
      questions: bank,
      base_difficulty: 3,
    };
    const queue = selectDaily([s], [], "2026-09-09", "session");
    expect(new Set(queue.map((q) => exerciseFor(s, q).prompt)).size).toBe(10);
  });
});
