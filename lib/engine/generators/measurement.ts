import type {Exercise,Level,ExerciseVisual} from '../types';
import {random} from '../random';
import {variation} from './variation';
type Situation={scene:Extract<ExerciseVisual,{kind:'situation'}>['scene'];prompt:string;answer:string;label:string;hint:string};
const situations:Situation[]=[
 {scene:'fence',prompt:'Rodearemos el patio con una cerca, sin cubrir el suelo. ¿Qué debemos calcular?',answer:'perimetro',label:'Perímetro · longitud del borde',hint:'La cerca sigue el contorno.'},
 {scene:'blanket',prompt:'Una manta debe cubrir todo el suelo de la casita, sin sobrantes. ¿Qué debemos calcular?',answer:'area',label:'Área · superficie cubierta',hint:'Cubrir una superficie requiere unidades cuadradas.'},
 {scene:'bottle',prompt:'Queremos saber cuánto líquido cabe dentro de una botella. ¿Qué debemos medir?',answer:'volumen',label:'Volumen · espacio ocupado',hint:'Piensa en la capacidad del recipiente.'},
 {scene:'scale',prompt:'La balanza pesa una bolsa de alimento y muestra gramos. ¿Qué magnitud mide?',answer:'masa',label:'Masa · cantidad de materia',hint:'Gramos y kilogramos son unidades de masa.'},
 {scene:'pump',prompt:'Un medidor conectado a un depósito de aire muestra pascales. ¿Qué magnitud mide?',answer:'presion',label:'Presión · fuerza por área',hint:'Pa, atm y mmHg expresan presión; los gramos expresan masa.'},
 {scene:'material',prompt:'Comparamos dos bloques del mismo volumen y vemos cuál tiene más masa. ¿Qué propiedad comparamos?',answer:'densidad',label:'Densidad · masa por volumen',hint:'La densidad relaciona la masa con el volumen, no solo una de ellas.'},
];
export function measurement(skillId:string,level:Level,seed:string):Exercise {
 const selected=situations[variation(seed,situations.length)];
 const variants:Record<string,string[]>={
 perimetro:['¿Cuánta cinta rodea el borde de una mesa? Elige la magnitud.','Un marco recorre los cuatro lados de una foto. ¿Qué magnitud determina su longitud?'],
 area:['¿Cuánta pintura cubre una pared? Elige la magnitud.','Un mosaico cubre el suelo sin huecos. ¿Qué magnitud mide la superficie cubierta?'],
 volumen:['Una probeta indica mililitros de agua. ¿Qué magnitud expresa?','Medimos el espacio que ocupa una piedra al sumergirla en agua. ¿Qué magnitud buscamos?'],
 masa:['Una bolsa se etiqueta en kilogramos. ¿Qué magnitud indica?','Comparamos en una balanza dos porciones de arena. ¿Qué magnitud comparamos?'],
 presion:['Una fuerza actúa sobre una superficie. ¿Qué magnitud expresa la fuerza por cada unidad de área?','Un manómetro marca atmósferas. ¿Qué magnitud indica?'],
 densidad:['Un material tiene cierta masa por cada centímetro cúbico. ¿Qué propiedad describe esa relación?','Dos líquidos ocupan un litro cada uno, pero tienen distinta masa. ¿Qué propiedad puede explicar la diferencia?']};
 const prompt=level===1?selected.prompt:variants[selected.answer][(level-2)%2];
 const rng=random(seed+':options');
 const distractors=situations.filter(s=>s.answer!==selected.answer).map(s=>({s,key:rng()})).sort((a,b)=>a.key-b.key).slice(0,2).map(x=>x.s);
 const choices=[selected,...distractors].map(s=>({value:s.answer,label:s.label,key:rng()})).sort((a,b)=>a.key-b.key).map(({value,label})=>({value,label}));
 return {skillId,level,seed,prompt,answer:selected.answer,answerFormat:'choice',choices,visual:{kind:'situation',scene:selected.scene,description:prompt},errorSignatures:distractors.map(s=>({value:s.answer,errorType:`CONFUNDE_${selected.answer.toUpperCase()}_CON_${s.answer.toUpperCase()}`})),hints:[selected.hint,'Decide si importa el borde, la superficie, el espacio, la masa o una relación entre cantidades.',`La respuesta es ${selected.label.toLowerCase()}.`]};
}
