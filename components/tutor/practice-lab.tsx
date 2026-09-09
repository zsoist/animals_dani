"use client";
import {saveClassTopic} from "@/lib/data/tutor-actions";
import type {MicroSuggestion} from "@/lib/data/weekly-plan";
import {track} from "@/components/telemetry/client";
import { useMemo, useRef, useState } from "react";
import { useLocalValue, saveLocalValue } from "@/components/game/local-preference";
import Image from "next/image";
import type { CustomQuestion, Skill } from "@/lib/engine/types";
import { validateQuestions } from "@/lib/engine/import-questions";
import { SkillEditor } from "./skill-editor";
import { Icon } from "@/components/game/icons";
const storageKey = "refugio:practice-draft:v1";
type Draft = {name:string;description:string;classTopic?:string;subject:string;questions:CustomQuestion[]};
export function PracticeLab({skills}:{skills:Skill[]}) {
  const initialSkill=skills.find(s=>s.family==="equations")??skills[0];
  const [skillId,setSkillId] = useState(initialSkill?.id ?? "");
  const [classTopic,setClassTopic]=useState(initialSkill?.classTopic??"");
  const [suggestedName,setSuggestedName]=useState("");
  const [suggestions,setSuggestions]=useState<MicroSuggestion[]>([]);
  const [topicBusy,setTopicBusy]=useState(false);
  const [topicNotice,setTopicNotice]=useState("");
  const [goal,setGoal] = useState("");
  const [strategy,setStrategy] = useState("Comprender el procedimiento con ayudas que se retiran poco a poco");
  const [count,setCount] = useState(6);
  const [level,setLevel] = useState(3);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [draft,setDraft] = useState<Draft|null>(null);
  const savedDraft = useLocalValue(storageKey);
  const [dismissed,setDismissed] = useState(false);
  const recovery = useMemo(()=>{if(!savedDraft || dismissed)return null;try{const d=JSON.parse(savedDraft) as Draft;if(typeof d.name!=="string"||typeof d.description!=="string"||typeof d.subject!=="string")return null;return {...d,questions:validateQuestions(d.questions)};}catch{return null;}},[savedDraft,dismissed]);
  const [version,setVersion] = useState(0);
  const [sample,setSample] = useState<number|null>(null);
  const gate = useRef(false);
  async function generate() {
    if(gate.current) return; gate.current=true;setBusy(true);setError("");
    track("generation_started",{count,level},{skillId});
    try {
      const selected=skills.find(s=>s.id===skillId);
      const response=await fetch('/api/tutor/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({skillId:skillId||undefined,count,level,strategy,progressive:true,prompt:`Tema de clase: ${classTopic}. Entrena únicamente la microhabilidad elegida; no enseñes el tema completo. Sin decimales; números enteros sencillos. Objetivo: ${goal.trim() || selected?.description || 'Practicar problemas de varios pasos de grado octavo'}. Estrategia: ${strategy}. ${selected ? `Tema exclusivo: ${selected.name}.` : ''}`})});
      const result=await response.json() as {questions?:unknown;evidenceCount?:number;error?:string};
      if(!response.ok)throw new Error(result.error || 'No pudimos preparar la práctica.');
      const next={name:suggestedName||`${selected?.name ?? 'Práctica'} · Refuerzo`, description:goal.trim()||selected?.description||strategy,classTopic,subject:selected?.subject??'matematicas',questions:validateQuestions(result.questions)};
      track("generation_completed",{count:next.questions.length,level},{skillId});
      setDraft(next);setVersion(v=>v+1);setSample(result.evidenceCount??0);
      if(saveLocalValue(storageKey,JSON.stringify(next))){setDismissed(true);}else{setError('La práctica está lista, pero este navegador no pudo conservar una copia. Guárdala antes de salir.');}
    }catch(e){track("generation_failed",{reason:"provider"},{skillId});setError(e instanceof Error?e.message:'No pudimos conectar. Tus preguntas anteriores siguen aquí.');}
    finally{gate.current=false;setBusy(false);}
  }
  return <section className="practice-lab">
    <div className="lab-intro"><div><h2>¿Qué están viendo en clase?</h2><p>Elige una microhabilidad para cada día. La IA propone; tú revisas.</p></div><Image src="/art/numa.webp" width={180} height={180} alt="Numa, el gato tutor, con su cuaderno y sus gafas torcidas" /></div>
    <div className="class-topic"><label>Tema actual<input value={classTopic} onChange={e=>setClassTopic(e.target.value)} maxLength={300} placeholder="Por ejemplo: gases ideales o principio de Arquímedes"/></label><div className="topic-actions"><button className="secondary" disabled={topicBusy||!classTopic.trim()} onClick={async()=>{setTopicBusy(true);setTopicNotice("");try{const r=await fetch('/api/tutor/weekly-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:classTopic})});const data=await r.json() as {suggestions?:MicroSuggestion[];error?:string};if(!r.ok||!data.suggestions)throw new Error(data.error||'Reintenta la propuesta.');setSuggestions(data.suggestions);}catch(e){setTopicNotice(e instanceof Error?e.message:'No pudimos conectar.');}finally{setTopicBusy(false);}}}>{topicBusy?'Preparando…':'Sugerir microhabilidades para la semana'}</button><button className="quiet" disabled={topicBusy||!skillId||!classTopic.trim()} onClick={async()=>{setTopicBusy(true);setTopicNotice("");try{await saveClassTopic(skillId,classTopic);setTopicNotice('Tema guardado para la microhabilidad seleccionada.');}catch(e){setTopicNotice(e instanceof Error?e.message:'No se guardó.');}finally{setTopicBusy(false);}}}>Guardar tema en la habilidad elegida</button></div>{topicNotice&&<p role="status">{topicNotice}</p>}{suggestions.map(s=><article className="micro-suggestion" key={s.name}><h3>{s.name}</h3><p>{s.reason}</p><p>{s.example}</p><button className="secondary" onClick={()=>{setSuggestedName(s.name);setSkillId(skills.find(skill=>skill.family===s.family)?.id??'');setGoal(`Microhabilidad exclusiva: ${s.name}. ${s.reason}. Ejemplo: ${s.example}`);}}>Preparar esta microhabilidad</button></article>)}</div>
    {recovery && <div className="draft-recovery"><div><strong>Tienes una práctica sin terminar</strong><p>{recovery.name} · {recovery.questions.length} preguntas guardadas en este navegador.</p></div><button className="secondary" onClick={()=>{setDraft(recovery);setVersion(v=>v+1);setDismissed(true);}}>Recuperar borrador</button></div>}
    <div className="lab-workbench">
      <div className="form-grid"><label>Una habilidad para esta práctica<select value={skillId} onChange={e=>{setSkillId(e.target.value);setClassTopic(skills.find(s=>s.id===e.target.value)?.classTopic??classTopic);}}><option value="">Tema nuevo</option>{skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Cómo quieres ayudar<select value={strategy} onChange={e=>setStrategy(e.target.value)}><option value="Comprender el procedimiento con ayudas que se retiran poco a poco">Aprender paso a paso</option><option value="Corregir el error más frecuente con ejemplos contrastados">Corregir un error</option><option value="Aplicar lo aprendido a situaciones nuevas y problemas de varios pasos">Aplicar a nuevos retos</option><option value="Comprobar qué puede resolver sin ayuda">Comprobar sin ayuda</option></select><small className="strategy-description">{strategy}.</small></label><label className="full-width">Tu intención pedagógica<textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={3} maxLength={3000} placeholder="Por ejemplo: distinguir cuándo multiplicar y cuándo dividir. Usa áreas de recintos y cantidades de comida." /></label><label>Dificultad final<select value={level} onChange={e=>setLevel(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n-1} · {['Fundamentos','Aplicación','Varios pasos','Reto'][n-1]}</option>)}</select></label><label>Preguntas<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[3,6,10].map(n=><option key={n} value={n}>{n} preguntas</option>)}</select></label></div>
      <div className="lab-generate"><p><Icon name="book" size={18}/> Usa aciertos, errores y ayudas de la habilidad elegida.</p><button className="primary" disabled={busy || (!skillId&&!goal.trim())} onClick={()=>void generate()}><Icon name="bulb"/>{busy?'Preparando y revisando…':'Preparar práctica con IA'}</button></div>
      {busy && <div className="generation-status" role="status"><span/><div><strong>Estamos resolviendo también las preguntas.</strong><p>El borrador pasa por generación y una segunda revisión matemática. Puede tardar cerca de un minuto.</p></div></div>}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
    {draft && <div className="lab-draft"><div className="draft-heading"><h3>Tu borrador está listo para probar</h3><p>{draft.questions.length} preguntas · {sample===null?'Borrador recuperado':`${sample} intentos recientes usados como contexto`}. Se guarda desactivado hasta que marques «Incluir en las misiones».</p></div><SkillEditor key={version} draft={draft} onSaved={()=>{saveLocalValue(storageKey, "");}}/></div>}
    <details className="manual-studio"><summary><Icon name="plus"/> Prefiero empezar con mi PDF o escribir las preguntas</summary><SkillEditor /></details>
  </section>;
}
