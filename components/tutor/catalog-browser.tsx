"use client";
import { Children, useState, type ReactNode } from "react";
import type { Skill } from "@/lib/engine/types";
export function CatalogBrowser({skills,children}:{skills:Skill[];children:ReactNode}) {
 const [query,setQuery]=useState(''),[status,setStatus]=useState('all');
 const matches=skills.map(s=>s.name.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))&&(status==='all'||(status==='active'?s.active:!s.active)));
 return <div><div className="catalog-filter"><label>Buscar una habilidad<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre de la habilidad"/></label><label>Mostrar<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Todas</option><option value="active">Activas</option><option value="draft">Borradores y desactivadas</option></select></label><span role="status">{matches.filter(Boolean).length} de {skills.length}</span></div>{Children.toArray(children).map((child,i)=><div key={skills[i]?.id ?? i} hidden={!matches[i]}>{child}</div>)}{!matches.some(Boolean)&&<p className="catalog-empty">No hay habilidades con ese filtro. Prueba otro nombre o muestra todas.</p>}</div>;
}
