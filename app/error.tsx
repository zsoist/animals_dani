'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="p-8"><h1 className="text-2xl">No pudimos abrir la puerta.</h1><p className="my-4">Comprueba tu conexión y vuelve a intentarlo.</p><button className="primary max-w-sm" onClick={reset}>Volver a intentar</button></main>}
