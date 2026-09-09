"use client";
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {track,flush} from './client';
export function UsageTracking(){const path=usePathname();useEffect(()=>{
 track('page_view',{view:window.innerWidth<760?'mobile':'desktop'});let since=performance.now();let active=document.visibilityState==='visible';let lastInput=Date.now();
 const checkpoint=()=>{const now=performance.now();if(active&&Date.now()-lastInput<90000){const duration=Math.round(Math.min(30000,now-since));if(duration>0)track('active_time',{duration_ms:duration});}since=now;};
 const visibility=()=>{checkpoint();active=document.visibilityState==='visible';if(active)lastInput=Date.now();else void flush();};
 const input=()=>{lastInput=Date.now();};
 const click=(event:MouseEvent)=>{input();const el=event.target instanceof Element?event.target.closest<HTMLElement>('[data-track]'):null;if(el?.dataset.track && el.tagName!=='FORM')track('control_used',{control:el.dataset.track});};
 const submit=(event:Event)=>{const form=event.target instanceof HTMLFormElement?event.target:null;if(form?.dataset.track)track('control_used',{control:form.dataset.track});};
 const leave=()=>{checkpoint();track('page_leave');void flush();};
 const failure=()=>track('runtime_error',{reason:'browser_runtime'});
 const timer=setInterval(()=>{checkpoint();void flush();},10000);
 document.addEventListener('visibilitychange',visibility);document.addEventListener('click',click);document.addEventListener('submit',submit);document.addEventListener('keydown',input);window.addEventListener('pagehide',leave);window.addEventListener('online',flush);window.addEventListener('error',failure);window.addEventListener('unhandledrejection',failure);
 return()=>{checkpoint();track('page_leave');void flush();clearInterval(timer);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('click',click);document.removeEventListener('submit',submit);document.removeEventListener('keydown',input);window.removeEventListener('pagehide',leave);window.removeEventListener('online',flush);window.removeEventListener('error',failure);window.removeEventListener('unhandledrejection',failure);};
},[path]);return null;}
