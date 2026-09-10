import {describe,it,expect} from 'vitest';
import {generate,exerciseFor,evaluate} from './exercises';
import {freeQueue} from './challenge';
import {selectDaily} from './selector';
import {legacyUnits} from './generators/units-legacy';
import type {Level,Skill} from './types';
const base:Skill={id:'visual',name:'Visual',subject:'matematicas',description:'Práctica',active:true,priority:1,base_difficulty:1,created_at:'2026-09-09',family:'units'};
describe('Visual micro-skills',()=>{
 for(const family of ['area','perimeter','measurement'] as const)for(const level of [1,2,3,4] as Level[])it(`${family} level ${level}: 100 independently checked seeds`,()=>{
  for(let i=0;i<100;i++){
   const e=generate(family,'s',level,`v2:geometry-${i}:${i%10}`);
   expect(generate(family,'s',level,e.seed)).toEqual(e);
   expect(evaluate(e,e.answer)).toMatchObject({valid:true,correct:true});
   const signatures=e.errorSignatures.map(s=>s.value);expect(new Set(signatures).size).toBe(signatures.length);expect(signatures).not.toContain(e.answer);
   for(const s of e.errorSignatures)expect(evaluate(e,s.value)).toMatchObject({valid:true,correct:false,errorType:s.errorType});
   if(e.visual?.kind==='geometry'){
    const {width:w,height:h,cut:c=0,shape}=e.visual;
    const vertices=shape==='triangle'?[[0,0],[w,0],[0,h]]:shape==='cutout'?[[0,0],[w-c,0],[w-c,c],[w,c],[w,h],[0,h]]:[[0,0],[w,0],[w,h],[0,h]];
    let perimeter=0,area=0;
    vertices.forEach(([x,y],j)=>{const [a,b]=vertices[(j+1)%vertices.length];perimeter+=Math.hypot(a-x,b-y);area+=x*b-a*y;});
    expect(Number(e.answer)).toBeCloseTo(family==='area'?Math.abs(area)/2:perimeter,8);
   }else{
    expect(e.choices).toHaveLength(3);expect(e.choices?.filter(c=>evaluate(e,c.value).valid&&c.value===e.answer)).toHaveLength(1);
    expect(evaluate(e,'no soy una opción')).toMatchObject({valid:false});
   }
  }
 });
 it('rotates conversion unit pairs and instruments across every ten-question fixed-level session',()=>{
  for(const level of [1,2,3,4] as Level[])for(let n=0;n<100;n++){
   const exercises=freeQueue(base,level,`session-${n}`).map(q=>exerciseFor(base,q));
   expect(new Set(exercises.map(e=>[e.conversion?.source,e.conversion?.target].sort().join(':'))).size).toBeGreaterThanOrEqual(6);
   expect(new Set(exercises.map(e=>e.visual?.kind==='conversion'?e.visual.instrument:'')).size).toBeGreaterThanOrEqual(2);
   for(const e of exercises){expect(Number.isInteger(e.conversion?.value)).toBe(true);expect(Number.isInteger(Number(e.answer))).toBe(true);expect(evaluate(e,e.answer)).toMatchObject({correct:true});}
  }
 });
 it('preserves old queued exercises and versions new daily and free queues',()=>{
  const old={skillId:base.id,family:base.family,level:2 as const,seed:'old-session:0'};
  const e=exerciseFor(base,old);expect(e.prompt).toBe(legacyUnits(base.id,2,old.seed).prompt);expect(e.answer).toBe(legacyUnits(base.id,2,old.seed).answer);
  expect(selectDaily([base],[],'2026-09-10','new').every(q=>q.seed.startsWith('v2:'))).toBe(true);
  expect(freeQueue(base,1,'new').every(q=>q.seed.startsWith('v2:'))).toBe(true);
 });
 it('keeps physical equivalences explicit and does not draw a decimal staircase for atmospheres',()=>{
  const examples=Array.from({length:100},(_,i)=>generate('units','s',3,`v2:pressure:${i}`));
  const pressure=examples.filter(e=>e.conversion?.source==='atm'||e.conversion?.target==='atm');expect(pressure.length).toBeGreaterThan(0);
  for(const e of pressure){expect(e.unitScale).toBeUndefined();if(e.conversion?.source==='mmHg'||e.conversion?.target==='mmHg')expect(e.visual?.kind==='conversion'&&e.visual.equivalence).toContain('aproximación');}
 });
});
