import {afterEach,expect,it,vi} from 'vitest';
function storage(){const values=new Map<string,string>();return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key),key:(index:number)=>[...values.keys()][index]??null,get length(){return values.size;}};}
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();vi.resetModules();});
it('reintenta con el mismo id y solo retira eventos confirmados',async()=>{
 vi.stubGlobal('window',{});vi.stubGlobal('location',{pathname:'/'});vi.stubGlobal('sessionStorage',storage());vi.stubGlobal('localStorage',storage());
 const now=Date.now();const clock=vi.spyOn(Date,'now').mockReturnValue(now);const batches:{id:string}[][]=[];
 const request=vi.fn(async(_url:string,options:RequestInit)=>{const body=JSON.parse(String(options.body)) as {events:{id:string}[]};batches.push(body.events);if(batches.length===1)throw new Error('offline');return {ok:true,json:async()=>({accepted:body.events.map(e=>e.id)})};});vi.stubGlobal('fetch',request);
 const {track,flush}=await import('./client');track('hint_requested',{hint_level:1});await flush();expect(request).toHaveBeenCalledTimes(1);await flush();expect(request).toHaveBeenCalledTimes(1);
 clock.mockReturnValue(now+10000);await flush();expect(batches[1][0].id).toBe(batches[0][0].id);await flush();expect(request).toHaveBeenCalledTimes(2);
});
it('sobrevive a almacenamiento dañado sin impedir el siguiente envío',async()=>{
 const local=storage();const session=storage();const visit=crypto.randomUUID();session.setItem('refugio:visit',visit);local.setItem('refugio:events:v1:'+visit,'{broken');vi.stubGlobal('window',{});vi.stubGlobal('location',{pathname:'/tutor'});vi.stubGlobal('sessionStorage',session);vi.stubGlobal('localStorage',local);
 const request=vi.fn(async(_url:string,options:RequestInit)=>{const body=JSON.parse(String(options.body)) as {events:{id:string}[]};return {ok:true,json:async()=>({accepted:body.events.map(e=>e.id)})};});vi.stubGlobal('fetch',request);
 const {track,flush}=await import('./client');track('control_used',{control:'usage_export'});await flush();expect(request).toHaveBeenCalledTimes(1);
});
