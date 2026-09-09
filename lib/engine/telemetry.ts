export const eventLabels={page_view:'Visita',page_leave:'Salida de pantalla',active_time:'Tiempo activo',control_used:'Control utilizado',mission_started:'Misión iniciada',mission_left:'Misión interrumpida',mission_completed:'Misión completada',question_viewed:'Pregunta abierta',answer_edited:'Edición de respuesta',input_invalid:'Entrada por revisar',hint_requested:'Pista solicitada',solution_viewed:'Solución consultada',attempt_saved:'Respuesta guardada',save_failed:'Guardado sin confirmar',coach_opened:'Numa abierto',coach_requested:'Consulta a Numa',coach_replied:'Respuesta de Numa',coach_failed:'Consulta interrumpida',memory_saved:'Memoria actualizada',file_opened:'Archivo abierto',image_opened:'Imagen ampliada',generation_started:'Generación solicitada',generation_completed:'Borrador generado',generation_failed:'Generación interrumpida',skill_saved:'Habilidad guardada',runtime_error:'Error de interfaz',auth_result:'Acceso del profe',telemetry_dropped:'Eventos fuera de la cola'} as const;
export type EventName=keyof typeof eventLabels;
export type Properties=Record<string,string|number|boolean|null>;
export type UsageEvent={id:string;visit_id:string|null;event_name:EventName;surface:'refuge'|'tutor'|'auth';occurred_at:string;properties:Properties;session_id?:string|null;skill_id?:string|null;actor_kind?:string;is_test?:boolean};
export const uuid=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const numericKeys=['duration_ms','hint_level','step','edits','deletes','clears','count','latency_ms','tokens','level','progress'];
const textKeys=['control','mode','reason','error_type','format','view'];
export function cleanEvent(value:unknown,now=Date.now()):UsageEvent|null {
 if(!value||typeof value!=='object')return null;const e=value as Record<string,unknown>;
 if(['attempt_saved','mission_completed','skill_saved'].includes(String(e.event_name)))return null;
 if(!uuid(e.id)||!uuid(e.visit_id)||!Object.hasOwn(eventLabels,String(e.event_name))||!['refuge','tutor','auth'].includes(String(e.surface)))return null;
 const time=typeof e.occurred_at==='string'?Date.parse(e.occurred_at):NaN;if(!Number.isFinite(time)||time<now-7*86400000||time>now+300000)return null;
 const properties:Properties={};const raw=e.properties&&typeof e.properties==='object'?e.properties as Record<string,unknown>:{};
 for(const key of numericKeys)if(typeof raw[key]==='number'&&Number.isFinite(raw[key]))properties[key]=Math.round(Math.max(0,Math.min(7200000,raw[key])));
 for(const key of ['correct','success','active'])if(typeof raw[key]==='boolean')properties[key]=raw[key];
 for(const key of textKeys)if(typeof raw[key]==='string'&&/^[a-zA-Z0-9_:.\-]{1,80}$/.test(raw[key]))properties[key]=raw[key];
 return {id:e.id,visit_id:e.visit_id,event_name:e.event_name as EventName,surface:e.surface as UsageEvent['surface'],occurred_at:new Date(time).toISOString(),properties,session_id:uuid(e.session_id)?e.session_id:null,skill_id:uuid(e.skill_id)?e.skill_id:null};
}
export function usageSummary(events:UsageEvent[],actor='shared_refuge') {
 const rows=events.filter(e=>!e.is_test&&e.actor_kind===actor);
 const counts:Partial<Record<EventName,number>>={};let activeMs=0;
 const controls:Record<string,number>={};
 for(const e of rows){counts[e.event_name]=(counts[e.event_name]??0)+1;if(e.event_name==='active_time')activeMs+=Number(e.properties.duration_ms)||0;if(e.event_name==='control_used'&&typeof e.properties.control==='string')controls[e.properties.control]=(controls[e.properties.control]??0)+1;}
 return {events:rows.length,visits:new Set(rows.map(e=>e.visit_id).filter(Boolean)).size,activeMinutes:Math.round(activeMs/60000),counts,controls,firstEvent:rows.map(e=>e.occurred_at).sort()[0]??null};
}
