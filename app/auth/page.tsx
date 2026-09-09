import Link from 'next/link';
import {Shelter} from '@/components/scene/shelter';
import {Login} from '@/components/game/login';
import {isConfigured} from '@/lib/data/config';
export default function Auth(){return <main className="shelter"><Shelter cats={[]}/><header className="masthead"><span className="eyebrow">El refugio de Laura</span><h1>Admin.</h1></header><section className="panel"><h2>Acceso del tutor</h2>{isConfigured()?<Login/>:<p role="status">Falta conectar Supabase para habilitar el acceso del administrador.</p>}<Link href="/" className="quiet inline-flex min-h-12 items-center">Volver al refugio</Link></section></main>}
