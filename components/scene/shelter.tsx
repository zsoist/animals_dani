"use client";
import { useState } from "react";
import type { ShelterCat } from "@/lib/data/shelter";
import type { ShelterState } from "@/lib/engine/types";
import { CatArt } from "./cat-art";
import { Icon } from "@/components/game/icons";
import { care } from "@/lib/data/actions";
export function Shelter({
  cats,
  state,
  onCare,
  compact = false,
}: {
  cats: ShelterCat[];
  state?: ShelterState;
  onCare?: (state: ShelterState) => void;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<ShelterCat | null>(null);
  const [activity, setActivity] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [lights, setLights] = useState(true);
  async function interact(action: "play" | "feed" | "clean") {
    if (busy) return;
    setBusy(true);
    setActivity(action);
    setMessage(
      action === "play"
        ? "¡A perseguir la pelota!"
        : action === "clean"
          ? "Una zona limpia para descansar."
          : "¡Todos al comedor!",
    );
    try {
      onCare?.(await care(action));
    } catch {
      setMessage(
        "No pudimos guardar el cuidado. Toca para volver a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className={`room-world rescue-world ${compact ? "room-compact" : ""} activity-${activity} ${lights ? "" : "evening"}`}
    >
      <svg
        className="room-illustration"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Centro de rescate: patio de juegos, enfermería, casitas de adopción y comedor"
      >
        <defs>
          <pattern
            id="rescue-tiles"
            width="90"
            height="70"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 70h90M45 0v70"
              fill="none"
              stroke="#087a8840"
              strokeWidth="2"
            />
          </pattern>
        </defs>
        <path fill="#16bccc" d="M0 0h1000v700H0z" />
        <path fill="#0a798b" d="M0 0h1000v95H0z" />
        <path
          fill="#12a6b6"
          d="m0 95 120 35v290L0 505zm1000 0-120 35v290l120 85z"
        />
        <path fill="#dcebbd" d="M120 398h760l120 106v196H0V504z" />
        <path fill="url(#rescue-tiles)" d="M120 398h760l120 106v196H0V504z" />
        <g stroke="#173c55" strokeWidth="5" strokeLinejoin="round">
          <rect
            x="340"
            y="110"
            width="320"
            height="295"
            rx="100"
            fill="#f8f2d5"
          />
          <path
            d="M355 223q0-98 99-98h90q101 0 101 98v170H355z"
            fill="#59cffa"
          />
          <circle cx="581" cy="189" r="29" fill="#ffcb20" stroke="none" />
          <path
            d="M355 316q67-90 152-9 86-68 138 5v81H355z"
            fill="#43b745"
            stroke="none"
          />
          <path
            d="M355 356q169-72 290-9v46H355z"
            fill="#229b51"
            stroke="none"
          />
          <path
            d="M374 395V282m37 113V282m37 113V282m37 113V282m37 113V282m37 113V282m37 113V282m37 113V282m-263 23h263m-263 58h263"
            stroke="#fff1be"
            strokeWidth="10"
          />
          <rect x="342" y="388" width="315" height="21" rx="7" fill="#efa831" />
          <g transform="translate(73 196)">
            <rect width="210" height="203" rx="17" fill="#faf5dc" />
            <path d="M0 51h210" />
            <rect
              x="68"
              y="-27"
              width="77"
              height="61"
              rx="10"
              fill="#ee4939"
            />
            <path d="M106-14v33M89 2h34" stroke="white" strokeWidth="12" />
            <rect x="20" y="76" width="68" height="49" rx="7" fill="#17adbf" />
            <rect x="109" y="76" width="80" height="49" rx="7" fill="#ffbd19" />
            <path d="M29 156h155m-155 19h155" stroke="#90b3b0" />
          </g>
          <g transform="translate(718 169)">
            <rect x="0" y="0" width="210" height="238" rx="14" fill="#12647f" />
            <path d="M0 115h210" stroke="#f6bd26" strokeWidth="10" />
            {[0, 1].map((n) => (
              <g key={n} transform={`translate(${n * 99 + 12} 16)`}>
                <path
                  d="M0 36 43 7l43 29v56H0z"
                  fill={n ? "#ff9c23" : "#f25a42"}
                />
                <path d="M24 92V57q19-24 38 0v35" fill="#164459" />
              </g>
            ))}
            <rect
              x="19"
              y="143"
              width="76"
              height="71"
              rx="13"
              fill="#febd27"
            />
            <rect
              x="115"
              y="143"
              width="76"
              height="71"
              rx="13"
              fill="#9164ea"
            />
            <path
              d="M36 158v41m16-41v41m16-41v41m64-41v41m16-41v41m16-41v41"
              stroke="#173c55"
            />
          </g>
          <g transform="translate(26 456)">
            <ellipse
              cx="118"
              cy="112"
              rx="114"
              ry="28"
              fill="#62927233"
              stroke="none"
            />
            <path d="M0 30 102-32l105 62v85H0z" fill="#f86c29" />
            <path
              d="m-12 35 114-76 118 76"
              fill="none"
              stroke="#ffcd36"
              strokeWidth="20"
            />
            <path d="M59 114V61q43-55 84 0v53" fill="#214c61" />
            <rect x="84" y="-16" width="38" height="25" rx="6" fill="#fff4dc" />
          </g>
          <ellipse
            cx="499"
            cy="510"
            rx="234"
            ry="87"
            fill="#119eae"
            stroke="none"
          />
          <ellipse
            cx="499"
            cy="510"
            rx="207"
            ry="64"
            fill="none"
            stroke="#42c3c5"
            strokeDasharray="12 12"
          />
          <g transform="translate(774 486)">
            <path d="M36 81V-15m64 96V-87" stroke="#daa537" strokeWidth="20" />
            <rect
              x="65"
              y="-108"
              width="90"
              height="28"
              rx="13"
              fill="#7745cb"
            />
            <rect y="-23" width="73" height="27" rx="12" fill="#ffbf20" />
            <path d="M90-79v31" />
            <circle cx="90" cy="-31" r="15" fill="#f45639" />
            <rect x="5" y="74" width="153" height="29" rx="14" fill="#7443bd" />
          </g>
          <g transform="translate(321 622)">
            <path d="M0 0h99l-12 36H12z" fill="#ffab24" />
            <ellipse cx="49" rx="49" ry="14" fill="#694633" />
            {Boolean(state?.food) && (
              <path
                d="m22-3 11 3m15-4 10 2m9-4 10 5"
                stroke="#d9a656"
                strokeWidth="7"
              />
            )}
            <path d="M130 0h99l-12 36h-75z" fill="#1879d6" />
            <ellipse cx="179" rx="49" ry="14" fill="#5fd8ed" />
          </g>
        </g>
        <g
          fill="#fff5d9"
          fontFamily="Nunito, sans-serif"
          fontWeight="800"
          textAnchor="middle"
        >
          <text x="500" y="60" fontSize="35">
            REFUGIO · CENTRO DE RESCATE
          </text>
          <text x="179" y="176" fontSize="20">
            CUIDADOS
          </text>
          <text x="821" y="143" fontSize="20">
            ADOPCIONES
          </text>
        </g>
      </svg>
      <div className="room-name">
        <Icon name="paw" size={18} /> {cats.length} amigos a salvo
      </div>
      <div className="room-cats">
        {cats.map((cat, index) => (
          <button
            key={cat.id}
            className={`room-cat cat-${index % 6} ${selected?.id === cat.id ? "patted" : ""}`}
            aria-label={`Conocer a ${cat.name}`}
            onClick={() => {
              setSelected(cat);
              setActivity("");
            }}
          >
            <CatArt
              body={cat.palette.body}
              belly={cat.palette.belly}
              sleeping={cat.personality === "dormilón" && activity !== "play"}
            />
            <span>
              {cat.name}
              <Icon name="heart" size={12} />
            </span>
          </button>
        ))}
      </div>
      {activity === "play" && (
        <div key={message} className="play-ball" aria-hidden="true" />
      )}
      {activity === "clean" && (
        <div className="clean-sparkles" aria-hidden="true">
          <Icon name="star" />
          <Icon name="star" />
          <Icon name="star" />
        </div>
      )}
      <div className="care-controls" aria-label="Cuidar el refugio">
        <button disabled={busy} onClick={() => void interact("feed")}>
          <Icon name="bowl" />
          Comedor
        </button>
        <button disabled={busy} onClick={() => void interact("play")}>
          <Icon name="star" />
          Jugar
        </button>
        <button disabled={busy} onClick={() => void interact("clean")}>
          <Icon name="heart" />
          Limpiar
        </button>
        <button onClick={() => setLights((v) => !v)} aria-pressed={!lights}>
          <Icon name="bulb" />
          {lights ? "Noche" : "Día"}
        </button>
      </div>
      {message && (
        <p className="care-message" role="status">
          {message}
        </p>
      )}
      {selected && (
        <div
          className="cat-story"
          role="dialog"
          aria-label={`Historia de ${selected.name}`}
        >
          <button
            className="icon-button"
            aria-label="Cerrar historia"
            onClick={() => setSelected(null)}
          >
            <Icon name="close" />
          </button>
          <strong>{selected.name} te saluda</strong>
          <span>{selected.personality}</span>
          <p>{selected.story}</p>
        </div>
      )}
    </div>
  );
}
