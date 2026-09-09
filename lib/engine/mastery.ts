import type {Attempt,Level,Mastery,Streak} from './types';
export const dayMs=86400000;
export function dayKey(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
export function daysSince(last:string|null,now:string){return last?Math.max(0,Math.floor((Date.parse(now)-Date.parse(last))/dayMs)):365}
export function decayed(score:number,last:string|null,now:string){return last?score*Math.pow(.985,daysSince(last,now)):score}
export function band(score:number){return score<40?'Necesita práctica':score<65?'En progreso':score<85?'Casi automático':'Dominado'}
export function updateMastery(current:Mastery,attempt:Attempt,history:Attempt[]):Mastery{
 const score=Math.max(0,Math.min(100,decayed(current.mastery_score,current.last_practiced_at,attempt.created_at)+(attempt.correct?12*[1,.6,.35,.15][attempt.hint_level]:-8)));
 const all=[...history,attempt];const atLevel=all.filter(a=>a.level===current.current_level);const lastFive=atLevel.slice(-5);let level=current.current_level;
 if(score>=75&&atLevel.length>=6&&lastFive.filter(a=>a.correct&&a.hint_level===0).length>=4)level=Math.min(4,level+1) as Level;
 else if(atLevel.length>=3&&atLevel.slice(-3).every(a=>!a.correct))level=Math.max(1,level-1) as Level;
 const recent=all.slice(-10);return {...current,mastery_score:score,current_level:level,recent_accuracy:recent.filter(a=>a.correct).length/recent.length,attempts_total:current.attempts_total+1,last_practiced_at:attempt.created_at};
}
export function completeStreak(streak:Streak,date:string):Streak{if(streak.last_session_date===date)return streak;const consecutive=streak.last_session_date!==null&&daysSince(streak.last_session_date,date)===1;const current=consecutive?streak.current+1:1;return {current,best:Math.max(streak.best,current),total_days:streak.total_days+1,last_session_date:date}}
export function visibleStreak(streak:Streak,date:string){return streak.last_session_date&&daysSince(streak.last_session_date,date)>1?0:streak.current}
