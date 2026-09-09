"use client";
import {cleanEvent} from "@/lib/engine/telemetry";
import type {EventName,Properties,UsageEvent} from '@/lib/engine/telemetry';
const prefix='refugio:events:v1:';
function restore(raw:string):UsageEvent[]{try{const parsed:unknown=JSON.parse(raw);return Array.isArray(parsed)?parsed.map(e=>cleanEvent(e)).filter((e):e is UsageEvent=>e!==null).slice(-1000):[];}catch{return [];}}
let visit='';let queue:UsageEvent[]=[];let loaded=false;let sending=false;let retryAfter=0;let failures=0;
function initialize(){if(loaded||typeof window==='undefined')return;loaded=true;try{visit=sessionStorage.getItem('refugio:visit')||crypto.randomUUID();sessionStorage.setItem('refugio:visit',visit);queue=restore(localStorage.getItem(prefix+visit)||'[]');}catch{visit=crypto.randomUUID();queue=[];}}
function persist(){try{localStorage.setItem(prefix+visit,JSON.stringify(queue));}catch{/* The in-memory queue still sends while this tab stays open. */}}
export function track(event_name:EventName,properties:Properties={},context?:{sessionId?:string;skillId?:string}){
 if(typeof window==='undefined')return;initialize();
 const surface=location.pathname.startsWith('/tutor')?'tutor':location.pathname.startsWith('/auth')?'auth':'refuge';
 queue.push({id:crypto.randomUUID(),visit_id:visit,event_name,surface,occurred_at:new Date().toISOString(),properties:{...properties,...(typeof properties.mode==="string"?{mode:properties.mode.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}:{})},session_id:context?.sessionId,skill_id:context?.skillId});
 if(queue.length>1000)queue=queue.slice(-1000);persist();if(queue.length>=15)void flush();
}
export async function flush(){
 initialize();if(sending||Date.now()<retryAfter)return;sending=true;
 try{
  // Recover previous tabs' unsent batches after a reload or a lost connection.
  const keys=new Set([prefix+visit]);try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(prefix))keys.add(k);}}catch{/* Use this tab's queue when storage is unavailable. */}
  for(const key of keys){let pending:UsageEvent[];try{pending=key===prefix+visit?queue:restore(localStorage.getItem(key)||'[]');}catch{continue;}
   pending=pending.filter(e=>Date.parse(e.occurred_at)>Date.now()-7*86400000);const batch=pending.slice(0,25);if(!batch.length)continue;
   const response=await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({events:batch}),keepalive:true,signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw new Error('events pending');const result=await response.json() as {accepted?:string[]};if(!Array.isArray(result.accepted))throw new Error('no acknowledgement');
   const ids=new Set(result.accepted);if(key===prefix+visit){queue=queue.filter(e=>!ids.has(e.id));persist();}else try{const fresh=restore(localStorage.getItem(key)||'[]');const remaining=fresh.filter(e=>!ids.has(e.id));if(remaining.length)localStorage.setItem(key,JSON.stringify(remaining));else localStorage.removeItem(key);}catch{/* Retry with stable ids when storage returns. */}
  }
  failures=0;retryAfter=0;
 }catch{failures++;retryAfter=Date.now()+Math.min(60000,2000*2**Math.min(failures,5));}finally{sending=false;}
}
