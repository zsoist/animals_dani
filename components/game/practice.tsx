"use client";
import { AICoach } from "./ai-coach";
import { useActiveTime } from "./use-active-time";
import { ImageViewer } from "./image-viewer";
import { useEffect, useMemo, useRef, useState } from "react";
import { completeMission, recordAttempt } from "@/lib/data/actions";
import { evaluate, exerciseFor } from "@/lib/engine/exercises";
import { reinforce } from "@/lib/engine/selector";
import type { Question, ShelterState, Skill, Streak } from "@/lib/engine/types";
import type { ShelterCat } from "@/lib/data/shelter";
import { Icon } from "./icons";
import { CatArt } from "@/components/scene/cat-art";
type Completion = { streak: Streak; cat: ShelterCat | null };
export function Practice({
  sessionId,
  queue,
  skills,
  onDone,
  onReward,
  onStep,
  userId,
}: {
  sessionId: string;
  queue: Question[];
  skills: Skill[];
  onDone: (result: Completion) => void;
  onReward: (state: ShelterState) => void;
  onStep: (step: number) => void;
  userId: string;
}) {
  const [items, setItems] = useState(queue.slice(0, 10));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState(0);
  const [message, setMessage] = useState("");
  const [correct, setCorrect] = useState(0);
  const [busy, setBusy] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [review, setReview] = useState(false);
  const [result, setResult] = useState<Completion | null>(null);
  const [skillResults, setSkillResults] = useState<
    Record<string, { correct: number; total: number }>
  >({});
  const [coachBusy, setCoachBusy] = useState(false);
  const [aiHelp, setAiHelp] = useState(false);
  const gate = useRef(false);
  const field = useRef<HTMLInputElement>(null);
  const cursor = useRef<{ start: number; end: number } | null>(null);
  const question = items[index];
  const skill = skills.find((s) => s.id === question?.skillId);
  const exercise = useMemo(
    () => (question && skill ? exerciseFor(skill, question) : null),
    [question, skill],
  );
  const activeTime = useActiveTime(
    question?.seed ?? "complete",
    busy || coachBusy || solved || Boolean(result),
  );
  const sessionTime = useActiveTime(sessionId, Boolean(result));
  useEffect(() => {
    field.current?.focus({ preventScroll: true });
  }, [question?.seed]);
  const capture = () => {
    if (field.current)
      cursor.current = {
        start: field.current.selectionStart ?? answer.length,
        end: field.current.selectionEnd ?? answer.length,
      };
  };
  const edit = (key: string) => {
    if (solved || busy || coachBusy) return;
    const selection = cursor.current ?? {
      start: answer.length,
      end: answer.length,
    };
    let next = answer;
    let caret = selection.start;
    if (key === "clear") {
      next = "";
      caret = 0;
    } else if (key === "back") {
      const start =
        selection.start === selection.end
          ? Math.max(0, selection.start - 1)
          : selection.start;
      next = answer.slice(0, start) + answer.slice(selection.end);
      caret = start;
    } else {
      next =
        answer.slice(0, selection.start) + key + answer.slice(selection.end);
      caret = selection.start + key.length;
    }
    if (next.length > 60) return;
    setAnswer(next);
    cursor.current = { start: caret, end: caret };
    requestAnimationFrame(() => {
      field.current?.focus({ preventScroll: true });
      field.current?.setSelectionRange(caret, caret);
    });
  };
  const check = async () => {
    if (gate.current || solved || !exercise || !skill) return;
    const evaluated = evaluate(exercise, answer);
    if (!evaluated.valid) {
      setMessage(evaluated.message);
      return;
    }
    gate.current = true;
    setBusy(true);
    setMessage("");
    const responseMs = activeTime.read();
    try {
      const saved = await recordAttempt({
        user_id: userId,
        skill_id: skill.id,
        level: exercise.level,
        exercise_seed: exercise.seed,
        prompt_text: exercise.prompt,
        expected_answer: exercise.answer,
        given_answer: answer,
        correct: evaluated.correct,
        response_ms: responseMs,
        timing_version: 2,
        ai_help: aiHelp,
        hint_level: hint,
        error_type: evaluated.errorType,
        session_id: sessionId,
      });
      onReward(saved.state);
      activeTime.reset();
      setSkillResults((previous) => ({
        ...previous,
        [skill.name]: {
          correct:
            (previous[skill.name]?.correct ?? 0) + (evaluated.correct ? 1 : 0),
          total: (previous[skill.name]?.total ?? 0) + 1,
        },
      }));
      if (evaluated.correct) {
        setCorrect((n) => n + 1);
        setSolved(true);
        setMessage(
          [
            "¡Un plato lleno y un gato feliz!",
            "¡Una patita más cerca del rescate!",
            "¡Milo está orgulloso de ti!",
          ][index % 3],
        );
      } else {
        if (!wrong) setItems((old) => reinforce(old, index).slice(0, 10));
        setWrong(true);
        setHint((h) => Math.min(3, h + 1));
        setMessage(exercise.hints[Math.min(hint, 2)]);
      }
    } catch {
      setMessage(
        "No se guardó la respuesta. Comprueba tu conexión y vuelve a intentarlo.",
      );
    } finally {
      gate.current = false;
      setBusy(false);
    }
  };
  const advance = async () => {
    if (gate.current) return;
    if (index === 9) {
      gate.current = true;
      setBusy(true);
      try {
        const completion = await completeMission(
          sessionId,
          correct,
          sessionTime.read(),
        );
        setResult(completion);
        onStep(10);
      } catch {
        setMessage(
          "No se pudo guardar el rescate. Toca «Terminar misión» para reintentar.",
        );
      } finally {
        gate.current = false;
        setBusy(false);
      }
      return;
    }
    setIndex((n) => n + 1);
    onStep(index + 1);
    setAnswer("");
    cursor.current = null;
    setHint(0);
    setMessage("");
    setSolved(false);
    setWrong(false);
    setReview(false);
    setAiHelp(false);
  };
  if (result)
    return (
      <section className="exercise-sheet mission-complete">
        <div className="completion-stars">
          <Icon name="star" />
          <Icon name="star" size={44} />
          <Icon name="star" />
        </div>
        <CatArt
          body={result.cat?.palette.body}
          belly={result.cat?.palette.belly}
        />
        <h1>
          {result.cat
            ? `¡${result.cat.name} está en casa!`
            : "¡Refugio lleno de cariño!"}
        </h1>
        <p>
          {result.cat?.story ??
            "Todos los gatos tienen un lugar contigo. Hoy les regalaste un poco más de cuidado."}
        </p>
        <div className="completion-stats">
          <strong>
            {correct}/10<span>respuestas resueltas</span>
          </strong>
          <strong>
            <Icon name="fire" />
            {result.streak.current}
            <span>{result.streak.current === 1 ? "día" : "días"} de racha</span>
          </strong>
        </div>
        <p>
          {Object.entries(skillResults).some(
            ([, value]) => value.correct < value.total,
          )
            ? `Mañana daremos un poco más de cariño a ${Object.entries(skillResults).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)[0][0]}. Cada intento cuenta.`
            : `¡Gran práctica! ${Object.keys(skillResults).join(", ")}: hoy resolviste todos sus desafíos.`}
        </p>
        <button className="primary" onClick={() => onDone(result)}>
          Ver mi refugio
          <Icon name="arrow" />
        </button>
      </section>
    );
  if (!exercise || !skill)
    return (
      <section className="exercise-sheet">
        <h2>No hay preguntas disponibles.</h2>
        <p>El tutor puede activar una habilidad desde Admin.</p>
      </section>
    );
  const prompt = exercise.prompt
    .replace(/^Despeja x:\s*/, "")
    .replace(/^Convierte\s*/, "")
    .replace(/^(Balancea|Verifica y completa):?\s*/, "")
    .replace(/\. Escribe todos los coeficientes mínimos.*$/, "");
  return (
    <section className={`exercise-sheet ${solved ? "answer-success" : ""}`}>
      <div className="exercise-meta">
        <span className={`subject subject-${skill.subject}`}>
          <Icon name="book" size={17} />
          {skill.name}
        </span>
        <span>
          {index + 1} de 10{question.reinforced ? " · Repaso" : ""}
        </span>
      </div>
      <p className="active-time">
        Tiempo activo: {activeTime.seconds}s · A tu ritmo
      </p>
      <h2 className="question-instruction">
        {skill.family === "equations"
          ? "Encuentra el valor que falta"
          : skill.family === "units"
            ? "Cambia la unidad, conserva la cantidad"
            : skill.family === "chemistry"
              ? "Equilibra la reacción"
              : "Tu siguiente desafío"}
      </h2>
      <p
        className={`question-prompt ${prompt.length > 75 ? "long-prompt" : ""}`}
      >
        {skill.family === "chemistry"
          ? prompt
              .split(/(\d+)/)
              .map((part, i) =>
                /^\d+$/.test(part) ? <sub key={i}>{part}</sub> : part,
              )
          : prompt}
      </p>
      {exercise.image && (
        <ImageViewer src={exercise.image} alt={exercise.imageAlt} />
      )}
      <label className="answer-label" htmlFor="answer">
        {exercise.answerFormat === "coefficients"
          ? "Coeficientes, separados por comas"
          : "Tu respuesta"}
      </label>
      <div className="answer-wrap">
        <input
          ref={field}
          id="answer"
          readOnly
          inputMode="none"
          value={answer}
          aria-label="Respuesta"
          placeholder={
            exercise.answerFormat === "coefficients" ? "2,1,2" : "Escribe aquí…"
          }
          onSelect={capture}
          onClick={capture}
          onKeyDown={(event) => {
            if (/^[0-9.,/\-]$/.test(event.key)) {
              event.preventDefault();
              edit(event.key);
            } else if (event.key === "Backspace") {
              event.preventDefault();
              edit("back");
            } else if (event.key === "Delete") {
              event.preventDefault();
              edit("clear");
            } else if (event.key === "Enter") {
              event.preventDefault();
              if (solved) void advance();
              else void check();
            }
          }}
        />
        <button
          className="delete-key"
          aria-label="Borrar último carácter"
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => edit("back")}
          disabled={busy || solved}
        >
          <Icon name="erase" />
        </button>
      </div>
      {!solved && !review && (
        <div className="keypad" aria-label="Teclado de respuesta">
          {[
            "1",
            "2",
            "3",
            ",",
            "4",
            "5",
            "6",
            ".",
            "7",
            "8",
            "9",
            "-",
            "/",
            "0",
            "clear",
          ].map((key) => (
            <button
              className={`key ${["-", "/", "clear"].includes(key) ? "auxiliary" : ""} ${key === "clear" ? "clear-key" : ""}`}
              key={key}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => edit(key)}
              disabled={busy || coachBusy}
            >
              {key === "clear" ? "Limpiar" : key === "-" ? "−" : key}
            </button>
          ))}
        </div>
      )}
      {message && (
        <div className={`feedback ${solved ? "good" : ""}`} role="status">
          <Icon name={solved ? "check" : "bulb"} size={23} />
          <p>{message}</p>
        </div>
      )}
      {review && (
        <div className="worked-answer">
          <strong>Lo vemos juntos: {exercise.answer}</strong>
          <p>{exercise.hints[2]}</p>
        </div>
      )}
      {solved || review ? (
        <button
          className="primary"
          onClick={() => void advance()}
          disabled={busy || coachBusy}
        >
          {busy
            ? "Guardando…"
            : index === 9
              ? "Terminar misión"
              : "Siguiente paso"}
          <Icon name="arrow" />
        </button>
      ) : (
        <>
          <button
            className="primary"
            onClick={() => void check()}
            disabled={busy || coachBusy || !answer}
          >
            {busy ? "Guardando…" : "Comprobar"}
            <Icon name="check" />
          </button>
          <div className="question-options">
            <button
              className="quiet"
              disabled={busy || coachBusy}
              onClick={() => {
                setMessage(exercise.hints[Math.min(hint, 2)]);
                setHint((n) => Math.min(3, n + 1));
              }}
            >
              <Icon name="bulb" size={19} />
              Una pista{hint > 0 ? ` · ${hint}/3` : ""}
            </button>
            {wrong && (
              <button className="quiet" onClick={() => setReview(true)}>
                Ver solución y seguir
              </button>
            )}
          </div>
        </>
      )}
      <AICoach
        key={exercise.seed}
        onBusyChange={setCoachBusy}
        context={{
          sessionId,
          skillId: skill.id,
          seed: exercise.seed,
          level: exercise.level,
        }}
        onHelp={() => {
          setAiHelp(true);
          setHint((h) => Math.max(1, h));
        }}
      />
    </section>
  );
}
