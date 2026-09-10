'use client';
import {useEffect,useRef} from 'react';
import type {ShelterCat} from '@/lib/data/shelter';
import {CatArt} from '@/components/scene/cat-art';
import {Icon} from './icons';
export function AdoptionMoment({cat,onClose}:{cat:ShelterCat|null;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(cat)dialog.current?.showModal();else dialog.current?.close();},[cat]);
 return <dialog ref={dialog} className="adoption-moment" aria-labelledby="adoption-title" onCancel={onClose}>
 {cat&&<><div className="adoption-portrait"><CatArt body={cat.palette.body} belly={cat.palette.belly}/><span><Icon name="home" size={28}/></span></div>
 <h2 id="adoption-title">{cat.name} encontró un hogar</h2><p>Tus cuidados y el reto difícil de hoy le abrieron una nueva puerta. Su historia sigue contigo en Mis gatos.</p><button className="primary" onClick={onClose}>Hasta pronto, {cat.name}<Icon name="heart" size={20}/></button></>}
 </dialog>;
}
