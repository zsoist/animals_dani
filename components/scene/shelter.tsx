"use client";
import Image from "next/image";
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
  const [interaction, setInteraction] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [lights, setLights] = useState(true);
  async function interact(action: "play" | "feed" | "clean") {
    if (busy) return;
    setBusy(true);
    setActivity(action);
    setInteraction(n=>n+1);
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
      className={`room-world rescue-world painted-world ${compact ? "room-compact" : ""} activity-${activity} ${lights ? "" : "evening"}`}
    >
      <Image className="room-illustration" src="/art/refuge-courtyard.webp" alt="Refugio de animales: patio soleado, enfermería, casitas de adopción y comedor" fill sizes="(max-width: 760px) 100vw, 95vw" priority />
      <div className="world-atmosphere" aria-hidden="true"><span/><span/><span/></div>
      <div className="room-name">
        <Icon name="paw" size={18} /> {cats.length} amigos a salvo
      </div>
      <div className="shelter-stock" aria-label="Cuidado acumulado"><span><Icon name="bowl" size={15}/>{state?.food ?? 0} comidas</span><span><Icon name="heart" size={15}/>{state?.affection ?? 0} mimos</span></div>
      <div className="room-cats">
        {cats.map((cat, index) => (
          <button
            key={cat.id}
            className={`room-cat cat-${index % 6} ${selected?.id === cat.id ? "patted" : ""}`}
            aria-label={`Conocer a ${cat.name}`}
            onClick={() => {
              setSelected(cat);
              setInteraction(n=>n+1);
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
      {activity === "feed" && <div key={interaction} className="food-delivery" aria-hidden="true"><Icon name="bowl" size={40}/><span>¡Ñam!</span></div>}
      {activity === "play" && (
        <div key={interaction} className="play-ball" aria-hidden="true" />
      )}
      {activity === "clean" && (
        <div key={interaction} className="clean-sparkles" aria-hidden="true">
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
          <div className="story-portrait"><CatArt body={selected.palette.body} belly={selected.palette.belly}/></div>
          <strong>{selected.name} te saluda</strong>
          <span>{selected.personality}</span>
          <p>{selected.story}</p>
        </div>
      )}
    </div>
  );
}
