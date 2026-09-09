import { tutorReport } from "@/lib/data/ai";
export const maxDuration = 60;
export async function POST() {
  try {
    return Response.json(await tutorReport());
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
