import {describe,it,expect} from 'vitest';
import {equivalentExpressions,parseExpression} from './algebra';
import {evaluate} from './exercises';
import {equations,formulaBank} from './generators/equations';
import type {Level} from './types';
describe('Álgebra exacta para despejar, sin cálculo mental',()=>{
 it('acepta equivalencias, productos implícitos, distribución y paréntesis',()=>{
 for(const [a,b] of [['F/a','(F)/a'],['A*P','PA'],['(v-u)/t','v/t-u/t'],['2*A/h-B','(2*A-B*h)/h'],['Q/(m*T)','Q/T/m']])expect(equivalentExpressions(a,b)).toBe(true);
 });
 it('distingue signos, mayúsculas y el alcance de una división',()=>{
 for(const [a,b] of [['(v-u)/t','v-u/t'],['Q/(m*T)','Q/m*T'],['m/M','M/m'],['P-a-c','P-a+c']])expect(equivalentExpressions(a,b)).toBe(false);
 });
 it('rechaza sintaxis incompleta y división por cero',()=>{
 for(const bad of ['', 'F/', '(F/a', 'F/(a-a)','F**a','F//a','console.log(1)','100000000*F'])expect(()=>parseExpression(bad)).toThrow();
 });
 it('clasifica firmas sin confundirlas con respuestas equivalentes',()=>{
 for(const level of [1,2,3,4] as Level[])for(let seed=0;seed<100;seed++){
 const e=equations('skill',level,String(seed));
 expect(evaluate(e,`${e.target} = ${e.answer}`)).toMatchObject({valid:true,correct:true});
 for(const sig of e.errorSignatures)expect(evaluate(e,sig.value)).toEqual({valid:true,correct:false,errorType:sig.errorType});
 expect(evaluate(e,'?')).toMatchObject({valid:false});
 expect(evaluate(e,e.target!)).toMatchObject({errorType:'VARIABLE_SIN_AISLAR'});
 }
 });
 it('cada fórmula tiene significado de sus letras y una solución sin la incógnita',()=>{
 for(const templates of Object.values(formulaBank))for(const f of templates){expect(f.meaning.length).toBeGreaterThan(15);expect(f.answer).not.toContain(f.target);}
 });
});
