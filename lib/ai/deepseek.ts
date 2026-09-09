import "server-only";
export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
export async function deepseek(messages: AIMessage[], maxTokens = 1200, reasoning = false) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key)
    throw new Error(
      "El tutor IA todavía no está conectado. Puedes seguir con las pistas.",
    );
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  let response: Response;
  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(55000),
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: "json_object" },
        thinking: { type: reasoning ? "enabled" : "disabled" },
        max_tokens: maxTokens,
        stream: false,
      }),
    });
  } catch {
    throw new Error(
      "El tutor tardó demasiado en responder. Puedes reintentar o usar una pista.",
    );
  }
  if (!response.ok)
    throw new Error(
      response.status === 402
        ? "La cuenta de DeepSeek necesita saldo. El resto de la práctica sigue disponible."
        : response.status === 429
          ? "DeepSeek está ocupado. Intenta de nuevo en un momento."
          : "No pudimos conectar con DeepSeek. Puedes seguir practicando y volver a intentarlo.",
    );
  const data = (await response.json()) as {
    choices?: { message?: { content?: string }; finish_reason?: string }[];
    usage?: { total_tokens?: number };
  };
  const choice = data.choices?.[0];
  if (choice?.finish_reason === "length")
    throw new Error(
      "La respuesta quedó incompleta. Pide una explicación más corta.",
    );
  let json: unknown;
  try {
    json = JSON.parse(choice?.message?.content ?? "");
  } catch {
    throw new Error(
      "El tutor no devolvió una respuesta completa. Vuelve a intentarlo.",
    );
  }
  return { json, model, tokens: data.usage?.total_tokens ?? 0 };
}
