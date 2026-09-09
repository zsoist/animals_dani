import "server-only";
import { studentClient } from "./student";
import type { ShelterCat } from "./shelter";
export async function openLauraShelter(): Promise<ShelterCat[]> {
  const { db, userId } = await studentClient();
  const { data, error } = await db
    .from("cat_unlocks")
    .select("unlocked_at,cats(id,name,personality,story,palette)")
    .eq("user_id", userId);
  if (error) throw new Error("No pudimos cargar a los gatos.");
  return (data ?? []).flatMap((row) => {
    const raw: unknown = row.cats;
    return (Array.isArray(raw) ? raw : [raw]).map((entry: unknown) => {
      if (!entry || typeof entry !== "object") throw new Error("Gato inválido");
      const c = entry as Record<string, unknown>;
      const p = c.palette as Record<string, unknown>;
      return {
        id: String(c.id),
        name: String(c.name),
        story: String(c.story),
        personality: String(c.personality),
        palette: { body: String(p.body), belly: String(p.belly) },
        unlockedAt: String(row.unlocked_at),
      };
    });
  });
}
