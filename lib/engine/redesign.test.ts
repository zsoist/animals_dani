import {describe,it,expect} from 'vitest';
import {generate,evaluate,exerciseFor} from './exercises';
import {selectDaily,reinforce} from './selector';
import {completeStreak,visibleStreak} from './mastery';
import type {CustomQuestion,Skill,Level,Streak} from './types';
const own:CustomQuestion={prompt:'¿Qué fracción es equivalente a 2/4?',answer:'1/2',answerFormat:'fraction',level:1,hints:['Divide ambos términos.','Divide entre 2.','2/4 = 1/2.']};
const skill:Skill={id:'fractions',name:'Fracciones',subject:'matematicas',description:'Equivalencias',active:true,priority:5,base_difficulty:1,created_at:'2026-09-09T00:00:00Z',family:'custom',questions:[own]};
describe('Prácticas propias y respuestas editables',()=>{
 it('selecciona el contenido del tutor y acepta coma y fracciones equivalentes',()=>{const question=selectDaily([skill],[],'2026-09-09','mission')[0];const exercise=exerciseFor(skill,question);expect(exercise.prompt).toBe(own.prompt);for(const answer of ['0,5','0.5','2/4',' 1 / 2 '])expect(evaluate(exercise,answer)).toEqual({valid:true,correct:true,errorType:null});});
 it('no clasifica errores de escritura como errores académicos',()=>{const exercise=exerciseFor(skill,{skillId:skill.id,family:'custom',level:1,seed:'a'});for(const answer of ['','0,,5','1/0','--2','0-2'])expect(evaluate(exercise,answer).valid).toBe(false);});
 it('permite varias comas en coeficientes y detecta ratios no mínimos',()=>{const exercise=generate('chemistry','chem',1,'a');expect(evaluate(exercise,exercise.answer.replaceAll(',',', '))).toMatchObject({valid:true,correct:true});expect(evaluate(exercise,exercise.answer.split(',').map(n=>Number(n)*2).join(','))).toMatchObject({errorType:'RATIO_NO_MINIMO'});});
 it('usa semillas únicas y reinyecta tres posiciones después del error',()=>{const queue=selectDaily([skill],[],'2026-09-09','mission');expect(queue).toHaveLength(10);expect(new Set(queue.map(q=>q.seed)).size).toBe(10);const replay=reinforce(queue,0).slice(0,10);expect(replay[3]).toMatchObject({skillId:skill.id,level:1,reinforced:true});expect(replay[3].seed).not.toBe(queue[0].seed);expect(replay).toHaveLength(10);});
 it('reutiliza niveles con contenido sin inventar preguntas vacías',()=>{expect(exerciseFor(skill,{skillId:skill.id,family:'custom',level:4,seed:'a'}).prompt).toBe(own.prompt);});
});
describe('Racha real por día',()=>{const initial:Streak={current:0,best:0,total_days:0,last_session_date:null};it('no suma dos veces el mismo día y conserva el récord',()=>{const first=completeStreak(initial,'2026-09-09');expect(completeStreak(first,'2026-09-09')).toEqual(first);const next=completeStreak(first,'2026-09-10');expect(next.current).toBe(2);expect(visibleStreak(next,'2026-09-12')).toBe(0);expect(completeStreak(next,'2026-09-12')).toMatchObject({current:1,best:2,total_days:3});});});
function atoms(formula:string):Record<string,number>{let index=0;const parse=():Record<string,number>=>{const result:Record<string,number>={};while(index<formula.length&&formula[index]!==')'){if(formula[index]==='('){index++;const nested=parse();index++;const digits=formula.slice(index).match(/^\d+/)?.[0]??'';index+=digits.length;const multiplier=Number(digits||1);for(const [key,value] of Object.entries(nested))result[key]=(result[key]??0)+value*multiplier;}else{const element=formula.slice(index).match(/^[A-Z][a-z]?/)?.[0];if(!element)throw new Error('Fórmula inválida');index+=element.length;const digits=formula.slice(index).match(/^\d+/)?.[0]??'';index+=digits.length;result[element]=(result[element]??0)+Number(digits||1);}}return result;};return parse();}
describe('1200 problemas resueltos independientemente',()=>{for(const family of ['equations','units','chemistry'] as const)for(const level of [1,2,3,4] as Level[])it(`${family}, nivel ${level}: cien semillas`,()=>{for(let seed=0;seed<100;seed++){const exercise=generate(family,'skill',level,`independent-${seed}`);const signatures=exercise.errorSignatures.map(s=>s.value);expect(new Set(signatures).size).toBe(signatures.length);expect(signatures).not.toContain(exercise.answer);expect(generate(family,'skill',level,`independent-${seed}`)).toEqual(exercise);
 if(family==='equations'){
 const letters=[...new Set((exercise.formula??'').match(/[A-Za-z]/g))];
 // Independent numerical substitution checks the original identity, not the parser under test.
 for(let trial=1;trial<=10;trial++){
 const values=Object.fromEntries(letters.map((letter,i)=>[letter,trial+i+2]));
 const calculate=(expression:string):number=>Number(Function(...letters,`"use strict"; return (${expression});`)(...letters.map(letter=>values[letter])));
 values[exercise.target!]=calculate(exercise.answer);
 const [lhs,rhs]=exercise.formula!.split('=');expect(calculate(lhs)).toBeCloseTo(calculate(rhs),8);
 }
 }
 if(family==='units'){const c=exercise.conversion;expect(c).toBeDefined();const si:Record<string,number>={km:1000,m:1,cm:.01,mm:.001,t:1000,kg:1,g:.001,mg:.000001,L:.001,mL:.000001,cL:.00001,dL:.0001,'m³':1,'dm³':.001,'cm³':.000001,'m²':1,'dm²':.01,'cm²':.0001,'g/cm³':1000,'kg/m³':1,'kg/L':1000,'g/L':1,Pa:1,kPa:1000,hPa:100,MPa:1000000,atm:101325,mmHg:101325/760};expect(Number(exercise.answer)).toBeCloseTo(c!.value*si[c!.source]/si[c!.target],7);}

 if(family==='chemistry'){const formula=exercise.prompt.split(': ')[1].split('. Escribe')[0];const [left,right]=formula.split(' → ');const coefficients=exercise.answer.split(',').map(Number);let position=0;const tally=(side:string)=>{const total:Record<string,number>={};for(const molecule of side.split(' + ')){const coefficient=coefficients[position++];for(const [element,count] of Object.entries(atoms(molecule)))total[element]=(total[element]??0)+count*coefficient;}return total;};expect(tally(left)).toEqual(tally(right));}
 }});});
