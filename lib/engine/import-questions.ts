import type {CustomQuestion} from './types';
import {evaluate,normalizedText} from './exercises';
export function validateQuestions(value:unknown,defaultHints=false):CustomQuestion[]{
 if(!Array.isArray(value)||value.length<1||value.length>60)throw new Error('Añade entre 1 y 60 preguntas.');
 return value.map((item:unknown,index)=>{
  if(!item||typeof item!=='object')throw new Error(`Pregunta ${index+1}: formato inválido.`);
  const q=item as Record<string,unknown>,prefix=`Pregunta ${index+1}: `;
  if(typeof q.prompt!=='string'||!q.prompt.trim()||q.prompt.length>4000)throw new Error(prefix+'escribe un enunciado de hasta 4000 caracteres.');
  const answer=typeof q.answer==='number'&&Number.isFinite(q.answer)?String(q.answer):typeof q.answer==='string'?q.answer.trim():'';
  if(!answer||answer.length>100)throw new Error(prefix+'escribe una respuesta de hasta 100 caracteres.');
  if(!['number','fraction','coefficients','expression','text','choice'].includes(String(q.answerFormat)))throw new Error(prefix+'elige Número, Fracción, Expresión, Texto corto u Opciones.');
  if(![1,2,3,4].includes(Number(q.level)))throw new Error(prefix+'elige un nivel de 0 a 3.');
  const fallback=['Vuelve a leer qué te pide el enunciado.','Identifica los datos y el concepto que necesitas aplicar.',`La respuesta propuesta por tu profe es: ${answer}. Compara con tu razonamiento.`];
  const hints=Array.isArray(q.hints)?q.hints:[];
  const prepared=[0,1,2].map(i=>typeof hints[i]==='string'&&hints[i].trim()?hints[i].trim():defaultHints?fallback[i]:'');
  if(prepared.some(h=>!h))throw new Error(prefix+'faltan las tres pistas de la propuesta IA.');
  const question:CustomQuestion={prompt:q.prompt.trim(),answer,answerFormat:q.answerFormat as CustomQuestion['answerFormat'],level:Number(q.level) as CustomQuestion['level'],hints:prepared as CustomQuestion['hints']};
  if(q.answerFormat==='choice'){
   if(!Array.isArray(q.choices)||q.choices.length<2||q.choices.length>6)throw new Error(prefix+'añade entre 2 y 6 opciones.');
   question.choices=q.choices.map((c:unknown)=>{if(typeof c==='string')return {value:c.trim(),label:c.trim()};if(c&&typeof c==='object'){const row=c as Record<string,unknown>;if(typeof row.value==='string'&&typeof row.label==='string')return {value:row.value.trim(),label:row.label.trim()};}throw new Error(prefix+'revisa las opciones.');});
   if(question.choices.some(c=>!c.value||!c.label||c.value.length>100||c.label.length>160)||new Set(question.choices.map(c=>normalizedText(c.value))).size!==question.choices.length)throw new Error(prefix+'las opciones deben tener texto y ser diferentes.');
   const correct=question.choices.find(c=>normalizedText(c.value)===normalizedText(answer));
   if(!correct)throw new Error(prefix+'la respuesta correcta debe coincidir con una opción.');question.answer=correct.value;
  }
  if(q.answerFormat==='expression'&&/\b[a-záéíóúñ]{4,}\b/i.test(answer))throw new Error(prefix+'la respuesta parece texto. Elige Texto corto u Opciones en Formato.');
  if(typeof q.image==='string'&&q.image){const safe=/^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(q.image)&&q.image.length<=450000;if(!safe&&defaultHints)throw new Error(prefix+'la imagen debe pesar menos de 330 KB.');if(safe){question.image=q.image;question.imageAlt=typeof q.imageAlt==='string'?q.imageAlt.slice(0,300):'Imagen del ejercicio';}}
  const check=evaluate({...question,skillId:'import',seed:'import',errorSignatures:[]},question.answer);
  if(!check.valid)throw new Error(prefix+check.message);
  return question;
 });
}
