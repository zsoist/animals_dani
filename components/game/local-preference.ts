"use client";
import { useCallback, useSyncExternalStore } from "react";
const eventName='refugio:local-change';
function subscribe(callback:()=>void){window.addEventListener('storage',callback);window.addEventListener(eventName,callback);return()=>{window.removeEventListener('storage',callback);window.removeEventListener(eventName,callback);};}
export function useLocalValue(key:string) {
 const read=useCallback(()=>{try{return localStorage.getItem(key);}catch{return null;}},[key]);
 return useSyncExternalStore(subscribe,read,()=>null);
}
export function saveLocalValue(key:string,value:string){try{localStorage.setItem(key,value);window.dispatchEvent(new Event(eventName));return true;}catch{return false;}}
