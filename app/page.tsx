import {isConfigured} from '@/lib/data/config';
import {loadPractice} from '@/lib/data/student';
import {getShelter} from '@/lib/data/shelter';
import {RefugeClient} from '@/components/game/refuge-client';
export const dynamic='force-dynamic';
export default async function Home(){if(!isConfigured())return <main className="shelter"><section className="panel"><h2>Refugio en preparación</h2><p>Conecta Supabase para abrir la puerta de Laura.</p></section></main>;const practice=await loadPractice();const cats=await getShelter();return <RefugeClient cats={cats as never[]} skills={practice.skills} queue={practice.queue} state={practice.state} streak={practice.streak} userId={practice.userId}/>}
