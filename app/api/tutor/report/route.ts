import { tutorReport } from "@/lib/data/ai";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    return Response.json(await tutorReport((await request.json().catch(() => ({})) as {question?: string}).question ?? ""));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo generar el informe.",
      },
      { status: 400 },
    );
  }
}
