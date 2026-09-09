"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/game/icons";
type View = 'progress'|'new-skill'|'catalog';
const tabs = [{id:'progress',label:'Progreso',icon:'book'},{id:'new-skill',label:'Laboratorio IA',icon:'bulb'},{id:'catalog',label:'Habilidades',icon:'gear'}] as const;
export function TutorWorkspace({children}:{children:ReactNode}) {
 const [view,setView]=useState<View>('progress');
 useEffect(()=>{const update=()=>{const hash=location.hash.slice(1);if(tabs.some(t=>t.id===hash))setView(hash as View);};update();window.addEventListener('hashchange',update);return()=>window.removeEventListener('hashchange',update);},[]);
 return <div className="tutor-workspace" data-view={view}><nav className="workspace-tabs" aria-label="Espacio del profesor">{tabs.map(tab=><a data-track={`tutor_${tab.id}`} key={tab.id} href={`#${tab.id}`} aria-current={view===tab.id?'page':undefined} onClick={()=>setView(tab.id)}><Icon name={tab.icon} size={20}/>{tab.label}</a>)}</nav><div className="workspace-content">{children}</div></div>;
}
