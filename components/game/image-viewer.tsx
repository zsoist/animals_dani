/* eslint-disable @next/next/no-img-element -- User-owned data URLs are precompressed and opened at their native resolution. */
"use client";
import {track} from "@/components/telemetry/client";
import { useRef, useState } from "react";
import { Icon } from "./icons";
export function ImageViewer({
  src,
  alt = "Imagen del ejercicio",
}: {
  src: string;
  alt?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [zoom, setZoom] = useState(1);
  return (
    <>
      <button
        type="button"
        className="image-preview"
        onClick={() => {
          track("image_opened");
          setZoom(1);
          dialog.current?.showModal();
        }}
      >
        <img src={src} alt={alt} />
        <span>
          Ampliar imagen <Icon name="plus" size={17} />
        </span>
      </button>
      <dialog
        ref={dialog}
        className="image-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <header>
          <strong>{alt}</strong>
          <div>
            <button
              type="button"
              data-track="image_zoom_out" aria-label="Reducir imagen"
              onClick={() => setZoom((v) => Math.max(1, v - 0.5))}
            >
              −
            </button>
            <output>{Math.round(zoom * 100)}%</output>
            <button
              type="button"
              data-track="image_zoom_in" aria-label="Ampliar imagen"
              onClick={() => setZoom((v) => Math.min(4, v + 0.5))}
            >
              +
            </button>
            <button
              type="button"
              aria-label="Cerrar imagen"
              onClick={() => dialog.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>
        </header>
        <div className="image-pan">
          <img
            src={src}
            alt={alt}
            style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
          />
        </div>
      </dialog>
    </>
  );
}
