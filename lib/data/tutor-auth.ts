import "server-only";
import { database } from "./server";
export async function tutorDatabase() {
  const db = await database();
  const { data } = await db.auth.getUser();
  if (!data.user) throw new Error("Entra como Admin para guardar.");
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  if (profile?.role !== "tutor") throw new Error("Acceso reservado al tutor.");
  return db;
}
