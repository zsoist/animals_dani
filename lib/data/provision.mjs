import {createClient} from '@supabase/supabase-js';
import {randomBytes} from 'node:crypto';
import {chmod,readFile,writeFile} from 'node:fs/promises';
import {parseCredentials} from '../../scripts/setup-state.mjs';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error('Configura URL y clave de servicio en .env.local.');
const db=createClient(url,key,{auth:{persistSession:false}});
const projectRef=process.env.SUPABASE_PROJECT_REF||new URL(url).hostname.split('.')[0];
async function optionalText(path){try{return await readFile(path,'utf8')}catch{return ''}}
async function saveCredentials(credentials){
 await writeFile('.env.credentials.json',JSON.stringify({projectRef,credentials},null,2),{mode:0o600});
 await chmod('.env.credentials.json',0o600);
}

const stored=parseCredentials(await optionalText('.env.credentials.json'),projectRef);
const {data:list,error:listError}=await db.auth.admin.listUsers({page:1,perPage:1000});
if(listError)throw listError;
const users=[...(list.users??[])];
const credentials=[];
for(const role of ['student','tutor']){
 const email=role==='student'?'estudiante@refugio.test':'tutor@refugio.test';
 const saved=stored.find(item=>item?.role===role&&item?.email===email&&item?.password);
 const password=saved?.password??randomBytes(18).toString('base64url');
 let user=users.find(item=>item.email?.toLowerCase()===email);
 if(user){
  const attributes={app_metadata:{...user.app_metadata,role}};
  if(!saved)attributes.password=password;
  const {data,error}=await db.auth.admin.updateUserById(user.id,attributes);
  if(error)throw error;
  user=data.user;
 }else{
  const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{role}});
  if(error)throw error;
  user=data.user;
  users.push(user);
 }
 credentials.push({role,email,password});
 await saveCredentials(credentials);
 const id=user.id;
 const {error:profileError}=await db.from('profiles').upsert({id,display_name:role==='student'?'Laura':'Tutor',role},{onConflict:'id'});
 if(profileError)throw profileError;
 if(role==='student'){
  const results=await Promise.all([
   db.from('cat_unlocks').upsert({user_id:id,cat_id:'20000000-0000-0000-0000-000000000001'},{onConflict:'user_id,cat_id',ignoreDuplicates:true}),
   db.from('streaks').upsert({user_id:id},{onConflict:'user_id',ignoreDuplicates:true}),
   db.from('shelter_state').upsert({user_id:id},{onConflict:'user_id',ignoreDuplicates:true}),
  ]);
  for(const result of results)if(result.error)throw result.error;
 }
}
await saveCredentials(credentials);
console.log('Dos usuarios preparados. Credenciales guardadas localmente en .env.credentials.json (excluido de Git).');
