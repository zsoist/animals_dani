import type {Level, Question, Skill} from './types';
export const DAILY_TARGET = 7;
export const DAILY_CHANCES = 3;
export type PracticeMode = 'daily' | 'free';
export type CareReward = 'food' | 'box' | 'bed' | 'treat';
export const rewardCopy: Record<CareReward, {title:string;delivered:string}> = {
  food: {title:'Comida para Milo',delivered:'¡La comida está servida! Milo viene a probarla.'},
  box: {title:'Una caja para Milo',delivered:'¡Una caja nueva! Milo ya quiere explorarla.'},
  bed: {title:'Una camita para descansar',delivered:'¡La camita está lista! Hora de acomodarse.'},
  treat: {title:'Una galletita para compartir',delivered:'¡Una galletita! Los gatos se acercan a compartir.'},
};
export function nextCareReward(totalDays:number):CareReward {
  return (['bed','food','box','treat'] as const)[totalDays % 4];
}
export function practiceLevels(skill:Skill):Level[] {
  return skill.family==='custom' ? [...new Set(skill.questions?.map(q=>q.level)??[])].sort() : [1,2,3,4];
}
export function freeQueue(skill:Skill,level:Level,seed:string):Question[] {
  if(!practiceLevels(skill).includes(level))throw new Error('Este nivel aún no tiene preguntas. Elige otro.');
  return Array.from({length:10},(_,i)=>({skillId:skill.id,family:skill.family,level,seed:`${seed}:${i}`}));
}
