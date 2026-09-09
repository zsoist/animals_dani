export function careEnergy(lastCare:string|null|undefined,today:string){
 if(!lastCare)return 85;
 const elapsed=Math.floor((Date.parse(today+'T12:00:00Z')-Date.parse(lastCare.slice(0,10)+'T12:00:00Z'))/86400000);
 return Number.isFinite(elapsed)?Math.max(55,100-Math.max(0,elapsed-1)*15):85;
}
