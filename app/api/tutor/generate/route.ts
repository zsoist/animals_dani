import { generateQuestions } from "@/lib/data/generate-questions";
export const maxDuration = 180;
export async function POST(request: Request) {
  try { return Response.json(await generateQuestions(await request.json())); }
  catch (error) { return Response.json({error: error instanceof Error ? error.message : "No se pudo generar."}, {status:400}); }
}
