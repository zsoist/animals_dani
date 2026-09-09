import type {Exercise,Level} from '../types';
import {random,integer,canonical,signatures} from '../random';
export function equations(skillId:string,level:Level,seed:string):Exercise{
 const rng=random(seed),x=integer(rng,2,15),a=integer(rng,2,8),b=integer(rng,2,12),c=integer(rng,2,6);
 let prompt:string;let errors:[number,string][];let hints:Exercise['hints'];
 if(level===1){const total=x+b;prompt=`Despeja x: x + ${b} = ${total}`;errors=[[total+b,'SIGNO_AL_TRANSPONER'],[x+1,'ARITMETICA']];hints=['Para dejar sola a x, deshaz la suma.',`Resta ${b} en ambos lados.`,`x = ${total} − ${b} = ${x}.`];}
 else if(level===2){const total=a*x+b;prompt=`Despeja x: ${a}x + ${b} = ${total}`;errors=[[(total+b)/a,'SIGNO_AL_TRANSPONER'],[(total-b)*a,'OPERACION_INVERSA'],[total/a-b,'ORDEN_OPERACIONES'],[x+1,'ARITMETICA']];hints=['Deshaz primero la suma y después la multiplicación.',`${a}x = ${total} − ${b} = ${a*x}.`,`x = (${total} − ${b}) / ${a} = ${x}.`];}
 else if(level===3){const numerator=a*x+b;prompt=`Despeja x: (${a}x + ${b}) / ${c} = ${canonical(numerator/c)}`;errors=[[(numerator+b)/a,'SIGNO_AL_TRANSPONER'],[((numerator/c)/c-b)/a,'OPERACION_INVERSA'],[((numerator/c)-b)*c/a,'ORDEN_OPERACIONES'],[x+1,'ARITMETICA']];hints=['El denominador afecta a todo el paréntesis.',`Multiplica ambos lados por ${c}: ${a}x + ${b} = ${numerator}.`,`Resta ${b} y divide por ${a}: x = ${x}.`];}
 else{prompt=`P = F / A. Si P = ${a} Pa y A = ${x} m², ¿cuánto vale F en N?`;errors=[[a/x,'OPERACION_INVERSA'],[a+x,'ORDEN_OPERACIONES'],[a*x+1,'ARITMETICA']];hints=['F está dividida por A. La operación inversa es multiplicar.',`Multiplica por A: F = P × A.`,`F = ${a} × ${x} = ${a*x} N.`];}
 const answer=canonical(level===4?a*x:x);return {skillId,level,seed,prompt,answer,answerFormat:'number',tolerance:1e-8,errorSignatures:signatures(answer,errors),hints};
}
