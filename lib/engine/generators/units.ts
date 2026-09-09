import type {Exercise,Level} from '../types';
import {random,integer,canonical,signatures} from '../random';
export function units(skillId:string,level:Level,seed:string):Exercise{
 const rng=random(seed);const value=integer(rng,1,90);const reverse=rng()>.5;
 let source:string,target:string,factor:number,concept:string;
 if(level===1){source=reverse?'m':'cm';target=reverse?'cm':'m';factor=reverse?100:.01;concept='Un metro contiene 100 centímetros.';}
 else if(level===2){const volume=rng()>.5;source=volume?(reverse?'L':'mL'):(reverse?'kg':'g');target=volume?(reverse?'mL':'L'):(reverse?'g':'kg');factor=reverse?1000:.001;concept=volume?'Un litro contiene 1000 mililitros.':'Un kilogramo contiene 1000 gramos.';}
 else if(level===3){source=reverse?'m²':'cm²';target=reverse?'cm²':'m²';factor=reverse?10000:.0001;concept='En un área, el factor de longitud se eleva al cuadrado: 100 × 100 = 10 000.';}
 else{source=reverse?'kg/m³':'g/cm³';target=reverse?'g/cm³':'kg/m³';factor=reverse?.001:1000;concept='1 g = 0,001 kg y 1 cm³ = 0,000001 m³. Divide los dos factores.';}
 const answer=canonical(value*factor);const errors:[number,string][]=[[value/factor,'FACTOR_INVERTIDO'],[value*factor*10,'CORRIMIENTO_DECIMAL']];if(level===3)errors.unshift([value*(reverse?100:.01),'FACTOR_LINEAL_EN_AREA']);
 return {skillId,level,seed,prompt:`Convierte ${value} ${source} a ${target}.`,answer,answerFormat:'number',tolerance:1e-9,errorSignatures:signatures(answer,errors),hints:[concept,`Multiplica ${value} por ${canonical(factor)}.`,`${value} × ${canonical(factor)} = ${answer} ${target}.`]};
}
