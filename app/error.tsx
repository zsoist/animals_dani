"use client";
import Image from "next/image";
export default function ErrorPage() {
  return <main className="connection-state"><Image src="/art/numa.webp" width={190} height={190} alt="Numa esperando junto a su cuaderno"/><h1>Nos falta un pasito para entrar.</h1><p>No pudimos conectar con el refugio. Lo que ya guardaste sigue allí.</p><button className="primary" onClick={()=>window.location.reload()}>Volver a conectar</button></main>;
}
