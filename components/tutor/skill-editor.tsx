"use client";
import { useActionState, useState } from "react";
import type { Skill, CustomQuestion, Level } from "@/lib/engine/types";
import { generate } from "@/lib/engine/exercises";
import { saveSkill, removeSkill, saveNote } from "@/lib/data/tutor-actions";
import { Icon } from "@/components/game/icons";
const empty = { error: "", success: "" };
type DraftQuestion = CustomQuestion & { localId: string };
const blank = (): DraftQuestion => ({
  localId: crypto.randomUUID(),
  prompt: "",
  answer: "",
  hints: ["", "", ""],
  level: 1,
  answerFormat: "number",
});
export function SkillEditor({ skill }: { skill?: Skill }) {
  const [mode, setMode] = useState(
    skill?.family === "custom" ? "custom" : skill ? "generated" : "custom",
  );
  const [subject, setSubject] = useState(skill?.subject ?? "matematicas");
  const [questions, setQuestions] = useState<DraftQuestion[]>(() =>
    skill?.questions?.length
      ? skill.questions.map((q) => ({ ...q, localId: crypto.randomUUID() }))
      : [blank()],
  );
  const [state, action, pending] = useActionState(saveSkill, empty);
  const [deletion, deleteAction, deleting] = useActionState(removeSkill, empty);
  return (
    <div className="skill-editor">
      <form action={action}>
        <input type="hidden" name="id" value={skill?.id ?? ""} />
        <div className="form-grid">
          <label>
            Nombre de la habilidad
            <input
              name="name"
              required
              maxLength={100}
              defaultValue={skill?.name}
              placeholder="Por ejemplo: fracciones equivalentes"
            />
          </label>
          <label>
            Materia
            <select
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="matematicas">Matemáticas</option>
              <option value="fisica">Física</option>
              <option value="quimica">Química</option>
            </select>
          </label>
          <label className="full-width">
            Qué quieres que practique Laura
            <textarea
              name="description"
              required
              defaultValue={skill?.description}
              placeholder="Describe el objetivo de esta práctica."
              rows={2}
            />
          </label>
          <label>
            Prioridad (1–10)
            <input
              type="number"
              name="priority"
              min={1}
              max={10}
              defaultValue={skill?.priority ?? 1}
              required
            />
          </label>
          <label>
            Nivel inicial
            <select
              name="difficulty"
              defaultValue={skill?.base_difficulty ?? 1}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  Nivel {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            name="active"
            defaultChecked={skill?.active ?? true}
          />{" "}
          Incluir en las misiones de Laura
        </label>
        <label>
          Contenido de práctica
          <select
            name="mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="custom">Mis propias preguntas y pistas</option>
            <option value="generated">
              Ejercicios automáticos de la materia
            </option>
          </select>
        </label>
        {mode === "custom" ? (
          <div className="question-bank">
            <h3>Preguntas de esta habilidad</h3>
            <p>
              Laura practicará estas preguntas. Añade varias por nivel para
              darle variedad. Aceptamos números, fracciones y coeficientes
              químicos.
            </p>
            {questions.map((q, i) => (
              <fieldset key={q.localId}>
                <legend>Pregunta {i + 1}</legend>
                <label>
                  Enunciado
                  <textarea
                    name="prompt"
                    required
                    defaultValue={q.prompt}
                    rows={2}
                    placeholder="Escribe el problema completo."
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Respuesta correcta
                    <input
                      name="answer"
                      required
                      defaultValue={q.answer}
                      placeholder="Ej. 0,5 o 1/2"
                    />
                  </label>
                  <label>
                    Formato
                    <select name="format" defaultValue={q.answerFormat}>
                      <option value="number">Número</option>
                      <option value="fraction">Fracción</option>
                      <option value="coefficients">Coeficientes: 2,1,2</option>
                    </select>
                  </label>
                  <label>
                    Nivel
                    <select name="level" defaultValue={q.level}>
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {[1, 2, 3].map((n) => (
                  <label key={n}>
                    Pista {n}:{" "}
                    {
                      ["idea clave", "primer paso", "procedimiento completo"][
                        n - 1
                      ]
                    }
                    <input
                      name={`hint${n}`}
                      required
                      defaultValue={q.hints[n - 1]}
                    />
                  </label>
                ))}
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="quiet danger"
                    onClick={() =>
                      setQuestions((old) => old.filter((_, j) => j !== i))
                    }
                  >
                    Quitar pregunta {i + 1}
                  </button>
                )}
              </fieldset>
            ))}
            <button
              type="button"
              className="secondary"
              onClick={() => setQuestions((old) => [...old, blank()])}
            >
              <Icon name="plus" size={18} />
              Añadir pregunta
            </button>
          </div>
        ) : (
          <div className="live-examples">
            <h3>Ejemplos de lo que practicará</h3>
            <p>
              {subject === "matematicas"
                ? "Despejar ecuaciones"
                : subject === "fisica"
                  ? "Conversión de unidades"
                  : "Balanceo químico"}
              . El nombre de la habilidad no cambia el generador; para otro
              tema, elige preguntas propias.
            </p>
            {([1, 2, 3, 4] as Level[]).map((level) => {
              const e = generate(
                subject === "matematicas"
                  ? "equations"
                  : subject === "fisica"
                    ? "units"
                    : "chemistry",
                skill?.id ?? "preview",
                level,
                "preview",
              );
              return (
                <p key={level}>
                  <b>Nivel {level}</b> {e.prompt}
                  <span>Respuesta: {e.answer}</span>
                </p>
              );
            })}
          </div>
        )}
        {state.error && (
          <p role="alert" className="error">
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="success-message">
            {state.success}
          </p>
        )}
        <button className="primary" disabled={pending}>
          {pending
            ? "Guardando…"
            : skill
              ? "Guardar cambios"
              : "Crear habilidad"}
          <Icon name="check" />
        </button>
      </form>
      {skill && (
        <form action={deleteAction} className="delete-form">
          <input type="hidden" name="id" value={skill.id} />
          <button className="quiet danger" disabled={deleting}>
            Eliminar habilidad sin historial
          </button>
          {deletion.error && (
            <p role="alert" className="error">
              {deletion.error}
            </p>
          )}
          {deletion.success && <p role="status">{deletion.success}</p>}
        </form>
      )}
    </div>
  );
}
export function NoteForm({
  skillId,
  userId,
}: {
  skillId: string;
  userId: string;
}) {
  const [state, action, pending] = useActionState(saveNote, empty);
  return (
    <form action={action} className="note-form">
      <input name="skill_id" type="hidden" value={skillId} />
      <input name="user_id" type="hidden" value={userId} />
      <label>
        Nota para ti
        <textarea
          name="body"
          rows={2}
          required
          placeholder="Qué conviene practicar, qué explicación ayudó…"
        />
      </label>
      <button className="secondary" disabled={pending}>
        Guardar nota
      </button>
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p role="status">{state.success}</p>}
    </form>
  );
}
