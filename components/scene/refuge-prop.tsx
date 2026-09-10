import type {CSSProperties} from 'react';
export type RefugePropKind='ball'|'scratcher'|'basket'|'bed'|'box'|'food';
const cells:Record<RefugePropKind,number>={ball:0,scratcher:1,basket:2,bed:3,box:4,food:5};
export function PropTransparency(){return <svg width="0" height="0" aria-hidden="true" className="prop-filter-defs"><defs><filter id="refuge-prop-cutout" colorInterpolationFilters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  12 0 -12 0 -0.15" result="warm"/><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -12 0 12 0 -0.15" result="cool"/><feComposite in="warm" in2="cool" operator="over"/></filter></defs></svg>;}
export function RefugeProp({kind,className='',label}:{kind:RefugePropKind;className?:string;label?:string}) {
 const cell=cells[kind];
 return <span role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} className={`refuge-prop prop-${kind} ${className}`} style={{backgroundPosition:`${(cell%3)*50}% ${Math.floor(cell/3)*100}%`} as CSSProperties}/>;
}
