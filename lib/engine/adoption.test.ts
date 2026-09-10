import {describe,it,expect} from 'vitest';
import {careRecipient,qualifiesForAdoption,nextCareReward,CARE_CYCLE} from './challenge';
describe('Care and adoption rules',()=>{
 it('includes every care reward once before repeating',()=>{expect(new Set(Array.from({length:7},(_,i)=>nextCareReward(i))).size).toBe(7);expect(nextCareReward(7)).toBe(CARE_CYCLE[0]);});
 it('favors personality among equally cared-for residents and excludes adopted cats',()=>{const cats=[{id:'a',personality:'dormilón',careCount:1},{id:'b',personality:'curioso',careCount:1},{id:'c',personality:'curioso',careCount:0,adoptedAt:'2026-09-10'}];expect(careRecipient(cats,'box')?.id).toBe('b');expect(careRecipient(cats,'bed')?.id).toBe('a');});
 it('prioritizes a cat who has received less care',()=>{expect(careRecipient([{id:'a',personality:'curioso',careCount:3},{id:'b',personality:'tímido',careCount:0}],'box')?.id).toBe('b');expect(careRecipient([],'food')).toBeUndefined();});
 it('requires eight correct and three difficult unassisted responses',()=>{const answers=Array.from({length:10},(_,i)=>({correct:i<8,level:i<3?3:1,hint_level:0}));expect(qualifiesForAdoption(answers)).toBe(true);expect(qualifiesForAdoption(answers.slice(1))).toBe(false);expect(qualifiesForAdoption(answers.map((a,i)=>i===0?{...a,hint_level:1}:a))).toBe(false);expect(qualifiesForAdoption(answers.map((a,i)=>i===7?{...a,correct:false}:a))).toBe(false);});
});
