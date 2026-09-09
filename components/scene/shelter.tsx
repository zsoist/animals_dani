'use client';
import dynamic from 'next/dynamic';
import {Component,useState,type ReactNode} from 'react';
import type {ShelterCat} from '@/lib/data/shelter';
import {FlatShelter} from './flat-shelter';
const Room=dynamic(()=>import('./room'),{ssr:false,loading:()=> <FlatShelter cats={[]}/>});
class SceneBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
export function Shelter({cats}:{cats:ShelterCat[]}){const [selected,setSelected]=useState<ShelterCat|null>(null);const [openedAt,setOpenedAt]=useState(0);const selectCat=(cat:ShelterCat)=>{setOpenedAt(Date.now());setSelected(cat)};return <><div className="scene"><SceneBoundary fallback={<FlatShelter cats={cats} onCat={selectCat}/>}><Room cats={cats} onCat={selectCat}/></SceneBoundary></div>{selected&&<button className="cat-tag" onClick={()=>setSelected(null)} aria-label="Cerrar historia del gato"><strong>{selected.name}</strong> · {selected.personality}<br/>Rescatado hace {Math.max(0,Math.floor((openedAt-Date.parse(selected.unlockedAt))/86400000))} días<br/>{selected.story}</button>}</>}
