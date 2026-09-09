"use client";
import { useState } from "react";
import { Icon } from "@/components/game/icons";
export function AIInsights({
  initial,
  memory,
  messages,
}: {
  initial?: { body: string; created_at: string; evidence_count: number } | null;
  memory: string;
  messages: { role: string; content: string; created_at: string }[];
}) {
  const [report, setReport] = useState(initial?.body ?? "");
  const [count, setCount] = useState(initial?.evidence_count ?? 0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function analyze() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/tutor/report", { method: "POST" });
      const data = (await response.json()) as {
        report?: string;
        evidenceCount?: number;
        error?: string;
      };
      if (!response.ok || !data.report)
        throw new Error(data.error ?? "No se pudo generar.");
      setReport(data.report);
      setCount(data.evidenceCount ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ai-insights" id="ai-progress">
      <div className="studio-heading">
        <Icon name="bulb" />
        <div>
          <h2>Una mirada pedagógica a su progreso</h2>
          <p>
            DeepSeek analiza errores, ayudas y tiempos reales. Tú decides qué
            cambiar.
          </p>
        </div>
      </div>
      <button
        className="secondary"
        disabled={busy}
        onClick={() => void analyze()}
      >
        {busy
          ? "Analizando la práctica…"
          : report
            ? "Actualizar análisis IA"
            : "Analizar con IA"}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {report && (
        <article className="ai-report">
          <p>{report}</p>
          <small>
            Basado en {count} intentos registrados. Orientación IA, revisable
            por el tutor.
          </small>
        </article>
      )}
      <details>
        <summary>Memoria y conversaciones de Laura</summary>
        <h3>Memoria pedagógica</h3>
        <p className="memory-text">
          {memory || "Aún no hay recuerdos guardados."}
        </p>
        <p>Laura puede corregir su memoria desde «Lo que recuerdo» en Numa.</p>
        {messages.length ? (
          messages.map((m, i) => (
            <article key={i} className="coach-message">
              <b>
                {m.role === "user" ? "Laura" : "Numa"} ·{" "}
                {new Date(m.created_at).toLocaleDateString("es")}
              </b>
              <p>{m.content}</p>
            </article>
          ))
        ) : (
          <p>Aún no hay conversaciones.</p>
        )}
      </details>
    </section>
  );
}
