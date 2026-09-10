'use client';
import {useState} from 'react';
import {calculate} from '@/lib/engine/calculator';
import {track} from '@/components/telemetry/client';
import {Icon} from './icons';
export function Calculator({sessionId,skillId}:{sessionId:string;skillId:string}) {
 const [expression,setExpression]=useState(''),[result,setResult]=useState(''),[error,setError]=useState('');
 function key(value:string){setError('');if(value==='='){try{setResult(calculate(expression).replace('.',','));track('control_used',{control:'calculator_result'},{sessionId,skillId});}catch(cause){setError(cause instanceof Error?cause.message:'Revisa la operación.');}return;}setResult('');setExpression(old=>value==='C'?'':value==='back'?old.slice(0,-1):(old+value).slice(0,80));}
 return <details className="exercise-calculator" onToggle={e=>{if(e.currentTarget.open)track('control_used',{control:'calculator_open'},{sessionId,skillId});}}><summary><Icon name="calculator" size={19}/>Calculadora<span>Opcional</span></summary><div className="calculator-body" role="group" aria-label="Calculadora">
 <input aria-label="Operación de calculadora" value={expression} readOnly inputMode="none" placeholder="Por ejemplo, 25 × 4" onKeyDown={e=>{if(/^[\d.,+*/()\-]$/.test(e.key)){e.preventDefault();key(e.key);}else if(e.key==='Enter'){e.preventDefault();key('=');}else if(e.key==='Backspace'){e.preventDefault();key('back');}}}/>
 <output aria-live="polite">{error|| (result?`= ${result}`:'Tu ayuda para las cuentas')}</output>
 <div className="calculator-keys">{['C','(',')','back','7','8','9','÷','4','5','6','×','1','2','3','−','0',',','=','+'].map(k=><button type="button" key={k} className={k==='='?'calc-equals':''} aria-label={k==='back'?'Borrar en calculadora':k==='C'?'Limpiar calculadora':k} onClick={()=>key(k)}>{k==='back'?<Icon name="erase" size={18}/>:k}</button>)}</div></div></details>;
}
