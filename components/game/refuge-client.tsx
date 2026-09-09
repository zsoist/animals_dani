"use client";
import { useEffect, useState } from "react";
import {track} from "@/components/telemetry/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatArt } from "@/components/scene/cat-art";
import { Shelter } from "@/components/scene/shelter";
import type { ShelterCat } from "@/lib/data/shelter";
import type {
  Mastery,
  Skill,
  Question,
  ShelterState,
  Streak,
} from "@/lib/engine/types";
import { startMission } from "@/lib/data/actions";
import { Practice } from "./practice";
import { Icon } from "./icons";



export function RefugeClient({
  cats,
  skills,
  queue,
  state,
  streak,
  userId,
  practiceDates,
  today,
  masteries,
}: {
  cats: ShelterCat[];
  skills: Skill[];
  queue: Question[];
  state: ShelterState;
  streak: Streak;
  userId: string;
  practiceDates: string[];
  today: string;
  masteries: Mastery[];
}) {
  const router = useRouter();
  const topic = skills.find((s) => s.id === queue[0]?.skillId);
  const [session, setSession] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [view, setView] = useState<"home" | "skills" | "cats">("home");
  const [liveState, setLiveState] = useState(state);
  const [liveCats, setLiveCats] = useState(cats);
  const [liveStreak, setLiveStreak] = useState(streak);
  const [dates, setDates] = useState(practiceDates);
  useEffect(() => {
    if (!session) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [session]);
  const milestone =
    step < 1
      ? "Una nueva aventura"
      : step < 3
        ? "Cada paso cuenta"
        : step < 5
          ? "Paso a paso"
          : step < 7
            ? "Preparando el comedor"
            : step < 10
              ? "Unos pasos más"
              : "¡Reto completado!";
  const begin = async () => {
    setBusy(true);
    setError("");
    try {
      const id = await startMission();
      track("mission_started",{}, {sessionId:id,skillId:topic?.id});
      setSession(id);
      setStep(0);
      window.scrollTo({ top: 0 });
    } catch {
      setError("No pudimos iniciar la misión. Vuelve a intentarlo.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className={`game-shell ${session ? "is-playing" : ""}`}>
      <header className="game-header" inert={Boolean(session)}>
        <Link href="/" className="brand" aria-label="Refugio, inicio">
          <span className="brand-mark">
            <Icon name="paw" size={25} />
          </span>

        </Link>
        <div className="header-actions">
          <span
            className="streak-chip"
            aria-label={`${liveStreak.current} ${liveStreak.current === 1 ? "día" : "días"} de racha`}
          >
            <Icon name="fire" size={22} />
            <b>{liveStreak.current}</b>

          </span>
          <Link href="/tutor" className="admin-link">
            <Icon name="gear" size={17} />
            Admin
          </Link>
        </div>
      </header>
      <div className="game-content">
        <div className="world-column" inert={Boolean(session)}>
          {session && (
            <div className="mission-track">
              <div>
                <Icon name="paw" />
                <strong>{milestone}</strong>
                <span>{Math.min(step, 10)}/10</span>
              </div>
              <div
                className="mission-dots"
                aria-label={`${step} de 10 pasos completados`}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} className={i < step ? "filled" : ""} />
                ))}
              </div>
            </div>
          )}
          <Shelter today={today} lastCare={liveStreak.last_session_date} feedingUnlocked={dates.includes(today)} cats={liveCats} state={liveState} />
          {!session && (
            <>
              <nav className="world-tabs" aria-label="Explorar el refugio">
                {(
                  [
                    { id: "home", label: "Mi refugio", icon: "home" },
                    { id: "cats", label: "Mis gatos", icon: "paw" },
                    { id: "skills", label: "Mis habilidades", icon: "book" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    className={view === item.id ? "selected" : ""}
                    data-track={`view_${item.id}`} onClick={() => setView(item.id)}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </button>
                ))}
              </nav>
              {view === "cats" && (
                <section className="collection">
                  <h2>Tu pequeña familia</h2>
                  <div className="cat-list">
                    {liveCats.map((cat) => (
                      <article key={cat.id}><CatArt body={cat.palette.body} sleeping={cat.personality==="dormilón"}/>
                        <strong>{cat.name}</strong>
                        <span>{cat.personality}</span>
                        <p>{cat.story}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              {view === "skills" && (
                <section className="skill-map">
                  <h2>Cada día, un poquito más fácil</h2>
                  {skills.map((skill) => {
                    const mastery = masteries.find(
                      (m) => m.skill_id === skill.id,
                    );
                    return (
                      <div className="skill-row" key={skill.id}>
                        <Icon name="book" />
                        <div>
                          <strong>{skill.name}</strong>
                          <span>
                            Nivel{" "}
                            {(mastery?.current_level ?? skill.base_difficulty)-1} ·{" "}
                            {mastery?.attempts_total ?? 0} intentos
                          </span>
                          <progress
                            max={100}
                            value={mastery?.mastery_score ?? 0}
                          />
                        </div>
                        <b>{Math.round(mastery?.mastery_score ?? 0)}%</b>
                      </div>
                    );
                  })}
                </section>
              )}
            </>
          )}
        </div>
        <div
          className="action-column"
          role={session ? "dialog" : undefined}
          aria-modal={session ? true : undefined}
          aria-label={session ? "Práctica del día" : undefined}
        >
          {session && (
            <button className="practice-close" onClick={() => {track("mission_left",{step},{sessionId:session});setSession(null);}}>
              <Icon name="close" />
              Volver al refugio
            </button>
          )}
          {session ? (
            <Practice
              key={session}
              sessionId={session}
              queue={queue}
              skills={skills}
              userId={userId}
              onStep={setStep}
              onReward={setLiveState}
              onDone={(result) => {
                setLiveStreak(result.streak);
                setDates((previous) => [...previous, today]);
                if (result.cat)
                  setLiveCats((previous) =>
                    previous.some((c) => c.id === result.cat?.id)
                      ? previous
                      : [...previous, result.cat!],
                  );
                setSession(null);
                router.refresh();
              }}
            />
          ) : (
            <>
              <section className="mission-invite">
                <div className="mission-icon">
                  <Icon name="star" size={30} />
                </div>
                <h2>{topic?.name ?? "Prepara una aventura"}</h2>
                <p>
                  {dates.includes(today) ? "Tus gatos ya recibieron su cuidado de hoy." : "Diez pasos para cuidar a tus gatos."}
                </p>
                <div className="mission-perks">
                  <span>
                    <Icon name="book" size={18} />
                    10 desafíos
                  </span>
                  <span>
                    <Icon name="heart" size={18} />A tu ritmo
                  </span>
                </div>
                <button
                  className="primary"
                  onClick={() => void begin()}
                  disabled={busy || queue.length === 0 || dates.includes(today)}
                >
                  {busy ? "Preparando…" : dates.includes(today) ? "¡Reto de hoy completo!" : "Empezar reto"}
                  <Icon name="arrow" />
                </button>
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                {queue.length === 0 && (
                  <p>Activa una habilidad desde Admin para empezar.</p>
                )}
              </section>


            </>
          )}
        </div>
      </div>
    </main>
  );
}
