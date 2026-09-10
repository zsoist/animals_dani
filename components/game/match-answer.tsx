'use client';
import type {Exercise} from '@/lib/engine/types';
import {random} from '@/lib/engine/random';
export function MatchAnswer({exercise,value,onChange,disabled=false}:{exercise:Pick<Exercise,'matches'|'seed'>;value:string;onChange:(value:string)=>void;disabled?:boolean}){
 const pairs=exercise.matches??[],rng=random(exercise.seed+':matches');
 const options=pairs.map((p,i)=>({label:p.right,value:String(i),sort:rng()})).sort((a,b)=>a.sort-b.sort);
 const chosen=value.split(',');
 return <fieldset className="match-answer" disabled={disabled}><legend>Relaciona cada elemento</legend>{pairs.map((pair,i)=><label key={i}><span>{pair.left}</span><select aria-label={`Relacionar ${pair.left}`} value={chosen[i]??''} onChange={e=>{const next=pairs.map((_,j)=>chosen[j]??'');next[i]=e.target.value;onChange(next.join(','));}}><option value="">Elige su pareja</option>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}</fieldset>;
}
