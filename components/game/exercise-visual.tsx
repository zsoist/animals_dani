'use client';
import {useState} from 'react';
import type {Exercise,ExerciseVisual} from '@/lib/engine/types';
import {UnitScale} from './unit-scale';
function Shape({v}:{v:Extract<ExerciseVisual,{kind:'geometry'}>}) {
 const scale=Math.min(220/v.width,125/v.height),w=v.width*scale,h=v.height*scale,c=(v.cut??0)*scale,x=(320-w)/2,y=30;
 const points=v.shape==='triangle'?`${x},${y+h} ${x+w},${y+h} ${x},${y}`:v.shape==='cutout'?`${x},${y} ${x+w-c},${y} ${x+w-c},${y+c} ${x+w},${y+c} ${x+w},${y+h} ${x},${y+h}`:`${x},${y} ${x+w},${y} ${x+w},${y+h} ${x},${y+h}`;
 return <svg viewBox="0 0 320 210" role="img" aria-label={v.description} className={`geometry-drawing highlight-${v.highlight}`}><polygon points={points} fill="#c4dcf5" stroke="#2145a2" strokeWidth="3" strokeLinejoin="round"/>
 {v.shape==='mosaic'&&<g stroke="#fff" strokeWidth="3"><path d={`M${x} ${y} L${x+w} ${y+h} M${x+w} ${y} L${x} ${y+h}`}/><path d={`M${x} ${y} L${x+w} ${y} L${x+w/2} ${y+h/2} Z`} fill="#f2bb56"/><path d={`M${x+w} ${y} L${x+w} ${y+h} L${x+w/2} ${y+h/2} Z`} fill="#df9473"/></g>}
 <text x={160} y={y+h+25} textAnchor="middle">{v.width} {v.unit}</text><text x={x-12} y={y+h/2} textAnchor="end">{v.height}</text><text x={x-12} y={y+h/2+18} textAnchor="end">{v.unit}</text>
 {v.shape==='cutout'&&<><path d={`M${x+w-c} ${y} H${x+w} V${y+c}`} fill="none" stroke="#8998a0" strokeDasharray="4 4"/><text x={x+w-c/2} y={y-10} textAnchor="middle">{v.cut} {v.unit}</text><text x={x+w+8} y={y+c/2+5}>{v.cut}</text></>}
 {v.shape==='triangle'&&<><path d={`M${x} ${y+h-12} h12 v12`} fill="none" stroke="#2145a2"/>{v.highlight==='border'&&<text x={x+w/2+20} y={y+h/2-8}>10 cm</text>}</>}
 <text className="diagram-caption" x="160" y="200" textAnchor="middle">{v.highlight==='border'?'Recorre el contorno':'Observa la superficie'}</text></svg>;
}
function Instrument({kind}:{kind:string}) {
 return <svg viewBox="0 0 120 100" aria-hidden="true" className="instrument-drawing">
 {kind==='vessel'||kind==='bottle'?<><path d="M30 12 H90 L82 86 Q60 94 38 86Z" fill="#dcedf8" stroke="#285288" strokeWidth="3"/><path d="M36 45 Q60 51 84 45 L80 83 Q60 89 40 83Z" fill="#66b9db"/>{[28,42,56,70].map(y=><path key={y} d={`M72 ${y} h12`} stroke="#285288" strokeWidth="2"/>)}</>:kind==='gauge'||kind==='pump'?<><circle cx="60" cy="45" r="34" fill="#fff" stroke="#285288" strokeWidth="4"/><path d="M34 50 A27 27 0 0 1 86 50" fill="none" stroke="#e3ac4a" strokeWidth="5"/><path d="M60 48 L76 27 M60 81 V95" stroke="#285288" strokeWidth="4"/><circle cx="60" cy="48" r="5" fill="#285288"/></>:kind==='balance'||kind==='scale'?<><path d="M28 38 H92 L100 84 H20Z" fill="#cedfe7" stroke="#285288" strokeWidth="3"/><rect x="41" y="58" width="38" height="16" rx="4" fill="#fff"/><path d="M37 38 L43 18 H77 L83 38Z" fill="#daa36c" stroke="#915f39" strokeWidth="2"/></>:kind==='density'||kind==='material'?<><path d="M25 30 L58 12 L96 30 L62 50Z" fill="#efd59c"/><path d="M25 30 V72 L62 92 V50Z" fill="#d59b6d"/><path d="M62 50 L96 30 V72 L62 92Z" fill="#779bb1"/></>:kind==='fence'||kind==='blanket'?<><rect x="20" y="22" width="80" height="58" rx="3" fill={kind==='blanket'?'#e9b05b':'#dce8c8'} stroke="#285288" strokeWidth="3"/>{kind==='fence'?[20,40,60,80,100].map(x=><path key={x} d={`M${x} 15 V87`} stroke="#a97747" strokeWidth="5"/>):<path d="M20 40 H100 M20 60 H100 M45 22 V80 M70 22 V80" stroke="#fff" strokeWidth="3"/>}</>:<><path d="M15 82 H40 V62 H65 V42 H90 V22 H110" fill="none" stroke="#285288" strokeWidth="7"/><path d="M20 15 L80 70 M80 55 V70 H65" fill="none" stroke="#d99836" strokeWidth="4"/></>}
 </svg>;
}
export function ExerciseDiagram({exercise}:{exercise:Exercise}) {
 const [view,setView]=useState<'drawing'|'words'|'scale'>('drawing');
 const v=exercise.visual;if(!v)return exercise.unitScale?<UnitScale scale={exercise.unitScale}/>:null;
 return <div className="learning-visual"><div className="representation-switch" role="group" aria-label="Representación del problema"><button type="button" aria-pressed={view==='drawing'} onClick={()=>setView('drawing')}>Figura</button>{exercise.unitScale&&<button type="button" aria-pressed={view==='scale'} onClick={()=>setView('scale')}>Escalera</button>}<button type="button" aria-pressed={view==='words'} onClick={()=>setView('words')}>En palabras</button></div>
 {view==='words'?<p className="visual-description">{v.description}</p>:view==='scale'&&exercise.unitScale?<div className="staircase-view"><UnitScale scale={exercise.unitScale}/></div>:v.kind==='geometry'?<Shape v={v}/>:v.kind==='conversion'?<div className="conversion-picture"><Instrument kind={v.instrument}/><div className="equivalent-labels"><span><strong>{v.value.toLocaleString('es-CO')}</strong>{v.source}</span><b aria-label="equivale a">↔</b><span><strong>?</strong>{v.target}</span></div><p>{v.equivalence}</p></div>:<div className="situation-picture"><Instrument kind={v.scene}/><span>Observa qué necesitamos medir</span></div>}
 </div>;
}
