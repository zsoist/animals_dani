'use client';
import {useEffect,useRef} from 'react';
import type {ShelterCat} from '@/lib/data/shelter';
import type {CareReward} from '@/lib/engine/challenge';
import {chooseActivity,moveCat,places,type CatMotion} from './cat-behavior';
export function useCatLife(cats:ShelterCat[],hasBed:boolean,selected:string|undefined,paused:boolean,celebration:{reward:CareReward;id:string}|null) {
 const room=useRef<HTMLDivElement>(null);
 const state=useRef({selected,paused,celebration,hasBed});
 useEffect(()=>{state.current={selected,paused,celebration,hasBed};},[selected,paused,celebration,hasBed]);
 useEffect(()=>{
  const root=room.current;if(!root)return;
  const nodes=Array.from(root.querySelectorAll<HTMLButtonElement>('[data-cat-id]'));
  const motion:CatMotion[]=cats.map((_,i)=>({position:{x:.38+(i%3)*.18,y:.71+Math.floor(i/3)*.13},target:i%2===0?places.ball:{x:.27,y:.84},pose:'walk',arrival:i%2===0?'play':'stretch',remaining:5,direction:1}));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let width=root.clientWidth,height=root.clientHeight,visible=true,frame=0,last=0,lastGift='',lastSelected:string|undefined;
  const size=new ResizeObserver(()=>{width=root.clientWidth;height=root.clientHeight;});size.observe(root);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});observer.observe(root);
  function tick(now:number){
   const delta=last?Math.min((now-last)/1000,.05):0;last=now;
   const active=visible&&!document.hidden&&!state.current.paused;
   root!.dataset.motion=active&&!reduced.matches?'on':'off';
   if(active) {
    if(state.current.celebration && lastGift!==state.current.celebration.id && motion[0]){
     lastGift=state.current.celebration.id;
     const reward=state.current.celebration.reward;
     motion[0].target={...places[reward]};motion[0].pose='walk';motion[0].arrival=reward==='bed'?'sleep':reward==='box'?'play':'eat';motion[0].remaining=12;
    }
    if(state.current.selected!==lastSelected){lastSelected=state.current.selected;const i=cats.findIndex(c=>c.id===lastSelected);if(i>=0){motion[i].pose='happy';motion[i].remaining=4;}}
    motion.forEach((m,i)=>{
     const node=nodes[i];if(!node)return;
     if(!reduced.matches){
      if(m.pose==='walk') {
       const arrived=moveCat(m,delta,cats[i].personality==='juguetón'?.10:.065);
       if(arrived && m.arrival==='social') {
        const neighbor=motion.find((other,j)=>j!==i&&Math.hypot(other.position.x-m.position.x,other.position.y-m.position.y)<.16);
        if(neighbor){neighbor.pose='social';neighbor.remaining=5;m.remaining=5;neighbor.direction=neighbor.position.x<m.position.x?1:-1;}
       }
      }
      else if(state.current.selected!==cats[i].id){m.remaining-=delta;if(m.remaining<=0){
        const action=chooseActivity(cats[i].personality,m.position,motion.filter((_,j)=>j!==i).map(p=>p.position),state.current.hasBed,Math.random);
        const occupied=motion.some((other,j)=>j!==i&&Math.hypot(other.position.x-action.target.x,other.position.y-action.target.y)<.12);
        if(occupied && action.pose==='walk' && action.arrival!=='social')action.target={x:Math.max(.12,Math.min(.86,action.target.x+(action.target.x>.5?-.13:.13))),y:action.target.y};
        Object.assign(m,action);
       }}
     } else if(state.current.celebration && i===0) {m.position={...m.target};m.pose=m.arrival;}
     node.style.transform=`translate3d(${width*m.position.x-node.offsetWidth/2}px,${height*m.position.y-node.offsetHeight}px,0)`;
     node.style.zIndex=String(Math.round(m.position.y*100));
     node.dataset.pose=m.pose;
     node.style.setProperty('--facing',String(m.direction));
    });
    const player=motion.find(m=>m.pose==='play'&&Math.hypot(m.position.x-places.ball.x,m.position.y-places.ball.y)<.13);
    root!.dataset.ball=player?'playing':'still';
   }
   frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);size.disconnect();observer.disconnect();};
 },[cats]);
 return room;
}
