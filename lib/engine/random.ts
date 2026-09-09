export function random(seed:string){let value=2166136261;for(const char of seed)value=Math.imul(value^char.charCodeAt(0),16777619);return ()=>{value+=0x6d2b79f5;let n=value;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296}}
export function integer(rng:()=>number,min:number,max:number){return min+Math.floor(rng()*(max-min+1))}
export function canonical(value:number){return String(Number(value.toFixed(10)))}
export function signatures(answer:string,items:[number|string,string][]){const seen=new Set([answer]);return items.flatMap(([value,errorType])=>{const text=typeof value==='number'?canonical(value):value;if(seen.has(text))return [];seen.add(text);return [{value:text,errorType}]})}
export function gcd(a:number,b:number):number{return b===0?Math.abs(a):gcd(b,a%b)}
