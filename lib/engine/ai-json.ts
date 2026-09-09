/** Accept JSON and fenced JSON without executing provider-generated text. */
export function parseAIJson(content: string): unknown {
  const text = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(text); }
  catch {
    // Models sometimes emit LaTeX escapes such as \( inside JSON strings.
    return JSON.parse(text.replace(/\\(?!["\\/bfnrtu])/g, '\\\\'));
  }
}
