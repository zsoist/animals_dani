import 'server-only';
import {openLauraShelter} from './laura';
export type ShelterCat={id:string;name:string;personality:string;story:string;palette:{body:string;belly:string};unlockedAt:string;adoptedAt?:string|null;careCount?:number};
export async function getShelter():Promise<ShelterCat[]>{return openLauraShelter()}
