import type {Exercise,ExerciseVisual,Level} from '../types';
import {random,integer,canonical,signatures} from '../random';
import {variation} from './variation';
export function geometry(skillId:string,level:Level,seed:string,family:'perimeter'|'area'):Exercise {
 const rng=random(seed),width=integer(rng,3,7)*2,height=integer(rng,2,5)*2;
 const area=family==='area',variant=variation(seed,3);
 let shape:Extract<ExerciseVisual,{kind:'geometry'}>['shape']='rectangle',w=width,h=height,cut:number|undefined;
 let answer:number,description:string,method:string,concept:string;
 if(level===1&&variant===0)h=w;
 if(area&&level===2){shape=variant===0?'mosaic':'triangle';}
 if(level>=3&&variant!==0){shape='cutout';cut=2;}
 if(shape==='mosaic')h=w;
 if(area&&level===4&&variant===0){shape='mosaic';w=8;h=8;}
 if(!area&&level===2&&variant===0){shape='triangle';w=6;h=8;}
 if(shape==='triangle'){
  answer=area?w*h/2:24;
  description=area?`Triángulo de base ${w} cm y altura perpendicular ${h} cm.`:'Triángulo rectángulo con lados 6 cm, 8 cm y 10 cm.';
  method=area?`${w} × ${h} ÷ 2`:'6 + 8 + 10';concept=area?'Un triángulo ocupa la mitad de un rectángulo de igual base y altura.':'El perímetro suma todos los lados; la altura interior no es un lado.';
 }else if(shape==='cutout'){
  answer=area?w*h-(cut??0)**2:2*(w+h);
  description=`Figura en L: rectángulo de ${w} cm por ${h} cm al que se quitó un cuadrado de ${cut} cm de lado de la esquina superior derecha.`;
  method=area?`${w} × ${h} − ${cut} × ${cut}`:`${w} + ${h-(cut??0)} + ${cut} + ${cut} + ${w-(cut??0)} + ${h}`;
  concept=area?'Calcula la superficie completa y resta el hueco.':'Recorre todo el borde, incluyendo los dos lados de la esquina recortada.';
 }else{
  answer=area?w*h:2*(w+h);
  description=shape==='mosaic'?`Mosaico cuadrado de ${w} cm por ${h} cm dividido en cuatro triángulos sin huecos ni superposiciones.`:`${w===h?'Cuadrado':'Rectángulo'} de ${w} cm por ${h} cm.`;
  method=area?`${w} × ${h}`:`2 × (${w} + ${h})`;
  concept=area?'El área mide la superficie cubierta. Dividirla en piezas no cambia su área total.':'El perímetro mide la longitud de todo el contorno.';
 }
 const action=area?(variant===0?'Queremos cubrir el suelo con una manta.':'Queremos pintar toda la superficie.'):(variant===0?'Queremos poner una cerca alrededor.':'Queremos decorar todo el borde con cinta.');
 const prompt=`${description} ${action} ¿Cuántos ${area?'cm²':'cm'} necesitamos?`;
 const canonicalAnswer=canonical(answer);
 return {skillId,level,seed,prompt,displayPrompt:area?(variant===0?"¿Cuántos cm² de manta cubren esta figura?":"¿Qué área debemos pintar, en cm²?"):"¿Cuánta cinta rodea la figura, en cm?",answer:canonicalAnswer,answerFormat:'number',visual:{kind:'geometry',shape,width:w,height:h,cut,unit:'cm',highlight:area?'surface':'border',description},errorSignatures:signatures(canonicalAnswer,[[area?2*(w+h):w*h,'CONFUNDE_AREA_PERIMETRO'],[area?w+h:w+h,'SUMA_INCOMPLETA'],[area&&shape==='triangle'?w*h:answer+2,'FORMULA_INCORRECTA'],[area&&shape==='cutout'?w*h:answer-1,'OMITE_PARTE_FIGURA']]),hints:[concept,`Usa ${method}.`,`${method} = ${canonicalAnswer} ${area?'cm²':'cm'}.`]};
}
