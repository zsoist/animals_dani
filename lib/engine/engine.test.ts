import {describe,it,expect} from 'vitest';
import {generate,evaluate} from './exercises';
const families=['equations','units','chemistry'] as const;
describe('generadores deterministas',()=>{for(const family of families)for(const level of [1,2,3,4] as const)it(`${family} nivel ${level}`,()=>{const seen=new Set<string>();for(let i=0;i<100;i++){const e=generate(family,'skill',level,`${family}-${level}-${i}`);expect(evaluate(e,e.answer)).toEqual({valid:true,correct:true,errorType:null});expect(e.errorSignatures.length).toBeGreaterThan(0);for(const s of e.errorSignatures){expect(s.value).not.toBe(e.answer);seen.add(s.value)} }expect(seen.size).toBeGreaterThan(1)})});
