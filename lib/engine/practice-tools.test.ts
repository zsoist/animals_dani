import {describe,it,expect} from 'vitest';
import {calculate} from './calculator';
import {exerciseFor,evaluate} from './exercises';
import type {Skill,Level} from './types';
const base:Skill={id:'skill',name:'Test',subject:'matematicas',description:'Test',active:true,priority:1,base_difficulty:1,created_at:'2026-09-10',family:'equations'};
describe('Optional calculator',()=>{
 it('handles precedence, parentheses, signed numbers and decimal commas',()=>{expect(calculate('25×4+10')).toBe('110');expect(calculate('(25+5)÷10')).toBe('3');expect(calculate('-2×(-5)')).toBe('10');expect(calculate('0,1+0,2')).toBe('0.3');expect(calculate('1/4')).toBe('0.25');});
 it('rejects incomplete input, code, adjacent numbers and zero division',()=>{for(const text of ['','2+','(2+3','2(3)','1..2','1/0','process.exit()','2**3'])expect(()=>calculate(text)).toThrow();});
});
describe('Multiple choice with real diagnosis',()=>{
 it('has one correct choice and two valid distinct diagnostic distractors across 100 seeds per family/level',()=>{
  for(const family of ['equations','units','chemistry','area','perimeter'] as const)for(const level of [1,2,3,4] as Level[])for(let n=0;n<100;n++){
   const exercise=exerciseFor({...base,family},{skillId:base.id,family,level,seed:`v2:visual-${n}:0`});
   expect(exercise.choices).toHaveLength(3);
   expect(exercise.choices?.filter(c=>{const result=evaluate(exercise,c.value);expect(result.valid).toBe(true);return result.valid&&result.correct;})).toHaveLength(1);
   for(const choice of exercise.choices??[]){const result=evaluate(exercise,choice.value);if(result.valid&&!result.correct)expect(result.errorType).not.toBe('UNKNOWN');}
   expect(exerciseFor({...base,family},{skillId:base.id,family,level,seed:`v2:visual-${n}:0`})).toEqual(exercise);
  }
 });
 it('keeps every third exercise open and draws metric steps from the generated units',()=>{
  const ex=exerciseFor({...base,family:'units'},{skillId:'skill',family:'units',level:3,seed:'area:2'});expect(ex.choices).toBeUndefined();expect(ex.unitScale?.stepFactor).toBe(100);expect(ex.unitScale?.units).toContain(ex.unitScale?.source);expect(ex.unitScale?.units).toContain(ex.unitScale?.target);
 });
});
