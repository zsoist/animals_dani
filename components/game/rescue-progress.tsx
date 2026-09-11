import type {ShelterCat} from '@/lib/data/shelter';
import {RESCUE_DAYS} from '@/lib/engine/challenge';
import {Icon} from './icons';
export function RescueProgress({cats,streak}:{cats:ShelterCat[];streak:number}){
 const target=RESCUE_DAYS[cats.length];
 const candidate=cats.filter(c=>!c.adoptedAt).sort((a,b)=>(b.careCount??0)-(a.careCount??0))[0];
 return <section className="rescue-progress" aria-label="Próximas recompensas">
 {target&&<div><Icon name="paw" size={20}/><div><span>Próximo rescate <b>{Math.min(streak,target)}/{target} días de racha</b></span><progress aria-label="Racha para el próximo rescate" value={Math.min(streak,target)} max={target}/><small>{Math.max(0,target-streak)} {target-streak===1?'día':'días'} para abrir otra puerta.</small></div></div>}
 {candidate&&<details><summary><Icon name="home" size={20}/><span>Un hogar para {candidate.name}<small>{Math.min(candidate.careCount??0,3)}/3 cuidados</small></span></summary><progress aria-label={`Cuidados para la adopción de ${candidate.name}`} value={Math.min(candidate.careCount??0,3)} max={3}/><p>{(candidate.careCount??0)<3?`Faltan ${3-(candidate.careCount??0)} cuidados, que ganas con los retos diarios.`:'Ya recibió los cuidados necesarios.'} Después, logra 8/10 con tres preguntas difíciles sin pistas. {cats.filter(c=>!c.adoptedAt).length<2?'Primero recibiremos a otro gato para que el refugio conserve compañía.':''}</p></details>}
 </section>;
}
