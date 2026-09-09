import { isConfigured } from "@/lib/data/config";
import { loadPractice } from "@/lib/data/student";
import { getShelter } from "@/lib/data/shelter";
import { RefugeClient } from "@/components/game/refuge-client";
export const dynamic = "force-dynamic";
export default async function Home() {
  if (!isConfigured())
    return (
      <main className="auth-shell">
        <h1>Refugio en preparación</h1>
        <p>Conecta Supabase para abrir la puerta de Laura.</p>
      </main>
    );
  const [practice, cats] = await Promise.all([loadPractice(), getShelter()]);
  return <RefugeClient cats={cats} {...practice} />;
}
