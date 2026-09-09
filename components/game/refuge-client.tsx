'use client';
import {useState} from 'react';
import {Practice} from './practice';
import type {Question,Skill,ShelterState,Streak} from '@/lib/engine/types';
import {startMission} from '@/lib/data/actions';
import {Shelter} from '@/components/scene/shelter';
export function RefugeClient({cats,skills,queue,state,streak,userId}:{cats:never[];skills:Skill[];queue:Question[];state:ShelterState;streak:Streak;userId:string}){const [session,setSession]=useState<string|null>(null);const [playing,setPlaying]=useState(false);if(playing&&session)return <main className="shelter"><Shelter cats={cats}/><Practice sessionId={session} queue={queue} skills={skills} state={state} streak={streak} userId={userId} onDone={()=>setPlaying(false)}/></main>;return <main className="shelter"><Shelter cats={cats}/><header className="masthead"><span className="eyebrow">El refugio de Laura</span><h1>Hola, Laura.</h1><p>Un ratito contigo cambia su día.</p></header><section className="panel"><span className="eyebrow">Tu misión de hoy</span><h2>Ayuda a los gatos.</h2><p>Diez preguntas cortas para llenar sus platos y encender una lámpara.</p><button className="primary" onClick={async()=>{setSession(await startMission());setPlaying(true)}}>Empezar rescate</button><p className="status">🔥 {streak.current} días · 🍽️ {state.food}/10</p></section></main>}
