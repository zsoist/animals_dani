import {beforeEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({rpc:vi.fn(),signIn:vi.fn(),refresh:vi.fn(),from:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('next/cache',()=>({revalidatePath:vi.fn()}));
vi.mock('./server',()=>({database:vi.fn()}));
vi.mock('./config',()=>({publicConfig:()=>({url:'https://example.supabase.co',key:'test'})}));
vi.mock('./tutor-auth',()=>({tutorDatabase:async()=>({rpc:m.rpc,from:m.from})}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({auth:{signInWithPassword:m.signIn,refreshSession:m.refresh},from:m.from,rpc:m.rpc})}));
import {saveSkill} from './tutor-actions';
import {studentClient} from './student';
beforeEach(()=>{vi.stubEnv('LAURA_EMAIL','test@example.com');vi.stubEnv('LAURA_PASSWORD','test');m.signIn.mockResolvedValue({data:{user:{id:'student'},session:{expires_at:Math.floor(Date.now()/1000)+3600}},error:null});});
it('reutiliza la sesión compartida en peticiones concurrentes',async()=>{
 await Promise.all([studentClient(),studentClient(),studentClient()]);expect(m.signIn).toHaveBeenCalledTimes(1);
});
it('el profe guarda una expresión y sus niveles en una transacción',async()=>{
 m.rpc.mockResolvedValue({data:'38ccde09-78e3-47d3-a111-7ce88809bc7d',error:null});
 const f=new FormData();for(const [k,v] of Object.entries({name:'Fórmulas',description:'Despejar m',subject:'fisica',mode:'custom',priority:'5',difficulty:'2',prompt:'F=m*a. Despeja m.',answer:'F/a',format:'expression',level:'2',hint1:'Deshaz el producto',hint2:'Divide entre a',hint3:'m=F/a'}))f.set(k,v);
 const result=await saveSkill({error:'',success:''},f);expect(result.error).toBe('');expect(result.id).toBeTruthy();expect(m.rpc).toHaveBeenCalledWith('save_skill_atomic',expect.objectContaining({p_levels:expect.any(Array)}));expect(m.from).not.toHaveBeenCalled();
});
