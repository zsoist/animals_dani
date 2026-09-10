import type {Exercise} from '@/lib/engine/types';
export function UnitScale({scale}:{scale:NonNullable<Exercise['unitScale']>}) {
 const from=scale.units.indexOf(scale.source),to=scale.units.indexOf(scale.target);
 return <figure className="unit-scale" aria-label={`Escala de ${scale.source} a ${scale.target}. Hacia la derecha multiplicamos por ${scale.stepFactor} por cada paso; hacia la izquierda dividimos.`}>
 <div className="scale-direction"><span>÷ {scale.stepFactor} por paso</span><span>× {scale.stepFactor} por paso</span></div>
 <ol>{scale.units.map((unit,i)=><li key={unit} className={`${i===from?'scale-source':''} ${i===to?'scale-target':''} ${i>=Math.min(from,to)&&i<=Math.max(from,to)?'scale-route':''}`}><span>{unit}</span>{i===from?<small>Desde</small>:i===to?<small>Hasta</small>:<small aria-hidden="true">·</small>}</li>)}</ol>
 <figcaption>Conserva la cantidad, cambia la unidad.</figcaption></figure>;
}
