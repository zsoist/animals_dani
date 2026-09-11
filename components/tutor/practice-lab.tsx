"use client";
import {QuestionKinds} from "./question-kinds";
import type {QuestionKind} from "@/lib/engine/question-kinds";
import {askQuestions} from "./ask-questions";
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
  const [creation,setCreation]=useState<"ai"|"manual"|"pdf">("ai");
  const initialSkill=skills.find(s=>s.family==="equations")??skills[0];
  const [skillId,setSkillId] = useState(initialSkill?.id ?? "");
  const [classTopic,setClassTopic]=useState(initialSkill?.classTopic??"");
  const [suggestedName,setSuggestedName]=useState("");
  const [suggestions,setSuggestions]=useState<MicroSuggestion[]>([]);
  const [topicBusy,setTopicBusy]=useState(false);
  const [topicNotice,setTopicNotice]=useState("");
  const [goal,setGoal] = useState("");
  const [strategy,setStrategy] = useState("Comprender el procedimiento con ayudas que se retiran poco a poco");
  const [kinds,setKinds]=useState<QuestionKind[]>(["open","choice"]);
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
      const result=await askQuestions({kinds,skillId:skillId||undefined,count,level,strategy,progressive:true,prompt:`Tema de clase: ${classTopic}. Entrena únicamente esta microhabilidad. Objetivo: ${goal.trim() || selected?.description || 'Una microhabilidad de octavo'}. Estrategia: ${strategy}. ${selected ? `Microhabilidad: ${selected.name}.` : ''} Respeta los tipos de pregunta elegidos.`});
      const next={name:suggestedName||`${selected?.name ?? 'Práctica'} · Refuerzo`, description:goal.trim()||selected?.description||strategy,classTopic,subject:selected?.subject??'matematicas',questions:validateQuestions(result.questions)};
      track("generation_completed",{count:next.questions.length,level},{skillId});
      setDraft(next);setVersion(v=>v+1);setSample(result.evidenceCount??0);
      if(saveLocalValue(storageKey,JSON.stringify(next))){setDismissed(true);}else{setError('La práctica está lista, pero este navegador no pudo conservar una copia. Guárdala antes de salir.');}
    }catch(e){track("generation_failed",{reason:"provider"},{skillId});setError(e instanceof Error?e.message:'No pudimos conectar. Tus preguntas anteriores siguen aquí.');}
    finally{gate.current=false;setBusy(false);}
  }
  return <section className="practice-lab">
    <div className="lab-intro"><div><h2>Crear preguntas</h2><p>Elige cómo quieres prepararlas.</p></div><Image src="/art/numa.webp" width={180} height={180} alt="Numa, el gato tutor, con su cuaderno y sus gafas torcidas" /></div>
    <div className="creation-methods" role="group" aria-label="Cómo crear preguntas">{([["ai","Crear con IA"],["manual","Escribir preguntas"],["pdf","Subir PDF o imagen"]] as const).map(([id,label])=><button key={id} type="button" aria-pressed={creation===id} onClick={()=>setCreation(id)}>{label}</button>)}</div>
    <div hidden={creation!=="ai"}>
    <details className="weekly-planning"><summary>Opcional: planificar desde el tema de clase</summary><div className="class-topic"><label>Tema actual<input value={classTopic} onChange={e=>setClassTopic(e.target.value)} maxLength={300} placeholder="Por ejemplo: gases ideales o principio de Arquímedes"/></label><div className="topic-actions"><button className="secondary" disabled={topicBusy||!classTopic.trim()} onClick={async()=>{setTopicBusy(true);setTopicNotice("");try{const r=await fetch('/api/tutor/weekly-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:classTopic})});const data=await r.json() as {suggestions?:MicroSuggestion[];error?:string};if(!r.ok||!data.suggestions)throw new Error(data.error||'Reintenta la propuesta.');setSuggestions(data.suggestions);}catch(e){setTopicNotice(e instanceof Error?e.message:'No pudimos conectar.');}finally{setTopicBusy(false);}}}>{topicBusy?'Preparando…':'Sugerir microhabilidades para la semana'}</button><button className="quiet" disabled={topicBusy||!skillId||!classTopic.trim()} onClick={async()=>{setTopicBusy(true);setTopicNotice("");try{await saveClassTopic(skillId,classTopic);setTopicNotice('Tema guardado para la microhabilidad seleccionada.');}catch(e){setTopicNotice(e instanceof Error?e.message:'No se guardó.');}finally{setTopicBusy(false);}}}>Guardar tema en la habilidad elegida</button></div>{topicNotice&&<p role="status">{topicNotice}</p>}{suggestions.map(s=><article className="micro-suggestion" key={s.name}><h3>{s.name}</h3><p>{s.reason}</p><p>{s.example}</p><button className="secondary" onClick={()=>{setSuggestedName(s.name);setSkillId(skills.find(skill=>skill.family===s.family)?.id??'');setGoal(`Microhabilidad exclusiva: ${s.name}. ${s.reason}. Ejemplo: ${s.example}`);}}>Preparar esta microhabilidad</button></article>)}</div></details>
    {recovery && <div className="draft-recovery"><div><strong>Tienes una práctica sin terminar</strong><p>{recovery.name} · {recovery.questions.length} preguntas guardadas en este navegador.</p></div><button className="secondary" onClick={()=>{setDraft(recovery);setVersion(v=>v+1);setDismissed(true);}}>Recuperar borrador</button></div>}
    <div className="lab-workbench"><QuestionKinds value={kinds} onChange={setKinds} onImage={()=>setCreation("pdf")}/><p className="studio-help">Para preguntas con imagen, abre el material y elige los formatos desde su estudio.</p>
      <div className="form-grid"><label>Una habilidad para esta práctica<select value={skillId} onChange={e=>{setSkillId(e.target.value);setClassTopic(skills.find(s=>s.id===e.target.value)?.classTopic??classTopic);}}><option value="">Tema nuevo</option>{skills.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Cómo quieres ayudar<select value={strategy} onChange={e=>setStrategy(e.target.value)}><option value="Comprender el procedimiento con ayudas que se retiran poco a poco">Aprender paso a paso</option><option value="Corregir el error más frecuente con ejemplos contrastados">Corregir un error</option><option value="Aplicar lo aprendido a situaciones nuevas y problemas de varios pasos">Aplicar a nuevos retos</option><option value="Comprobar qué puede resolver sin ayuda">Comprobar sin ayuda</option></select><small className="strategy-description">{strategy}.</small></label><label className="full-width">Qué quieres practicar<textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={3} maxLength={3000} placeholder="Por ejemplo: distinguir cuándo multiplicar y cuándo dividir. Usa áreas de recintos y cantidades de comida." /></label><label>Dificultad final<select value={level} onChange={e=>setLevel(Number(e.target.value))}>{[1,2,3,4].map(n=><option key={n} value={n}>{n-1} · {['Fundamentos','Aplicación','Varios pasos','Reto'][n-1]}</option>)}</select></label><label>Preguntas<select value={count} onChange={e=>setCount(Number(e.target.value))}>{[3,6,10].map(n=><option key={n} value={n}>{n} preguntas</option>)}</select></label></div>
      <div className="lab-generate"><p><Icon name="book" size={18}/> Usa aciertos, errores y ayudas de la habilidad elegida.</p><button className="primary" disabled={busy || (!skillId&&!goal.trim())} onClick={()=>void generate()}><Icon name="bulb"/>{busy?'Preparando y revisando…':'Preparar práctica con IA'}</button></div>
      {busy && <div className="generation-status" role="status"><span/><div><strong>Preparando preguntas en tandas pequeñas…</strong><p>Después se revisan las respuestas y pistas. Conservaremos tu borrador anterior si hay un error.</p></div></div>}
      {error && <p role="alert" className="error">{error}</p>}
    </div>
    {draft && <div className="lab-draft"><div className="draft-heading"><h3>Tu borrador está listo para probar</h3><p>{draft.questions.length} preguntas · {sample===null?'Borrador recuperado':`${sample} intentos recientes usados como contexto`}. Se guarda desactivado hasta que marques «Incluir en las misiones».</p></div><SkillEditor key={version} draft={draft} onSaved={()=>{saveLocalValue(storageKey, "");}}/></div>}
    </div><div hidden={creation==="ai"} className="manual-studio"><p className="creation-help">Prepara las preguntas y guárdalas. Actívalas cuando estén listas.</p><SkillEditor importOpen={creation==="pdf"}/></div>
  </section>;
}
