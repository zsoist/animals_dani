"use client";
import { useActionState, useEffect, useState } from "react";
import type { Skill, CustomQuestion, Level } from "@/lib/engine/types";
import { generate } from "@/lib/engine/exercises";
import { saveSkill, removeSkill, saveNote } from "@/lib/data/tutor-actions";
import { QuestionStudio } from "./question-studio";
import { ImageViewer } from "@/components/game/image-viewer";
import { QuestionPreview } from "./question-preview";
import { Icon } from "@/components/game/icons";
const empty: {error:string;success:string;id?:string} = { error: "", success: "" };
type DraftQuestion = CustomQuestion & { localId: string };
const blank = (): DraftQuestion => ({
  localId: crypto.randomUUID(),
  prompt: "",
  answer: "",
  hints: ["", "", ""],
  level: 3,
  answerFormat: "number",
});
export function SkillEditor({ skill, draft, onSaved }: { onSaved?: () => void; skill?: Skill; draft?: { name:string; description:string; subject:string; questions:CustomQuestion[] } }) {
  const [mode, setMode] = useState(
    skill?.family === "custom" ? "custom" : skill ? "generated" : "custom",
  );
  const [subject, setSubject] = useState(skill?.subject ?? draft?.subject ?? "matematicas");
  const [questions, setQuestions] = useState<DraftQuestion[]>(() =>
    (skill?.questions ?? draft?.questions)?.length
      ? (skill?.questions ?? draft?.questions ?? []).map((q) => ({ ...q, localId: crypto.randomUUID() }))
      : [blank()],
  );
  const update = (id: string, patch: Partial<CustomQuestion>) =>
    setQuestions((old) =>
      old.map((q) => (q.localId === id ? { ...q, ...patch } : q)),
    );
  const addImported = (incoming: CustomQuestion[]) =>
    setQuestions((old) =>
      [
        ...old.filter((q) => q.prompt.trim() || q.answer.trim() || q.image),
        ...incoming.map((q) => ({ ...q, localId: crypto.randomUUID() })),
      ].slice(0, 60),
    );
  const [state, action, pending] = useActionState(saveSkill, empty);
  useEffect(()=>{if(state.success && state.id)onSaved?.();},[state.success,state.id,onSaved]);
  const [deletion, deleteAction, deleting] = useActionState(removeSkill, empty);
  return (
    <div className="skill-editor">
      <form action={action} onReset={e=>e.preventDefault()} onInvalidCapture={e=>{const element=e.target as HTMLElement;const details=element.closest("details");if(details)details.open=true;}}>
        <input type="hidden" name="id" value={skill?.id ?? state.id ?? ""} />
        <div className="form-grid">
          <label>
            Nombre de la habilidad
            <input
              name="name"
              required
              maxLength={100}
              defaultValue={skill?.name ?? draft?.name}
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
              defaultValue={skill?.description ?? draft?.description}
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
              defaultValue={skill?.base_difficulty ?? 3}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  Nivel {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        <fieldset className="schedule-picker">
          <legend>Planifica su práctica</legend>
          <p>
            Un solo tema al día. Marca los días en que esta habilidad puede
            aparecer; sin marcar, participa todos los días.
          </p>
          <div className="weekday-options">
            {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"].map((day, index) => (
              <label key={day}>
                <input
                  type="checkbox"
                  name="practiceDay"
                  value={index}
                  defaultChecked={skill?.practiceDays?.includes(index)}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              name="fixedLevel"
              defaultChecked={skill?.fixedLevel}
            />
            Mantener el nivel que elijo (sin adaptación automática)
          </label>
          <p>
            El nivel inicial es también el mínimo de dificultad. Súbelo para
            proponer más desafío.
          </p>
        </fieldset>
        <label className="check-label">
          <input
            type="checkbox"
            name="active"
            defaultChecked={skill?.active ?? !draft}
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
            <QuestionStudio onAdd={addImported} />
            <div className="bank-toolbar">
              <h3>
                Banco · {questions.length}{" "}
                {questions.length === 1 ? "pregunta" : "preguntas"}
              </h3>
              <button
                type="button"
                className="quiet"
                onClick={() => {
                  const data = questions.map(({ localId, ...q }) => {
                    void localId;
                    return q;
                  });
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "preguntas-refugio.json";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Exportar JSON
              </button>
            </div>
            <p>
              Laura practicará estas preguntas. Añade varias por nivel para
              darle variedad. Aceptamos números, fracciones y coeficientes
              químicos.
            </p>
            {questions.map((q, i) => (
              <details key={q.localId} className="question-accordion" open={i === 0 ? true : undefined}><summary><span className="question-number">{i+1}</span><span>{q.prompt || "Nueva pregunta"}<small>Nivel {q.level} · {q.answerFormat === "coefficients" ? "Coeficientes" : q.answerFormat === "fraction" ? "Fracción" : "Número"}</small></span><Icon name="gear" size={18}/></summary><fieldset className="editable-question">
                <legend>Pregunta {i + 1}</legend>
                <input type="hidden" name="image" value={q.image ?? ""} />
                <input type="hidden" name="imageAlt" value={q.imageAlt ?? ""} />
                {q.image && (
                  <div className="attached-image">
                    <ImageViewer src={q.image} alt={q.imageAlt} />
                    <button
                      type="button"
                      className="quiet"
                      onClick={() =>
                        update(q.localId, {
                          image: undefined,
                          imageAlt: undefined,
                        })
                      }
                    >
                      Quitar imagen
                    </button>
                  </div>
                )}
                <label>
                  Enunciado
                  <textarea
                    name="prompt"
                    required
                    value={q.prompt}
                    onChange={(e) =>
                      update(q.localId, { prompt: e.target.value })
                    }
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
                      value={q.answer}
                      onChange={(e) =>
                        update(q.localId, { answer: e.target.value })
                      }
                      placeholder="Ej. 0,5 o 1/2"
                    />
                  </label>
                  <label>
                    Formato
                    <select
                      name="format"
                      value={q.answerFormat}
                      onChange={(e) =>
                        update(q.localId, {
                          answerFormat: e.target
                            .value as CustomQuestion["answerFormat"],
                        })
                      }
                    >
                      <option value="number">Número</option>
                      <option value="fraction">Fracción</option><option value="expression">Expresión con letras</option>
                      <option value="coefficients">Coeficientes: 2,1,2</option>
                    </select>
                  </label>
                  <label>
                    Nivel
                    <select
                      name="level"
                      value={q.level}
                      onChange={(e) =>
                        update(q.localId, {
                          level: Number(e.target.value) as Level,
                        })
                      }
                    >
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
                      value={q.hints[n - 1]}
                      onChange={(e) => {
                        const hints = [...q.hints] as CustomQuestion["hints"];
                        hints[n - 1] = e.target.value;
                        update(q.localId, { hints });
                      }}
                    />
                  </label>
                ))}
                <div className="question-actions">
                  <button
                    type="button"
                    className="quiet"
                    onClick={() =>
                      setQuestions((old) => [
                        ...old,
                        { ...q, localId: crypto.randomUUID() },
                      ])
                    }
                  >
                    Duplicar pregunta
                  </button>
                  <button
                    type="button"
                    className="quiet"
                    disabled={i === 0}
                    onClick={() =>
                      setQuestions((old) => {
                        const copy = [...old];
                        [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                        return copy;
                      })
                    }
                  >
                    Subir
                  </button>
                </div>
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
                <details className="preview-toggle"><summary>Probar como Laura</summary><QuestionPreview question={q}/></details>
              </fieldset></details>
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
        <button className="primary save-skill" disabled={pending}>
          {pending
            ? "Guardando…"
            : skill || state.id
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
