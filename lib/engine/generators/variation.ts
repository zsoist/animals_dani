import {random} from '../random';
// Rotate within a session, rather than drawing the same template repeatedly.
export function variation(seed:string,count:number):number {
 const match=seed.match(/^(.*):(\d+)(:repaso)?$/);
 const base=match?.[1]??seed;
 return (Math.floor(random(base)()*count)+Number(match?.[2]??0)+(match?.[3]?1:0))%count;
}
