import type {Attempt} from './types';
export const practiceDate=(iso:string)=>new Date(iso).toLocaleDateString('en-CA',{timeZone:'America/Bogota'});
const accuracy=(rows:Attempt[])=>rows.length?Math.round(rows.filter(a=>a.correct).length*100/rows.length):null;
export function weeklyProgress(attempts:Attempt[],today:string){
 const days=Array.from({length:7},(_,i)=>new Date(Date.parse(today+'T12:00:00Z')-(6-i)*86400000).toISOString().slice(0,10));
 return days.map(date=>{const rows=attempts.filter(a=>practiceDate(a.created_at)===date);return {date,total:rows.length,accuracy:accuracy(rows),hints:rows.filter(a=>a.hint_level>0).length,minLevel:rows.length?Math.min(...rows.map(a=>a.level))-1:null,maxLevel:rows.length?Math.max(...rows.map(a=>a.level))-1:null};});
}
export function repeatedProgress(attempts:Attempt[]){
 const days=[...new Set(attempts.map(a=>practiceDate(a.created_at)))].sort().reverse();
 if(days.length<2)return null;
 const current=attempts.filter(a=>practiceDate(a.created_at)===days[0]);const previous=attempts.filter(a=>practiceDate(a.created_at)===days[1]);
 const levels=[...new Set(current.map(a=>a.level))].filter(l=>previous.some(a=>a.level===l));
 const a=current.filter(r=>levels.includes(r.level)),b=previous.filter(r=>levels.includes(r.level));
 if(!a.length||!b.length)return null;
 return {date:days[0],previousDate:days[1],delta:accuracy(a)!-accuracy(b)!,current:accuracy(a)!,previous:accuracy(b)!,currentCount:a.length,previousCount:b.length,levels:levels.map(l=>l-1)};
}
