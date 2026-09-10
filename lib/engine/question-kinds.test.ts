import {describe,it,expect} from 'vitest';
import {validateQuestions} from './import-questions';
import {evaluate,exerciseFor} from './exercises';
import {parseKinds,hasKind} from './question-kinds';
import type {Skill} from './types';
const hints=['Observa la magnitud.','Piensa en su unidad.','La presión se mide en pascales.'];
describe('mixed question banks',()=>{
 it('keeps true and false as distinct selectable answers',()=>{
  const [q]=validateQuestions([{prompt:'La presión se mide en Pa.',answer:'Verdadero',answerFormat:'boolean',level:1,hints}]);
  const e={...q,skillId:'test',seed:'a',errorSignatures:[]};
  expect(evaluate(e,'verdadero')).toMatchObject({valid:true,correct:true});expect(evaluate(e,'falso')).toMatchObject({valid:true,correct:false});expect(evaluate(e,'tal vez')).toMatchObject({valid:false});expect(q.choices).toHaveLength(2);
 });
 it('validates matching pairs, incomplete entries and wrong associations',()=>{
  const [q]=validateQuestions([{prompt:'Relaciona magnitud y unidad.',answer:'0,1,2',answerFormat:'match',level:1,hints,matches:[{left:'Presión',right:'Pa'},{left:'Masa',right:'kg'},{left:'Volumen',right:'m³'}]}]);
  const e={...q,skillId:'test',seed:'a',errorSignatures:[]};
  expect(evaluate(e,'0,1,2')).toMatchObject({valid:true,correct:true});expect(evaluate(e,'1,0,2')).toMatchObject({valid:true,correct:false,errorType:'ASOCIACION_INCORRECTA'});expect(evaluate(e,'0,,2')).toMatchObject({valid:false});expect(evaluate(e,'0,0,2')).toMatchObject({valid:false});
  expect(()=>validateQuestions([{...q,matches:[{left:'Masa',right:'kg'},{left:'Masa',right:'g'}]}])).toThrow();
 });
 it('rejects unknown or empty format selections',()=>{expect(parseKinds(['match','choice','match'])).toEqual(['match','choice']);expect(()=>parseKinds([])).toThrow();expect(()=>parseKinds(['fake'])).toThrow();});
 it('preserves matching content through deterministic exercise selection',()=>{
  const [q]=validateQuestions([{prompt:'Relaciona.',answer:'0,1',answerFormat:'match',level:1,hints,matches:[{left:'Masa',right:'kg'},{left:'Volumen',right:'L'}]}]);
  const skill:Skill={id:'bank',name:'Medidas',subject:'fisica',description:'Medidas',active:true,priority:1,base_difficulty:1,created_at:'2026-09-10',family:'custom',questions:[q]};
  const e=exerciseFor(skill,{skillId:skill.id,family:'custom',level:1,seed:'v2:bank:0'});expect(e.matches).toEqual(q.matches);expect(hasKind(q,'match')).toBe(true);expect(hasKind(q,'open')).toBe(false);
 });
});
it('shuffles imported banks by session without changing existing v2 sessions',()=>{
 const questions=Array.from({length:10},(_,i)=>({prompt:`Pregunta ${i}`,answer:String(i),answerFormat:'number' as const,level:1 as const,hints:['a','b','c'] as [string,string,string]}));
 const skill:Skill={id:'bank',name:'Banco',subject:'fisica',description:'Banco',active:true,priority:1,base_difficulty:1,created_at:'2026-09-10',family:'custom',questions};
 const session=(seed:string)=>Array.from({length:10},(_,i)=>exerciseFor(skill,{skillId:skill.id,family:'custom',level:1,seed:`v3:${seed}:${i}`}).prompt);
 expect(new Set(session('one')).size).toBe(10);expect(session('one')).toEqual(session('one'));expect(session('one')).not.toEqual(session('two'));
});
