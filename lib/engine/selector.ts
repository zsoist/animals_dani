import type {Mastery,Question,Skill} from './types';
import {daysSince,decayed} from './mastery';
import {random} from './random';
export function selectDaily(skills:Skill[],masteries:Mastery[],now:string,sessionSeed:string):Question[]{
 const active=skills.filter(s=>s.active);if(!active.length)return [];
 const rng=random(sessionSeed);const state=(s:Skill)=>masteries.find(m=>m.skill_id===s.id);const score=(s:Skill)=>decayed(state(s)?.mastery_score??0,state(s)?.last_practiced_at??null,now);
 const weak=[...active].sort((a,b)=>score(a)-score(b)||b.priority-a.priority);const overdue=[...active].sort((a,b)=>daysSince(state(b)?.last_practiced_at??null,now)-daysSince(state(a)?.last_practiced_at??null,now));const introduced=active.filter(s=>daysSince(s.created_at,now)<7);const mastered=active.filter(s=>score(s)>=85);
 const weighted=()=>{const weights=active.map(s=>Math.max(1,s.priority)*(101-score(s)));let point=rng()*weights.reduce((a,b)=>a+b,0);return active.find((_,i)=>(point-=weights[i])<=0)??active[0]};
 const desired=[...Array.from({length:4},()=>weak[0]),...Array.from({length:3},()=>overdue[0]),...Array.from({length:2},(_,i)=>introduced[i%introduced.length]??weighted()),mastered[0]??weighted()];
 const ordered:Skill[]=[];while(desired.length){let index=desired.findIndex(s=>ordered.length<3||!ordered.slice(-3).every(p=>p.id===s.id));if(index<0){const alternative=active.find(s=>s.id!==ordered.at(-1)?.id);if(alternative){ordered.push(alternative);desired.pop();continue}index=0}ordered.push(desired.splice(index,1)[0])}
 return ordered.map((skill,i)=>({skillId:skill.id,family:skill.family,level:state(skill)?.current_level??skill.base_difficulty,seed:`${sessionSeed}:${i}`}));
}
export function reinforce(queue:Question[],index:number):Question[]{const current=queue[index];if(!current||current.reinforced)return queue;const next=[...queue];const copy={...current,seed:`${current.seed}:repaso`,reinforced:true};next.splice(Math.min(index+3,next.length),0,copy);return next}
