"use client";
import {RefugeProp} from "./refuge-prop";
import {useCatLife} from "./use-cat-life";
import {rewardCopy, type CareReward} from "@/lib/engine/challenge";
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
  celebration=null,
  paused=false,
}: {
  cats: ShelterCat[];
  state?: ShelterState;
  compact?: boolean;
  feedingUnlocked?: boolean;
  today?:string;
  lastCare?:string|null;
  celebration?:{reward:CareReward;id:string}|null;
  paused?:boolean;
}) {
  const [selected, setSelected] = useState<ShelterCat | null>(null);
  const life=useCatLife(cats,(state?.beds??0)>0,selected?.id,paused,celebration);
  const energy=feedingUnlocked?100:careEnergy(state?.last_care_date??lastCare,today??new Date().toISOString().slice(0,10));
  return (
    <div ref={life}
      className={`room-world rescue-world painted-world ${compact ? "room-compact" : ""} ${feedingUnlocked ? "daily-cared" : "daily-waiting"} ${energy<85 ? "needs-care" : ""}`}
    >
      <Image className="room-illustration" src="/art/refuge-courtyard.webp" alt="Refugio de animales: patio soleado, enfermería, casitas de adopción y comedor" fill sizes="(max-width: 760px) 100vw, 95vw" priority />
      {!compact && <div className="refuge-greeting"><h1>Hola, Laura</h1><p>{feedingUnlocked ? "Un ratito más, un paso más." : "Lo que hoy practicas, mañana será más fácil."}</p></div>}
      <div className="world-atmosphere" aria-hidden="true"><span/><span/><span/></div>
      <div className="shelter-objects" aria-label="Objetos de los gatos">
       <div className="cat-ball"><RefugeProp kind="ball" label="Pelota de tela para los gatos"/></div>
       <div className="courtyard-scratcher"><RefugeProp kind="scratcher" label="Rascador del patio"/></div>
       <div className="courtyard-basket"><RefugeProp kind="basket" label="Cesta de mantas del refugio"/></div>
       {(state?.beds??0)>0 && <div className={`cat-bed ${celebration?.reward==='bed'?'gift-arrival':''}`}><RefugeProp kind="bed" label="Camita ganada"/></div>}
       {(state?.boxes??0)>0 && <div className={`cat-box ${celebration?.reward==='box'?'gift-arrival':''}`}><RefugeProp kind="box" label="Caja de Milo"/></div>}
       {(state?.food??0)>0 && <div className={`cat-bowl ${celebration?.reward==='food'?'gift-arrival':''}`}><RefugeProp kind="food" label="Comida ganada"/></div>}
       {(state?.treats??0)>0 && <div className={`cat-treat ${celebration?.reward==='treat'?'gift-arrival':''}`} role="img" aria-label="Galletita ganada"/>}
      </div>
      <div className="room-cats">
        {cats.map((cat, index) => (
          <button
            key={cat.id} data-cat-id={cat.id} data-pose="idle"
            className={`room-cat cat-${index % 6} personality-${cat.personality.normalize("NFD").replace(/[\u0300-\u036f]/g,"")} ${selected?.id === cat.id ? "patted" : ""}`}
            data-track={`cat_${cat.id}`} aria-label={`Conocer a ${cat.name}`}
            onClick={() => {
              setSelected(cat);
            }}
          >
            <div className="cat-facing"><CatArt
              body={cat.palette.body}
              belly={cat.palette.belly}
            /></div>
            <i className="cat-reaction" aria-hidden="true"><Icon name="heart" size={20}/></i>
            <span>
              {cat.name}

            </span>
          </button>
        ))}
      </div>
      {celebration && <div key={celebration.id} className="reward-note" role="status"><Icon name="paw"/><span>{rewardCopy[celebration.reward].delivered}</span></div>}
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
          <p>{selected.story}</p><p className="cat-wellbeing">{feedingUnlocked ? "El cuidado del refugio ya está listo por hoy." : "Espera tus cuidados de hoy. Logra el reto para ayudarle."}</p>{energy<100&&<small>Energía: {energy}/100. El reto logrado la recupera.</small>}
        </div>
      )}
    </div>
  );
}
