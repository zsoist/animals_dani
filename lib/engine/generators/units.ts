import type {Exercise,ExerciseVisual,Level} from '../types';
import {random,integer,canonical,signatures} from '../random';
import {variation} from './variation';
type Pair={source:string;target:string;factor:number;equivalence:string;instrument:Extract<ExerciseVisual,{kind:'conversion'}>['instrument'];scale?:string[];step?:number;power?:number};
const metric=(source:string,target:string,factor:number,equivalence:string,instrument:Pair['instrument'],scale?:string[],step=10,power=1):Pair=>({source,target,factor,equivalence,instrument,scale,step,power});
const length=['km','hm','dam','m','dm','cm','mm'],mass=['kg','hg','dag','g','dg','cg','mg'],litres=['kL','hL','daL','L','dL','cL','mL'];
const basic:Pair[]=[
 metric('m','cm',100,'1 m = 100 cm','ladder',length),
 metric('kg','g',1000,'1 kg = 1000 g','balance',mass),
 metric('L','mL',1000,'1 L = 1000 mL','vessel',litres),
 metric('cm','mm',10,'1 cm = 10 mm','ladder',length),
 metric('g','mg',1000,'1 g = 1000 mg','balance',mass),
 metric('L','cL',100,'1 L = 100 cL','vessel',litres),
 metric('km','m',1000,'1 km = 1000 m','ladder',length),
 metric('L','dL',10,'1 L = 10 dL','vessel',litres),
];
const intermediate:Pair[]=[
 metric('kPa','Pa',1000,'1 kPa = 1000 Pa','gauge'),
 metric('t','kg',1000,'1 t = 1000 kg','balance'),
 metric('dm³','L',1,'1 dm³ = 1 L','vessel'),
 metric('MPa','kPa',1000,'1 MPa = 1000 kPa','gauge'),
 metric('g','mg',1000,'1 g = 1000 mg','balance',mass),
 metric('cm³','mL',1,'1 cm³ = 1 mL','vessel'),
 metric('hPa','Pa',100,'1 hPa = 100 Pa','gauge'),
 metric('m³','L',1000,'1 m³ = 1000 L','vessel'),
];
const advanced:Pair[]=[
 metric('m²','cm²',10000,'1 m² = 10 000 cm²','ladder',['m²','dm²','cm²'],100,2),
 metric('atm','Pa',101325,'1 atm = 101 325 Pa','gauge'),
 metric('dm³','cm³',1000,'1 dm³ = 1000 cm³','vessel',['m³','dm³','cm³'],1000,3),
 metric('atm','mmHg',760,'Usa la aproximación escolar: 1 atm ≈ 760 mmHg','gauge'),
 metric('m²','dm²',100,'1 m² = 100 dm²','ladder',['m²','dm²','cm²'],100,2),
 metric('m³','dm³',1000,'1 m³ = 1000 dm³','vessel',['m³','dm³','cm³'],1000,3),
];
const compound:Pair[]=[
 metric('g/cm³','kg/m³',1000,'1 g = 0,001 kg; 1 cm³ = 0,000001 m³','density'),
 metric('kg/L','g/L',1000,'1 kg = 1000 g; el litro no cambia','density'),
 metric('g/L','kg/m³',1,'1 g = 0,001 kg; 1 L = 0,001 m³','density'),
 metric('atm','mmHg',760,'Usa la aproximación escolar: 1 atm ≈ 760 mmHg','gauge'),
 metric('g/cm³','kg/L',1,'1 g = 0,001 kg; 1 cm³ = 0,001 L','density'),
 metric('m³','cm³',1000000,'1 m³ = 1 000 000 cm³','vessel',['m³','dm³','cm³'],1000,3),
];
export function units(skillId:string,level:Level,seed:string):Exercise {
 const pairs=level===1?basic:level===2?intermediate:level===3?advanced:compound;
 const pair=pairs[variation(seed,pairs.length)],rng=random(seed),reverse=rng()>.5;
 const source=reverse?pair.target:pair.source,target=reverse?pair.source:pair.target;
 const factor=reverse?1/pair.factor:pair.factor;
 const n=[2,3,5,10,20,25][integer(rng,0,5)];
 // Both displayed quantities are whole numbers; the task is units, not arithmetic drills.
 const value=reverse?n*pair.factor:n,answer=canonical(value*factor);
 const context={ladder:'La cinta para el patio',balance:'La balanza del refugio',vessel:'El recipiente del laboratorio',gauge:'El medidor de presión',density:'La ficha de un material'}[pair.instrument];
 const mode=variation(seed+':wording',3);
 const prompt=mode===0?`Convierte ${value} ${source} a ${target}.`:mode===1?`${context} indica ${value} ${source}. ¿Qué número escribirías en ${target}?`:`Dos etiquetas, una misma cantidad: ${value} ${source} = ___ ${target}. Completa la etiqueta.`;
 const errors:[number,string][]=[[value/factor,'FACTOR_INVERTIDO'],[value*factor*10,'CORRIMIENTO_DECIMAL'],[value*factor/10,'CORRIMIENTO_DECIMAL']];
 if(pair.power&&pair.power>1)errors.unshift([value*Math.pow(factor,1/pair.power),pair.power===2?'FACTOR_LINEAL_EN_AREA':'FACTOR_LINEAL_EN_VOLUMEN']);
 if(pair.instrument==='density'&&factor!==1)errors.unshift([value*(reverse?1000:.001),'SOLO_CONVIERTE_MASA']);
 const description=`${context}: ${value} ${source}. La etiqueta nueva debe expresar la misma cantidad en ${target}. ${pair.equivalence}.`;
 return {skillId,level,seed,prompt,answer,answerFormat:'number',tolerance:1e-8,conversion:{value,source,target,factor},
 visual:{kind:'conversion',instrument:pair.instrument,value,source,target,equivalence:pair.equivalence,description},
 unitScale:pair.scale?{units:pair.scale,source,target,stepFactor:pair.step??10}:undefined,
 errorSignatures:signatures(answer,errors),hints:[`${pair.equivalence}. Cambia la unidad, no la cantidad.`,factor===1?'Las dos unidades representan aquí cantidades numéricamente iguales.':`De ${source} a ${target}, ${factor>=1?'multiplica por '+canonical(factor):'divide entre '+canonical(1/factor)}.`,`${value} ${source} equivale a ${answer} ${target}${source==='mmHg'||target==='mmHg'?' con la aproximación indicada':''}.`]};
}
