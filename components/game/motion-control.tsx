"use client";
import { useEffect } from "react";
import { useLocalValue, saveLocalValue } from "./local-preference";
import { Icon } from "./icons";
export function MotionControl() {
 const value=useLocalValue('refugio:motion');
 const reduced=value==='reduced';
 useEffect(()=>{document.documentElement.dataset.motion=reduced?'reduced':'full';},[reduced]);
 return <button className="motion-control" aria-pressed={reduced} onClick={()=>saveLocalValue('refugio:motion',reduced?'full':'reduced')}><Icon name="star" size={16}/>{reduced?'Animaciones reducidas':'Reducir animaciones'}</button>;
}
