import {createClient} from '@supabase/supabase-js';
import {randomBytes} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configura URL y clave de servicio en .env.local.');
const db=createClient(url,key,{auth:{persistSession:false}});
const credentials=[];
for(const role of ['student','tutor']){
 const email=role==='student'?'estudiante@refugio.test':'tutor@refugio.test';
 const password=randomBytes(18).toString('base64url');
 const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{role}});
 if(error)throw error;
 const id=data.user.id;
 const {error:profileError}=await db.from('profiles').insert({id,display_name:role==='student'?'Laura':'Tutor',role});
 if(profileError)throw profileError;
 if(role==='student'){
  const results=await Promise.all([db.from('cat_unlocks').insert({user_id:id,cat_id:'20000000-0000-0000-0000-000000000001'}),db.from('streaks').insert({user_id:id}),db.from('shelter_state').insert({user_id:id})]);
  for(const result of results)if(result.error)throw result.error;
 }
 credentials.push({role,email,password});
}
await writeFile('.env.credentials.json',JSON.stringify(credentials,null,2),{mode:0o600});
console.log('Dos usuarios creados. Credenciales guardadas localmente en .env.credentials.json (excluido de Git).');
