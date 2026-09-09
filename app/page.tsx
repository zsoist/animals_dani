export const dynamic='force-dynamic';
import Link from 'next/link';
import {Shelter} from '@/components/scene/shelter';
import {isConfigured} from '@/lib/data/config';
import {openLauraShelter} from '@/lib/data/laura';
export default async function Home(){const cats=isConfigured()?await openLauraShelter():[];return <main className="shelter"><Shelter cats={cats}/><header className="masthead"><span className="eyebrow">El refugio de Laura</span><h1>Hola, Laura.</h1><p>Un ratito contigo cambia su día.</p></header><section className="panel"><span className="eyebrow">Tu lugar para volver</span><h2>Ya estás en casa.</h2>{isConfigured()?<p>Toca a un gato para conocer su historia.</p>:<p>Estamos preparando el refugio. La conexión para guardar tus rescates estará disponible pronto.</p>}<Link href="/auth" className="quiet inline-flex min-h-12 items-center">Admin</Link></section></main>}
