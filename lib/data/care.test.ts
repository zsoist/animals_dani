import {beforeEach,describe,expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({from:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('./server',()=>({database:vi.fn()}));
vi.mock('./config',()=>({publicConfig:()=>({url:'https://example.supabase.co',key:'test-key'})}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{signInWithPassword:async()=>({data:{user:{id:'student'}},error:null})},from:mocks.from})}));
import {careForShelter} from './student';
import {dayKey} from '../engine/mastery';
describe('El comedor requiere completar la misión diaria en el servidor',()=>{
 beforeEach(()=>{vi.stubEnv('LAURA_EMAIL','test@example.com');vi.stubEnv('LAURA_PASSWORD','test-password');mocks.from.mockReset();});
 it('bloquea la comida aunque se llame directamente a la acción',async()=>{
 const query={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:[],error:null})};mocks.from.mockReturnValue(query);
 await expect(careForShelter('feed')).rejects.toThrow('Completa los diez retos');
 expect(query.eq).toHaveBeenCalledWith('user_id','student');expect(query.eq).toHaveBeenCalledWith('date',dayKey());expect(query.eq).toHaveBeenCalledWith('completed',true);
 expect(mocks.from).not.toHaveBeenCalledWith('shelter_state');
 });
 it('permite comer tras completar hoy sin otorgar recompensas por pulsar',async()=>{
 const state={food:15,blankets:2,lamps:1,clean_zones:4,affection:8};
 const completed={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),limit:vi.fn().mockResolvedValue({data:[{id:'done'}],error:null})};
 const shelter={select:vi.fn().mockReturnThis(),eq:vi.fn().mockReturnThis(),single:vi.fn().mockResolvedValue({data:state,error:null})};
 mocks.from.mockImplementation((table:string)=>table==='sessions'?completed:shelter);
 await expect(careForShelter('feed')).resolves.toEqual(state);
 });
});
