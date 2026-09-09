import Image from "next/image";
export default function Loading(){return <main className="connection-state" role="status"><Image src="/art/numa.webp" width={150} height={150} alt=""/><h1>Abriendo el refugio…</h1><p>Buscando tus gatos y tu próxima aventura.</p><div className="loading-paws" aria-hidden="true"><span/><span/><span/></div></main>;}
