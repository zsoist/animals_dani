import type {Exercise,Level} from '../types';
import {random,integer} from '../random';
import {equivalentExpressions} from '../algebra';
type Formula={context:string;formula:string;target:string;answer:string;meaning:string;step:string;errors:[string,string][]};
export const formulaBank:Record<Level,Formula[]>={
 1:[
 {context:'Fuerza',formula:'F = m*a',target:'m',answer:'F/a',meaning:'F: fuerza · m: masa · a: aceleración',step:'Divide ambos lados entre a.',errors:[['F*a','OPERACION_INVERSA'],['a/F','FACTOR_INVERTIDO']]},
 {context:'Movimiento uniforme',formula:'d = v*t',target:'v',answer:'d/t',meaning:'d: distancia · v: rapidez · t: tiempo',step:'Divide ambos lados entre t.',errors:[['d*t','OPERACION_INVERSA'],['t/d','FACTOR_INVERTIDO']]},
 {context:'Cantidad de sustancia',formula:'m = n*M',target:'n',answer:'m/M',meaning:'m: masa · n: cantidad de sustancia · M: masa molar',step:'Divide ambos lados entre M.',errors:[['m*M','OPERACION_INVERSA'],['M/m','FACTOR_INVERTIDO']]},
 {context:'Área del rectángulo',formula:'A = b*h',target:'h',answer:'A/b',meaning:'A: área · b: base · h: altura',step:'Divide ambos lados entre b.',errors:[['A*b','OPERACION_INVERSA'],['b/A','FACTOR_INVERTIDO']]}
 ],
 2:[
 {context:'Presión',formula:'P = F/A',target:'A',answer:'F/P',meaning:'P: presión · F: fuerza · A: área',step:'Multiplica por A: P*A = F. Después divide entre P.',errors:[['P/F','FACTOR_INVERTIDO'],['F*P','OPERACION_INVERSA']]},
 {context:'Concentración en masa',formula:'C = m/V',target:'V',answer:'m/C',meaning:'C: concentración · m: masa de soluto · V: volumen de disolución',step:'Multiplica por V y después divide entre C.',errors:[['C/m','FACTOR_INVERTIDO'],['m*C','OPERACION_INVERSA']]},
 {context:'Densidad',formula:'D = m/V',target:'m',answer:'D*V',meaning:'D: densidad · m: masa · V: volumen',step:'Multiplica ambos lados por V.',errors:[['D/V','OPERACION_INVERSA'],['V/D','FACTOR_INVERTIDO']]},
 {context:'Área del triángulo',formula:'A = b*h/2',target:'h',answer:'2*A/b',meaning:'A: área · b: base · h: altura',step:'Multiplica por 2 y después divide entre b.',errors:[['A/(2*b)','OPERACION_INVERSA'],['2*A*b','ORDEN_OPERACIONES']]}
 ],
 3:[
 {context:'Velocidad con aceleración constante',formula:'v = u+a*t',target:'a',answer:'(v-u)/t',meaning:'v: velocidad final · u: velocidad inicial · a: aceleración · t: tiempo',step:'Resta u en ambos lados: v − u = a*t. Divide todo entre t.',errors:[['(v+u)/t','SIGNO_AL_TRANSPONER'],['v-u/t','ORDEN_OPERACIONES'],['(v-u)*t','OPERACION_INVERSA']]},
 {context:'Posición en movimiento uniforme',formula:'x = s+v*t',target:'t',answer:'(x-s)/v',meaning:'x: posición final · s: posición inicial · v: velocidad · t: tiempo',step:'Resta s y divide toda la diferencia entre v.',errors:[['(x+s)/v','SIGNO_AL_TRANSPONER'],['x-s/v','ORDEN_OPERACIONES'],['(x-s)*v','OPERACION_INVERSA']]},
 {context:'Masa de una disolución',formula:'m = s+d',target:'s',answer:'m-d',meaning:'m: masa total · s: masa de soluto · d: masa de disolvente',step:'Resta d en ambos lados.',errors:[['m+d','SIGNO_AL_TRANSPONER'],['d-m','ORDEN_OPERACIONES']]},
 {context:'Perímetro del triángulo',formula:'P = a+b+c',target:'b',answer:'P-a-c',meaning:'P: perímetro · a, b y c: lados',step:'Resta a y c en ambos lados.',errors:[['P+a+c','SIGNO_AL_TRANSPONER'],['P-a+c','ORDEN_OPERACIONES']]}
 ],
 4:[
 {context:'Área del trapecio',formula:'A = (B+b)*h/2',target:'b',answer:'2*A/h-B',meaning:'A: área · B: base mayor · b: base menor · h: altura',step:'Multiplica por 2, divide entre h y finalmente resta B.',errors:[['2*A/h+B','SIGNO_AL_TRANSPONER'],['2*A/(h-B)','ORDEN_OPERACIONES'],['A/(2*h)-B','OPERACION_INVERSA']]},
 {context:'Calor sin cambio de estado',formula:'Q = m*c*T',target:'c',answer:'Q/(m*T)',meaning:'Q: calor · m: masa · c: calor específico · T: cambio de temperatura',step:'Divide entre el producto m*T, no solo entre m.',errors:[['Q/m*T','ORDEN_OPERACIONES'],['Q*m*T','OPERACION_INVERSA']]},
 {context:'Perímetro del rectángulo',formula:'P = 2*(b+h)',target:'h',answer:'P/2-b',meaning:'P: perímetro · b: base · h: altura',step:'Divide ambos lados entre 2 y resta b.',errors:[['P/2+b','SIGNO_AL_TRANSPONER'],['(P-b)/2','ORDEN_OPERACIONES'],['2*P-b','OPERACION_INVERSA']]},
 {context:'Velocidad con aceleración constante',formula:'v = u+a*t',target:'t',answer:'(v-u)/a',meaning:'v: velocidad final · u: velocidad inicial · a: aceleración · t: tiempo',step:'Resta u y divide toda la diferencia entre a.',errors:[['(v+u)/a','SIGNO_AL_TRANSPONER'],['v-u/a','ORDEN_OPERACIONES'],['(v-u)*a','OPERACION_INVERSA']]}
 ]
};
export function equations(skillId:string,level:Level,seed:string):Exercise {
 const bank=formulaBank[level],f=bank[integer(random(seed),0,bank.length-1)];
 const errors:Exercise['errorSignatures']=[];
 for(const [value,errorType] of f.errors)if(!equivalentExpressions(value,f.answer)&&!errors.some(e=>equivalentExpressions(e.value,value)))errors.push({value,errorType});
 return {skillId,level,seed,prompt:`${f.context}: ${f.formula}. Despeja ${f.target}.`,answer:f.answer,answerFormat:'expression',formula:f.formula,target:f.target,symbolMeaning:f.meaning,errorSignatures:errors,hints:[`Queremos dejar ${f.target} sola. Deshaz las operaciones en ambos lados de la igualdad.`,f.step,`${f.step} Resultado: ${f.target} = ${f.answer}. No necesitas sustituir números.`]};
}
