import type {Family} from './types';
export const generatedFamilies = ['equations','units','chemistry','perimeter','area','measurement'] as const;
export const familyLabels:Record<Exclude<Family,'custom'>,string>={equations:'Despejar ecuaciones',units:'Conversión de unidades',chemistry:'Balanceo químico',perimeter:'Calcular perímetros',area:'Calcular áreas',measurement:'Identificar qué medir'};
export function isGeneratedFamily(value:unknown):value is Exclude<Family,'custom'>{return generatedFamilies.some(f=>f===value);}
export function subjectFamily(subject:string):Exclude<Family,'custom'>{return subject==='matematicas'?'equations':subject==='fisica'?'units':'chemistry';}
