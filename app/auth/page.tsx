import Link from "next/link";
import { Login } from "@/components/game/login";
import { CatArt } from "@/components/scene/cat-art";
import { Icon } from "@/components/game/icons";
export default function Auth() {
  return (
    <main className="auth-shell">
      <Link href="/" className="secondary">
        <Icon name="back" size={18} />
        Volver al refugio
      </Link>
      <section className="auth-panel">
        <CatArt />
        <h1>Hola, tutor.</h1>
        <p>Un espacio para preparar las aventuras de Laura.</p>
        <Login />
      </section>
    </main>
  );
}
