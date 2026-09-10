import {describe,it,expect} from 'vitest';
import {routeTo,clearSegment,canStand,footprintAt,overlaps} from './cat-navigation';
describe('courtyard navigation',()=>{
 it('walks around furniture instead of through it on mobile and desktop',()=>{
  for(const size of [{width:.15,height:.13},{width:.08,height:.12}]){
   const obstacles=[{x:.44,y:.65,width:.12,height:.15}],start={x:.2,y:.85};
   const route=routeTo(start,{x:.8,y:.85},size,obstacles);expect(route.length).toBeGreaterThan(1);
   let previous=start;for(const point of route){expect(clearSegment(previous,point,size,obstacles)).toBe(true);previous=point;}
   expect(route.at(-1)!.x).toBeGreaterThan(.7);
  }
 });
 it('stops beside an occupied toy and never inside another cat',()=>{
  const size={width:.14,height:.12},cat=footprintAt({x:.65,y:.85},size),toy={x:.75,y:.8,width:.08,height:.07};
  const route=routeTo({x:.2,y:.85},{x:.79,y:.85},size,[cat,toy]);expect(route.length).toBeGreaterThan(0);
  for(const p of route){expect(canStand(p,size,[cat,toy])).toBe(true);expect(overlaps(footprintAt(p,size),cat)).toBe(false);}
 });
 it('does not teleport through an enclosing obstacle',()=>{expect(routeTo({x:.5,y:.7},{x:.8,y:.9},{width:.1,height:.1},[{x:0,y:0,width:1,height:1}])).toEqual([]);});
});
