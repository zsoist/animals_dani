import { askCoach, coachState, editMemory } from "@/lib/data/ai";
export const maxDuration = 60;
const failure = (error: unknown) =>
  Response.json(
    {
      error:
        error instanceof Error ? error.message : "No pudimos abrir el tutor.",
    },
    { status: 400 },
  );
export async function GET() {
  try {
    return Response.json(await coachState());
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Parameters<typeof askCoach>[0];
    return Response.json(await askCoach(body));
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { memory?: unknown };
    if (typeof body.memory !== "string" || body.memory.length > 1800)
      throw new Error("La memoria admite hasta 1.800 caracteres.");
    return Response.json({ memory: await editMemory(body.memory) });
  } catch (error) {
    return failure(error);
  }
}
