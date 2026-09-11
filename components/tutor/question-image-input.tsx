'use client';
import {useState} from 'react';
import {encodeImage} from './encode-image';
export function QuestionImageInput({onImage,onBusy}:{onBusy:(busy:boolean)=>void;onImage:(image:string,imageAlt:string)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 return <div className="question-image-input"><label>Imagen de apoyo (opcional)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setError('');setBusy(true);onBusy(true);try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15*1024*1024)throw new Error('Elige una imagen PNG, JPG o WebP de hasta 15 MB.');const bitmap=await createImageBitmap(file);try{const image=await encodeImage(bitmap,bitmap.width,bitmap.height);onImage(image,file.name);}finally{bitmap.close();}}catch(cause){setError(cause instanceof Error?cause.message:'No pudimos abrir la imagen. Prueba con un JPG o PNG.');}finally{setBusy(false);onBusy(false);}}}/></label>{busy&&<p role="status">Preparando imagen…</p>}{error&&<p role="alert" className="error">{error}</p>}</div>;
}
