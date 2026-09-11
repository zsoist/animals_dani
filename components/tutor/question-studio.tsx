/* eslint-disable @next/next/no-img-element -- Locally rendered document pages and user-owned data URLs are already resized. */
"use client";
import {DriveBank} from "./drive-bank";
import {QuestionKinds} from "./question-kinds";
import type {QuestionKind} from "@/lib/engine/question-kinds";
import {askQuestions} from "./ask-questions";
import {track} from "@/components/telemetry/client";
import { useRef, useState, useEffect } from "react";
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from "pdfjs-dist";
import type { CustomQuestion } from "@/lib/engine/types";
import { validateQuestions } from "@/lib/engine/import-questions";
import {encodeImage} from "./encode-image";
import { ImageViewer } from "@/components/game/image-viewer";
import { Icon } from "@/components/game/icons";
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

  const [includeImage,setIncludeImage]=useState(false);
  const [kinds,setKinds]=useState<QuestionKind[]>(["open","choice"]);
  const [count, setCount] = useState(6);
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
    track("file_opened",{format:file.type==="application/pdf"?"pdf":"image"});
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
        "Imagen añadida. Completa la respuesta y revisa las pistas en el banco antes de guardar.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos adjuntar la imagen.",
      );
    }
  }
  async function wholeDocument(){
    if(!pdf.current)return;setBusy(true);setError("");
    try{let extracted='';const limit=Math.min(pdf.current.numPages,30);for(let i=1;i<=limit;i++){const p=await pdf.current.getPage(i);const c=await p.getTextContent();extracted+=`\nPágina ${i}:\n`+c.items.map(item=>'str' in item?item.str:'').join(' ');if(extracted.length>14000)throw new Error('El banco es muy largo. Usa páginas individuales o divide el PDF en partes.');}
     if(pdf.current.numPages>30)throw new Error('Usa un PDF de hasta 30 páginas para importar el banco completo.');
     if(extracted.replace(/Página \d+:/g,'').trim().length<30)throw new Error('Este PDF es escaneado. Recorta cada pregunta como imagen y añade su respuesta.');
     setText(extracted);setPrompt('Importa preguntas del material, conserva su objetivo y datos. No inventes preguntas adicionales. Resuelve y revisa cada respuesta.');setTab('ai');setNotice(`Texto de ${limit} páginas listo. Elige tipos y cantidad; revisa el borrador antes de guardar.`);
    }catch(e){setError(e instanceof Error?e.message:'No pudimos leer el banco.');}finally{setBusy(false);}
  }
  async function generate() {
    track("generation_started",{count,level});
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body=await askQuestions({kinds,prompt:prompt+(includeImage?" Las preguntas se presentarán junto con la imagen de esta página. Usa únicamente el material textual extraído, no inventes detalles visuales.":"")+(text?`\nMaterial de referencia:\n${text}`:''),count,level});
      const questions = validateQuestions(body.questions);
      track("generation_completed",{count:questions.length,level});
      onAdd(questions.map(q=>includeImage&&preview?{...q,image:preview,imageAlt:`Material de referencia: ${name}`} : q));
      setNotice(
        `${questions.length} borradores añadidos. Revisa sus soluciones y guarda la habilidad.`,
      );
    } catch (e) {
      track("generation_failed",{reason:"request_failed"});
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
          <DriveBank onOpen={openFile}/><label className="upload-zone">
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
          {pages>0&&<button type="button" className="secondary" disabled={busy} onClick={()=>void wholeDocument()}>Preparar preguntas de todo el PDF</button>}
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
        <div className="ai-workspace"><QuestionKinds value={kinds} onChange={setKinds} image={includeImage} onImage={()=>{if(!preview){setError("Abre primero una imagen o página PDF en PDF e imágenes.");setTab("pdf");}else setIncludeImage(v=>!v);}}/>
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
                max="10"
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
                    {n-1} ·{" "}
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
          <p>
            Pide preguntas numéricas, de texto o de opción múltiple. Revisa las respuestas antes de guardar.
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
