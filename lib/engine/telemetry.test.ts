import {expect,it} from 'vitest';
import {cleanEvent,usageSummary} from './telemetry';
const event={id:'e9391514-321f-45cb-ae94-2c49fc5ea990',visit_id:'e9391514-321f-45cb-ae94-2c49fc5ea991',event_name:'hint_requested',surface:'refuge',occurred_at:new Date().toISOString(),properties:{hint_level:2,password:'secret',message:'private',duration_ms:2000}};
it('solo acepta propiedades previstas; nunca captura texto o credenciales',()=>{expect(cleanEvent(event)?.properties).toEqual({hint_level:2,duration_ms:2000});expect(cleanEvent({...event,event_name:'arbitrary'})).toBeNull();});
it('agrega visitas y uso sin inferir incapacidad o atribuir identidad',()=>{const e=cleanEvent(event)!;const summary=usageSummary([{...e,actor_kind:'shared_refuge',is_test:false},{...e,id:crypto.randomUUID(),actor_kind:'tutor',is_test:false},{...e,id:crypto.randomUUID(),is_test:true,actor_kind:'shared_refuge'}]);expect(summary.visits).toBe(1);expect(summary.counts.hint_requested).toBe(1);});
