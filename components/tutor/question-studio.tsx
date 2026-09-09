/* eslint-disable @next/next/no-img-element -- Locally rendered document pages and user-owned data URLs are already resized. */
"use client";
import { useRef, useState, useEffect } from "react";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";
import type { CustomQuestion } from "@/lib/engine/types";
import { validateQuestions } from "@/lib/engine/import-questions";
import { ImageViewer } from "@/components/game/image-viewer";
import { Icon } from "@/components/game/icons";
async function encodeImage(
  source: CanvasImageSource,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, 1800 / Math.max(width, height));
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No pudimos abrir la imagen.");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  let result = canvas.toDataURL("image/webp", 0.9);
  let quality = 0.8;
  while (result.length > 430000 && quality >= 0.35) {
    result = canvas.toDataURL("image/webp", quality);
    quality -= 0.1;
  }
  if (result.length > 450000)
    throw new Error(
      "La imagen tiene demasiado detalle. Recorta una sola pregunta.",
    );
  return result;
}
export function QuestionStudio({
  onAdd,
}: {
  onAdd: (questions: CustomQuestion[]) => void;
}) {
  const [tab, setTab] = useState<"pdf" | "ai" | "json">("pdf");
  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [text, setText] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(100);
  const [prompt, setPrompt] = useState(
    "Crea problemas de grado octavo que requieran varios pasos y razonamiento. Usa cantidades realistas y evita ejercicios triviales.",
  );
  const [key, setKey] = useState("");
  const [count, setCount] = useState(10);
  const [level, setLevel] = useState(3);
  const [json, setJson] = useState("");
  const loading = useRef<PDFDocumentLoadingTask | null>(null);
  const pdf = useRef<PDFDocumentProxy | null>(null);
  const source = useRef<HTMLCanvasElement | null>(null);
  useEffect(
    () => () => {
      void loading.current?.destroy();
    },
    [],
  );
  async function renderPage(document: PDFDocumentProxy, n: number) {
    const item = await document.getPage(n);
    const base = item.getViewport({ scale: 1 });
    const viewport = item.getViewport({
      scale: Math.min(2, 1800 / Math.max(base.width, base.height)),
    });
    const canvas = window.document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await item.render({ canvas, viewport }).promise;
    source.current = canvas;
    setPreview(await encodeImage(canvas, canvas.width, canvas.height));
    const contents = await item.getTextContent();
    setText(
      contents.items
        .map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : " ") : ""))
        .join("")
        .trim(),
    );
    setPage(n);
    setTop(0);
    setBottom(100);
  }
  async function openFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (file.size > 15 * 1024 * 1024)
        throw new Error("Elige un archivo de hasta 15 MB.");
      await loading.current?.destroy();
      pdf.current = null;
      setPages(0);
      setName(file.name);
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        const lib = await import("pdfjs-dist");
        lib.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";
        loading.current = lib.getDocument({ data: await file.arrayBuffer() });
        const doc = await loading.current.promise;
        pdf.current = doc;
        setPages(doc.numPages);
        await renderPage(doc, 1);
      } else if (
        ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      ) {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
        source.current = canvas;
        setPreview(await encodeImage(bitmap, bitmap.width, bitmap.height));
        bitmap.close();
        setText("");
        setTop(0);
        setBottom(100);
      } else throw new Error("Usa PDF, JPG, PNG o WebP.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos abrir el archivo.");
      setPreview("");
    } finally {
      setBusy(false);
    }
  }
  async function turn(n: number) {
    if (!pdf.current || busy) return;
    setBusy(true);
    setError("");
    try {
      await renderPage(pdf.current, n);
    } catch {
      setError("No pudimos abrir esta página.");
    } finally {
      setBusy(false);
    }
  }
  async function attach() {
    try {
      const original = source.current;
      if (!original) return;
      const canvas = document.createElement("canvas");
      canvas.width = original.width;
      canvas.height = Math.max(
        1,
        Math.round((original.height * (bottom - top)) / 100),
      );
      canvas
        .getContext("2d")
        ?.drawImage(
          original,
          0,
          (original.height * top) / 100,
          original.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      const image = await encodeImage(canvas, canvas.width, canvas.height);
      onAdd([
        {
          prompt: text || "Resuelve el problema de la imagen.",
          answer: "",
          hints: ["", "", ""],
          level: level as CustomQuestion["level"],
          answerFormat: "number",
          image,
          imageAlt: `${name}${pages ? ` · página ${page}` : ""}`,
        },
      ]);
      setNotice(
        "Imagen añadida. Completa la respuesta y las pistas en el banco antes de guardar.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos adjuntar la imagen.",
      );
    }
  }
  async function generate() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/tutor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt + (text ? `\nMaterial de referencia:\n${text}` : ""),
          apiKey: key,
          count,
          level,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        questions?: unknown;
      };
      if (!res.ok) throw new Error(body.error || "No pudimos generar.");
      const questions = validateQuestions(body.questions);
      onAdd(questions);
      setNotice(
        `${questions.length} borradores añadidos. Revisa sus soluciones y guarda la habilidad.`,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo conectar con la IA.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="question-studio">
      <div className="studio-heading">
        <Icon name="book" />
        <div>
          <h3>Tu estudio de preguntas</h3>
          <p>Trae tu material. Conviértelo en la próxima misión.</p>
        </div>
      </div>
      <div
        className="studio-tabs"
        role="tablist"
        aria-label="Origen de preguntas"
      >
        {(
          [
            ["pdf", "PDF e imágenes"],
            ["ai", "Crear con IA"],
            ["json", "Importar JSON"],
          ] as const
        ).map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === id}
            key={id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "pdf" && (
        <>
          <label className="upload-zone">
            <Icon name="plus" />
            <strong>Abre tu PDF o imagen</strong>
            <span>PDF, JPG, PNG y WebP · hasta 15 MB</span>
            <input
              aria-label="Subir PDF o imagen"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => void openFile(e.target.files?.[0])}
            />
          </label>
          <p className="studio-help">
            El PDF se abre en tu navegador. Elige la página, recorta el
            ejercicio y añade su respuesta. También funciona con páginas
            escaneadas.
          </p>
          {preview && (
            <div className="document-workspace">
              <div>
                <div className="document-tools">
                  <strong>{name}</strong>
                  {pages > 0 && (
                    <div>
                      <button
                        type="button"
                        disabled={busy || page <= 1}
                        onClick={() => void turn(page - 1)}
                      >
                        Anterior
                      </button>
                      <span>
                        {page} / {pages}
                      </span>
                      <button
                        type="button"
                        disabled={busy || page >= pages}
                        onClick={() => void turn(page + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
                <div className="crop-preview">
                  <img src={preview} alt={`Vista de ${name}`} />
                  <div style={{ top: 0, height: `${top}%` }} />
                  <div style={{ bottom: 0, height: `${100 - bottom}%` }} />
                </div>
                <ImageViewer src={preview} alt={name} />
                <div className="crop-controls">
                  <label>
                    Recortar desde arriba: {top}%
                    <input
                      type="range"
                      min="0"
                      max={bottom - 5}
                      value={top}
                      onChange={(e) => setTop(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Recortar hasta: {bottom}%
                    <input
                      type="range"
                      min={top + 5}
                      max="100"
                      value={bottom}
                      onChange={(e) => setBottom(Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label>
                  Enunciado de la pregunta
                  <textarea
                    rows={7}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Selecciona y conserva solo el enunciado de este ejercicio."
                  />
                </label>
                <p>
                  La extracción de texto no inventa respuestas. Revisa símbolos
                  y conserva solo el ejercicio seleccionado.
                </p>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => void attach()}
                >
                  Añadir como pregunta con imagen
                </button>
                <button
                  type="button"
                  className="quiet"
                  onClick={() => setTab("ai")}
                >
                  Usar este texto como referencia para IA
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {tab === "ai" && (
        <div className="ai-workspace">
          <label>
            Qué quieres que practique Laura
            <textarea
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={12000}
            />
          </label>
          <div className="form-grid">
            <label>
              Cantidad
              <input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <label>
              Nivel
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} ·{" "}
                    {
                      ["Fundamentos", "Aplicación", "Varios pasos", "Reto"][
                        n - 1
                      ]
                    }
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Clave de OpenAI (si no está configurada en el servidor)
            <input
              type="password"
              autoComplete="off"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-…"
            />
          </label>
          <p>
            Se usa solo para esta petición y no se guarda. La generación utiliza
            tu cuenta API de OpenAI. Los borradores quedan editables; revisa sus
            respuestas antes de publicarlos.
          </p>
          {text && (
            <details>
              <summary>Material de referencia adjunto</summary>
              <pre>{text}</pre>
            </details>
          )}
          <button
            type="button"
            className="secondary"
            disabled={busy || !prompt.trim()}
            onClick={() => void generate()}
          >
            {busy ? "Preparando borradores…" : "Generar preguntas"}
          </button>
        </div>
      )}
      {tab === "json" && (
        <>
          <p>
            Importa el JSON exportado desde una habilidad. Se valida cada
            respuesta antes de añadirla.
          </p>
          <textarea
            aria-label="JSON de preguntas"
            rows={8}
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          <button
            type="button"
            className="secondary"
            onClick={() => {
              try {
                const parsed = JSON.parse(json) as unknown;
                const qs = validateQuestions(parsed);
                onAdd(qs);
                setNotice(`${qs.length} preguntas importadas.`);
                setError("");
              } catch (e) {
                setError(e instanceof Error ? e.message : "JSON inválido.");
              }
            }}
          >
            Importar al banco
          </button>
        </>
      )}
      {busy && tab === "pdf" && <p role="status">Abriendo documento…</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="success-message" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}
