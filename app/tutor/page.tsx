export const dynamic='force-dynamic';
import {requireTutor} from '@/lib/data/session';
import {signOut} from '@/lib/data/auth';
export default async function Tutor(){const profile=await requireTutor();return <main className="min-h-screen p-8"><p className="eyebrow">Refugio · tutor</p><h1 className="my-6 text-3xl">Hola, {profile.alias}.</h1><p>El acceso del tutor está conectado. El panel de aprendizaje se incorpora en la Fase 4.</p><form action={signOut}><button className="quiet">Cerrar sesión</button></form></main>}
