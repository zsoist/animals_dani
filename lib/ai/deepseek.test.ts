import {afterEach,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {deepseek} from './deepseek';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('recupera un formato inválido con un solo reintento',async()=>{
 vi.stubEnv('DEEPSEEK_API_KEY','test');const response=(content:string)=>({ok:true,json:async()=>({choices:[{message:{content},finish_reason:'stop'}],usage:{total_tokens:5}})});const request=vi.fn().mockResolvedValueOnce(response('not json')).mockResolvedValueOnce(response('{"reply":"Vamos paso a paso"}'));vi.stubGlobal('fetch',request);expect((await deepseek([{role:'user',content:'Ayuda'}])).json).toEqual({reply:'Vamos paso a paso'});expect(request).toHaveBeenCalledTimes(2);
});
it('no entra en un bucle de reintentos ante un proveedor inválido',async()=>{
 vi.stubEnv('DEEPSEEK_API_KEY','test');const request=vi.fn().mockResolvedValue({ok:true,json:async()=>({choices:[{message:{content:'invalid'},finish_reason:'stop'}]})});vi.stubGlobal('fetch',request);await expect(deepseek([{role:'user',content:'Ayuda'}])).rejects.toThrow('respuesta completa');expect(request).toHaveBeenCalledTimes(2);
});
