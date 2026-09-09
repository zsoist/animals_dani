"use client";
import {careEnergy} from "@/lib/engine/care";
import Image from "next/image";
import { useState } from "react";
import type { ShelterCat } from "@/lib/data/shelter";
import type { ShelterState } from "@/lib/engine/types";
import { CatArt } from "./cat-art";
import { Icon } from "@/components/game/icons";

export function Shelter({
  cats,
  state,
  compact = false,
  feedingUnlocked = false,
  today,
  lastCare,
}: {
  cats: ShelterCat[];
  state?: ShelterState;
  compact?: boolean;
  feedingUnlocked?: boolean;
  today?:string;
  lastCare?:string|null;
}) {
  const [selected, setSelected] = useState<ShelterCat | null>(null);
  const energy=feedingUnlocked?100:careEnergy(state?.last_care_date??lastCare,today??new Date().toISOString().slice(0,10));
  return (
    <div
      className={`room-world rescue-world painted-world ${compact ? "room-compact" : ""} ${feedingUnlocked ? "daily-cared" : "daily-waiting"} ${energy<85 ? "needs-care" : ""}`}
    >
      <Image className="room-illustration" src="/art/refuge-courtyard.webp" alt="Refugio de animales: patio soleado, enfermería, casitas de adopción y comedor" fill sizes="(max-width: 760px) 100vw, 95vw" priority />
      <div className="world-atmosphere" aria-hidden="true"><span/><span/><span/></div>
      <div className="room-cats">
        {cats.map((cat, index) => (
          <button
            key={cat.id}
            className={`room-cat cat-${index % 6} personality-${cat.personality.normalize("NFD").replace(/[\u0300-\u036f]/g,"")} ${selected?.id === cat.id ? "patted" : ""}`}
            data-track={`cat_${cat.id}`} aria-label={`Conocer a ${cat.name}`}
            onClick={() => {
              setSelected(cat);
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
          </button>
        ))}
      </div>
      {feedingUnlocked && <div className="daily-gift" aria-label="Cuidado entregado hoy">{(state?.boxes ?? 0)>0 ? <span className="milo-box" aria-label="Caja de Milo"/> : <span aria-label="Comida de Milo"><Icon name="bowl" size={34}/></span>}</div>}
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
          <div className="story-portrait"><CatArt body={selected.palette.body} belly={selected.palette.belly}/></div>
          <strong>{selected.name} te saluda</strong>
          <span>{selected.personality}</span>
          <p>{selected.story}</p><p className="cat-wellbeing">{feedingUnlocked ? "El cuidado del refugio ya está listo por hoy." : "Espera tus cuidados de hoy. Completa el reto para ayudarle."}</p>{energy<100&&<small>Energía: {energy}/100. El reto completo la recupera.</small>}
        </div>
      )}
    </div>
  );
}
