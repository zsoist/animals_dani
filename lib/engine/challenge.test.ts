import {describe,it,expect} from 'vitest';
import {freeQueue,nextCareReward,practiceLevels} from './challenge';
import type {Skill} from './types';
import {chooseActivity,moveCat,places,type CatMotion} from '@/components/scene/cat-behavior';
import {random} from './random';
const skill:Skill={id:'equations',name:'Despejes',subject:'matematicas',description:'Despejar',active:true,priority:1,base_difficulty:1,created_at:'2026-09-09',family:'equations'};
describe('Free practice and care',()=>{
 it('keeps the selected skill and difficulty for ten unique exercises',()=>{for(const level of practiceLevels(skill)){const q=freeQueue(skill,level,'practice');expect(q).toHaveLength(10);expect(new Set(q.map(q=>q.seed)).size).toBe(10);expect(q.every(q=>q.skillId===skill.id&&q.level===level)).toBe(true);}});
 it('does not offer or invent missing levels in uploaded banks',()=>{const custom:Skill={...skill,family:'custom',questions:[{level:2,prompt:'x+1=2',answer:'1',answerFormat:'number',hints:['Resta','Resta 1','x=1']}]};expect(practiceLevels(custom)).toEqual([2]);expect(()=>freeQueue(custom,4,'seed')).toThrow();});
 it('cycles visible rewards by successful days, not attempts',()=>{expect(Array.from({length:8},(_,i)=>nextCareReward(i))).toEqual(['bed','food','box','treat','bed','food','box','treat']);});
});
describe('Cat behavior',()=>{
 it('varies destinations and poses while staying in the walkable courtyard',()=>{const rng=random('cat-life'),poses=new Set(),targets=new Set();for(let i=0;i<200;i++){const action=chooseActivity('curioso',{x:.4,y:.7},[{x:.6,y:.8}],true,rng);poses.add(action.arrival);targets.add(JSON.stringify(action.target));expect(action.target.x).toBeGreaterThanOrEqual(.1);expect(action.target.x).toBeLessThanOrEqual(.9);expect(action.target.y).toBeGreaterThanOrEqual(.5);expect(action.target.y).toBeLessThanOrEqual(.91);}expect(poses.size).toBeGreaterThanOrEqual(5);expect(targets.size).toBeGreaterThan(20);});
 it('walks to a reward and changes to its actual interaction without overshooting',()=>{const m:CatMotion={position:{x:.8,y:.6},target:places.bed,pose:'walk',arrival:'sleep',remaining:12,direction:1};for(let i=0;i<500;i++){if(moveCat(m,.04,.08))break;}expect(m.position).toEqual(places.bed);expect(m.pose).toBe('sleep');expect(m.direction).toBe(-1);});
});
