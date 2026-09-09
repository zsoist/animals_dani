import Link from "next/link";
import { requireTutor } from "@/lib/data/session";
import { getTutorSummary } from "@/lib/data/student";
import { signOut } from "@/lib/data/auth";
import { band, visibleStreak, dayKey } from "@/lib/engine/mastery";
import { SkillEditor, NoteForm } from "@/components/tutor/skill-editor";
import { AIInsights } from "@/components/tutor/ai-insights";
import { aiOverview } from "@/lib/data/ai";
import { Icon } from "@/components/game/icons";
export default async function Tutor() {
  await requireTutor();
  const data = await getTutorSummary();
  const ai = await aiOverview(data.userId);
  const completed = data.sessions.filter((s) => s.completed);
  const streak = data.streaks[0];
  const now = new Date().getTime();
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Icon name="paw" />
          </span>
          refugio.
        </Link>
        <nav>
          <Link className="secondary" href="/">
            <Icon name="home" size={19} />
            Ver refugio
          </Link>
          <form action={signOut}>
            <button className="quiet">Salir</button>
          </form>
        </nav>
      </header>
      <div className="admin-heading">
        <div>
          <h1>Diseña su próxima aventura</h1>
          <p>
            Un tema al día. Tus materiales, sus desafíos y todo su progreso.
          </p>
        </div>
        <a href="#new-skill" className="primary">
          <Icon name="plus" />
          Nueva habilidad
        </a>
      </div>
      <nav className="admin-sections">
        <a href="#new-skill">Crear práctica · PDF / IA</a>
        <a href="#catalog">Editar habilidades</a>
        <a href="#progress">Ver progreso</a>
      </nav>
      <section
        id="progress"
        className="admin-stats"
        aria-label="Resumen de práctica"
      >
        {[
          ["Misiones completadas", completed.length],
          ["Días practicados", new Set(completed.map((s) => s.date)).size],
          [
            "Racha actual",
            streak ? `${visibleStreak(streak, dayKey())} días` : "0 días",
          ],
          ["Mejor racha", `${streak?.best ?? 0} días`],
          ["Intentos", data.attempts.length],
          [
            "Tiempo de práctica",
            `${Math.round(completed.reduce((n, s) => n + s.duration_ms, 0) / 60000)} min`,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <AIInsights
        initial={ai.report}
        memory={ai.memory}
        messages={ai.messages}
      />
      <section id="catalog" className="admin-catalog">
        <h2>
          Habilidades de práctica <span>{data.skills.length}</span>
        </h2>
        <p>
          Abre una habilidad para editar sus preguntas, prioridad, dificultad y
          notas.
        </p>
        {data.skills.map((skill) => {
          const attempts = data.attempts.filter((a) => a.skill_id === skill.id);
          const hits = attempts.filter((a) => a.correct);
          const fails = attempts.filter((a) => !a.correct);
          const mastery = data.mastery.find((m) => m.skill_id === skill.id);
          const counts = fails.reduce<Record<string, number>>((acc, a) => {
            const key = a.error_type ?? "UNKNOWN";
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
          }, {});
          const dominant = Object.entries(counts).sort(
            (a, b) => b[1] - a[1],
          )[0];
          const recent = attempts.filter(
            (a) => now - Date.parse(a.created_at) < 7 * 86400000,
          );
          const previous = attempts.filter(
            (a) =>
              now - Date.parse(a.created_at) >= 7 * 86400000 &&
              now - Date.parse(a.created_at) < 14 * 86400000,
          );
          const accuracy = (list: typeof attempts) =>
            list.length
              ? Math.round(
                  (list.filter((a) => a.correct).length / list.length) * 100,
                )
              : 0;
          const delta = accuracy(recent) - accuracy(previous);
          return (
            <details className="admin-skill" key={skill.id}>
              <summary>
                <Icon name="book" />
                <div>
                  <strong>{skill.name}</strong>
                  <span>
                    {skill.family === "custom"
                      ? `${skill.questions?.length ?? 0} preguntas propias`
                      : "Ejercicios automáticos"}{" "}
                    · {band(mastery?.mastery_score ?? 0)}
                  </span>
                </div>
                <span
                  className={skill.active ? "active-label" : "inactive-label"}
                >
                  {skill.active ? "Activa" : "Pausada"}
                </span>
                <b>
                  {attempts.length ? `${accuracy(attempts)}%` : "Sin práctica"}
                </b>
                <Icon name="plus" size={20} />
              </summary>
              <div className="admin-skill-body">
                <div className="skill-metrics">
                  <span>
                    Nivel{" "}
                    <b>{mastery?.current_level ?? skill.base_difficulty}</b>
                  </span>
                  <span>
                    Dominio <b>{Math.round(mastery?.mastery_score ?? 0)}/100</b>
                  </span>
                  <span>
                    Respuesta media{" "}
                    <b>
                      {attempts.length
                        ? `${Math.round(attempts.reduce((n, a) => n + a.response_ms, 0) / attempts.length / 1000)} s`
                        : "—"}
                    </b>
                  </span>
                  <span>
                    Frecuencia{" "}
                    <b>
                      {
                        new Set(attempts.map((a) => a.created_at.slice(0, 10)))
                          .size
                      }{" "}
                      días
                    </b>
                  </span>
                </div>
                <div className="insights">
                  <h3>Qué observar</h3>
                  {!attempts.length && (
                    <p>
                      Aún no hay intentos. Los datos aparecerán cuando Laura
                      practique.
                    </p>
                  )}
                  {recent.length > 0 && previous.length > 0 && (
                    <p>
                      Últimos 7 días: {delta >= 0 ? "+" : ""}
                      {delta} puntos de acierto frente a la semana anterior.
                    </p>
                  )}
                  {dominant && (
                    <p>
                      {dominant[1] / fails.length >= 0.4
                        ? "Error dominante"
                        : "Error más frecuente"}
                      : <b>{dominant[0]}</b> · {dominant[1]} de {fails.length}{" "}
                      errores.
                    </p>
                  )}
                  {hits.length > 0 &&
                    hits.filter((a) => a.hint_level > 0).length / hits.length >=
                      0.5 && (
                      <p>
                        Al menos la mitad de los aciertos necesitó pistas.
                        Conviene repetir con menos ayuda.
                      </p>
                    )}
                  {mastery &&
                    mastery.mastery_score >= 60 &&
                    mastery.mastery_score < 75 &&
                    new Set(
                      attempts
                        .filter((a) => a.level === mastery.current_level)
                        .map((a) => a.created_at.slice(0, 10)),
                    ).size >= 5 && (
                      <p>
                        Lleva al menos 5 días practicados en este nivel:
                        conviene revisar el procedimiento juntos.
                      </p>
                    )}
                  <div className="weekly-trend">
                    {[2, 1, 0].map((week) => {
                      const list = attempts.filter((a) => {
                        const age = now - Date.parse(a.created_at);
                        return (
                          age >= week * 7 * 86400000 &&
                          age < (week + 1) * 7 * 86400000
                        );
                      });
                      return (
                        <span key={week}>
                          {week === 0
                            ? "Esta semana"
                            : `Hace ${week} ${week === 1 ? "semana" : "semanas"}`}
                          <b>
                            {list.length ? `${accuracy(list)}%` : "Sin datos"}
                          </b>
                        </span>
                      );
                    })}
                  </div>
                  {fails.slice(0, 4).map((a) => (
                    <div className="attempt-example" key={a.id}>
                      <strong>{a.prompt_text}</strong>
                      <p>
                        Respondió: {a.given_answer} · Esperado:{" "}
                        {a.expected_answer}
                      </p>
                      <small>{a.error_type ?? "UNKNOWN"}</small>
                    </div>
                  ))}
                </div>
                <SkillEditor skill={skill} />
                <h3>Notas del tutor</h3>
                {data.notes
                  .filter((n) => n.skill_id === skill.id)
                  .map((n) => (
                    <p className="saved-note" key={n.id}>
                      {n.body}
                    </p>
                  ))}
                <NoteForm skillId={skill.id} userId={data.userId} />
              </div>
            </details>
          );
        })}
      </section>
      <section className="new-skill-section" id="new-skill">
        <h2>Crea su próxima aventura</h2>
        <p>
          Escribe tus problemas y pistas o usa uno de los tres generadores
          disponibles.
        </p>
        <SkillEditor />
      </section>
    </main>
  );
}
