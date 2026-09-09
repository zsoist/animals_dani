"use client";
import { useState } from "react";
import type { ShelterCat } from "@/lib/data/shelter";
import type { ShelterState } from "@/lib/engine/types";
import { CatArt } from "./cat-art";
import { Icon } from "@/components/game/icons";
export function Shelter({
  cats,
  state,
  compact = false,
}: {
  cats: ShelterCat[];
  state?: ShelterState;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<ShelterCat | null>(null);
  const [patted, setPatted] = useState<string | null>(null);
  return (
    <div className={`room-world ${compact ? "room-compact" : ""}`}>
      <svg
        className="room-illustration"
        viewBox="0 0 1000 650"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Refugio ilustrado con jardín, sofá coral, camas y comederos para los gatos"
      >
        <defs>
          <pattern
            id="floorboards"
            width="180"
            height="82"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 81h180M80 0v81" stroke="#d5ad8238" strokeWidth="3" />
          </pattern>
        </defs>
        <path fill="#c0e5df" d="M0 0h1000v650H0Z" />
        <path fill="#90c9c2" d="m0 0 175 40v355L0 485Z" />
        <path fill="#a6d5cb" d="m1000 0-140 40v355l140 90Z" />
        <path fill="#f6d3a0" d="M175 382h685l140 102v166H0V484Z" />
        <path fill="url(#floorboards)" d="M175 390h685l140 94v166H0V484Z" />
        <path
          d="M0 475 175 377h685l140 98"
          fill="none"
          stroke="#587a7555"
          strokeWidth="9"
        />
        <g stroke="#43576b" strokeWidth="4" strokeLinejoin="round">
          <rect
            x="393"
            y="74"
            width="260"
            height="238"
            rx="62"
            fill="#fff5d8"
          />
          <path
            d="M410 147q0-58 58-58h108q59 0 59 58v146H410Z"
            fill="#88d9ee"
          />
          <circle cx="589" cy="132" r="28" fill="#ffe398" stroke="none" />
          <path
            d="M410 231q62-72 125 5 50-62 100-16v73H410Z"
            fill="#89bc7c"
            stroke="none"
          />
          <path
            d="M410 268q102-69 225-3v28H410Z"
            fill="#63a68a"
            stroke="none"
          />
          <path d="M522 87v211m-112-95h225" stroke="#fff5d8" strokeWidth="12" />
          <rect x="380" y="303" width="289" height="18" rx="8" fill="#fff5d8" />
          <path d="M360 72q22 65-8 179l44-5 11-175Z" fill="#ed9697" />
          <path d="M657 70q-20 88 11 180l40 1q-35-130-26-180Z" fill="#ed9697" />
          <path d="M346 65h359" strokeWidth="8" />
          <g transform="translate(201 117) rotate(-5)">
            <rect width="123" height="96" rx="12" fill="#e9b762" />
            <rect x="10" y="10" width="103" height="76" rx="6" fill="#fff3d8" />
            <path
              d="m46 37-3-11 14 6 14-6-2 12q17 28-12 30-29-2-11-31Z"
              fill="#e9b762"
            />
            <path d="m50 48 2 0m14 0 2 0" strokeLinecap="round" />
          </g>
          <g transform="translate(715 106)">
            <path d="M0 82h109" strokeWidth="10" />
            <path
              d="M11 79V37h18v42m6 0V24h20v55m8 0V32h16v47"
              fill="#f4d078"
            />
            <path d="M78 78q-14-35 9-33 25 0 17 33Z" fill="#ec9395" />
            <path
              d="M93 43V6m0 19Q65-2 67 17q3 12 26 14m0-7q23-29 22-6-2 10-22 13"
              fill="#62a587"
            />
          </g>
          <g transform="translate(53 325)">
            <ellipse
              cx="100"
              cy="156"
              rx="108"
              ry="24"
              fill="#61767222"
              stroke="none"
            />
            <rect
              x="24"
              y="0"
              width="167"
              height="118"
              rx="37"
              fill="#e99291"
            />
            <path
              d="M38 19q9-7 23-5h95q15-1 21 14"
              fill="none"
              stroke="#f3b3aa"
              strokeWidth="7"
            />
            <rect x="5" y="78" width="207" height="59" rx="24" fill="#e89087" />
            <rect x="0" y="58" width="35" height="78" rx="15" fill="#efa69b" />
            <rect
              x="180"
              y="58"
              width="35"
              height="78"
              rx="15"
              fill="#efa69b"
            />
            <path d="M35 139v17m148-17v17" strokeWidth="12" />
            <rect
              x="64"
              y="62"
              width="67"
              height="51"
              rx="13"
              transform="rotate(-12 100 85)"
              fill="#ffe39b"
            />
          </g>
          <g transform="translate(774 319)">
            <path
              d="M35 115v-100m63 100v-185"
              stroke="#ae875d"
              strokeWidth="22"
            />
            <rect
              x="62"
              y="-91"
              width="87"
              height="30"
              rx="13"
              fill="#f5d589"
            />
            <rect x="0" y="-27" width="76" height="29" rx="12" fill="#e3bdeb" />
            <path d="M75-60v37" />
            <circle cx="75" cy="-11" r="12" fill="#ec9796" />
            <rect
              x="-5"
              y="94"
              width="159"
              height="33"
              rx="14"
              fill="#a892be"
            />
          </g>
          <ellipse
            cx="518"
            cy="507"
            rx="242"
            ry="91"
            fill="#65b7b4"
            stroke="none"
          />
          <ellipse
            cx="518"
            cy="507"
            rx="213"
            ry="72"
            fill="none"
            stroke="#a3d7c4"
            strokeWidth="4"
            strokeDasharray="13 9"
          />
          <g transform="translate(739 510)">
            <ellipse cx="77" cy="33" rx="81" ry="20" fill="#bcb5df" />
            <path d="M0 32q12-66 76-57 67-9 83 57" fill="#c9c1e9" />
            <ellipse
              cx="78"
              cy="25"
              rx="61"
              ry="17"
              fill={state?.blankets ? "#f3ac9d" : "#aaa0ce"}
            />
          </g>
          <g transform="translate(166 568)">
            <path d="M0 0h82l-9 34H9Z" fill="#f0a17f" />
            <ellipse
              cx="41"
              cy="0"
              rx="40"
              ry="12"
              fill={state?.food ? "#a36c44" : "#d78b6f"}
            />
            {Boolean(state?.food) && (
              <path
                d="m19-3 5-3m12 8 6-2m12-5 6 2m-37 7 7 1"
                stroke="#f4cd8e"
                strokeWidth="6"
              />
            )}
            <path d="M105 0h82l-9 34h-64Z" fill="#77bdca" />
            <ellipse cx="146" cy="0" rx="40" ry="12" fill="#b9e7ec" />
          </g>
          <g transform="translate(852 193)">
            <path d="M21 154V25" strokeWidth="7" />
            <path
              d="M-12 48 0 0h45l12 48Z"
              fill={state?.lamps ? "#ffda70" : "#fff1bc"}
            />
            <path d="M-3 154h50" strokeWidth="10" />
          </g>
        </g>
        <g fill="#fff4d5" opacity=".8">
          <path d="m291 89 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" />
          <path d="m706 355 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" />
        </g>
      </svg>
      <div className="room-name">
        <Icon name="paw" size={18} /> Club de los gatos
      </div>
      <div className="room-cats">
        {cats.map((cat, index) => (
          <button
            key={cat.id}
            className={`room-cat cat-${index % 6} ${patted === cat.id ? "patted" : ""}`}
            aria-label={`Conocer a ${cat.name}`}
            onClick={() => {
              setSelected(cat);
              setPatted(cat.id);
            }}
          >
            <CatArt
              body={cat.palette.body}
              belly={cat.palette.belly}
              sleeping={cat.personality === "dormilón"}
            />
            <span>
              {cat.name}
              <Icon name="heart" size={12} />
            </span>
            {patted === cat.id && (
              <i className="pet-heart">
                <Icon name="heart" />
              </i>
            )}
          </button>
        ))}
      </div>
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
          <span>
            {selected.personality} · En tu refugio desde{" "}
            {new Date(selected.unlockedAt).toLocaleDateString("es", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <p>{selected.story}</p>
        </div>
      )}
    </div>
  );
}
