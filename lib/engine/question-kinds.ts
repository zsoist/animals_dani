import type {CustomQuestion} from './types';
export const questionKinds=[['open','Abierta'],['choice','Opción múltiple'],['boolean','Verdadero o falso'],['match','Relacionar parejas']] as const;
export type QuestionKind=typeof questionKinds[number][0];
export function parseKinds(input:unknown):QuestionKind[]{
 if(input===undefined)return [];
 if(!Array.isArray(input)||!input.length||input.some(v=>!questionKinds.some(([id])=>id===v)))throw new Error('Elige al menos un tipo de pregunta.');
 return [...new Set(input)] as QuestionKind[];
}
export function hasKind(q:CustomQuestion,kind:QuestionKind){return kind==='open'?['number','fraction','expression','text','coefficients'].includes(q.answerFormat):q.answerFormat===kind;}
