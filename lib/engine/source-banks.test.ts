import {describe,it,expect} from 'vitest';
import equations from '../../supabase/banks/equations.json';
import conversion from '../../supabase/banks/conversion.json';
import {validateDriveBank} from './drive-bank';
import {exerciseFor,evaluate} from './exercises';
import {selectDaily} from './selector';
import type {Skill} from './types';
for(const [name,source] of Object.entries({equations,conversion}))describe(`Real PDF: ${name}`,()=>{
 const questions=validateDriveBank(source);
 const skill:Skill={id:name,name,questions,family:'custom',driveFileId:name,subject:'fisica',description:'PDF',active:true,priority:1,base_difficulty:1,created_at:'2026-09-16'};
 it('preserves all 50 questions and the original numbering and four difficulty groups',()=>{
  expect(questions).toHaveLength(50);
  expect(questions).toEqual(source);
  expect(questions.map(q=>q.sourceNumber)).toEqual(Array.from({length:50},(_,i)=>i+1));
  expect([1,2,3,4].map(level=>questions.filter(q=>q.level===level).length)).toEqual([13,13,12,12]);
  for(const q of questions){expect(evaluate({...q,skillId:name,seed:'source',errorSignatures:[]},q.answer)).toMatchObject({valid:true,correct:true});expect(q.prompt).not.toMatch(/\s[23]\s[23]$/);}
 });
 it('100 daily sessions draw ten distinct questions progressively and keep shuffled answers correct',()=>{
  const orders=new Set<string>();
  for(let i=0;i<100;i++){
   const queue=selectDaily([skill],[],'2026-09-16',`pdf-${i}`);
   const exercises=queue.map(q=>exerciseFor(skill,{...q,seed:q.seed.replace('v2:','v4:')}));
   expect(new Set(exercises.map(e=>e.prompt)).size).toBe(10);
   expect(exercises.map(e=>e.level)).toEqual([1,1,1,2,2,2,3,3,4,4]);
   for(const e of exercises){expect(evaluate(e,e.answer)).toMatchObject({valid:true,correct:true});if(e.answerFormat==='choice'){orders.add(e.choices!.map(c=>c.value).join(''));const original=questions.find(q=>q.prompt===e.prompt)!;expect(e.choices!.find(c=>c.value===e.answer)?.label).toBe(original.choices!.find(c=>c.value===original.answer)?.label);}}
  }
  expect(orders.size).toBeGreaterThan(10);
 });
});
it('preserves subscripts and squared/cubed units from the PDF',()=>{
 expect(equations[37].prompt).toContain('P_abs − P_h');
 expect(equations[43].choices?.[0].label).toBe('T_2 = V_2T_1/V_1');
 expect(conversion[27].choices?.every(c=>c.label.endsWith('m²'))).toBe(true);
 expect(conversion[33].choices?.every(c=>c.label.endsWith('m³'))).toBe(true);
});
it('numeric solutions agree with independent arithmetic from the printed questions',()=>{
 const eqValues:Record<number,number>={1:19-8,4:14+9,7:30-17,10:10+16,13:28-9,14:42/6,17:6*7,20:60/5,23:8*6,26:91/7,49:(39-7)/4,50:(22+5)/3};
 const conversions:Record<number,number>={14:4*1000,16:9000/1000,19:3000000/1000000,20:8*1000,22:2*760,24:202650/101325,27:5*100**2,29:2*1000**2,31:6000000/1000**2,33:7*100**3,35:5*1000,38:12000000/100**3,40:5000/1000,43:6000/1000,45:3*100**3,48:8*1000};
 for(const [number,result] of Object.entries(eqValues))expect(Number(equations[Number(number)-1].answer)).toBe(result);
 for(const [number,result] of Object.entries(conversions))expect(Number(conversion[Number(number)-1].answer)).toBe(result);
});
