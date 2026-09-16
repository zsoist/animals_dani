// Import the two teacher-supplied, reviewed PDFs. Authenticate as tutor so RLS applies.
import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
if(!url?.includes('pwcvskguqyhbhlwnsmmy.supabase.co'))throw new Error('Unexpected Supabase project');
const db=createClient(url,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
const auth=await db.auth.signInWithPassword({email:process.env.TUTOR_EMAIL,password:process.env.TUTOR_PASSWORD});
if(auth.error)throw new Error('Tutor authentication failed');
try{
 for(const bank of [
  {file:'conversion',id:'1OkX8N6jpHsBLm7wjtT3LFgYheXlnNI_s',name:'Conversión de unidades'},
  {file:'equations',id:'1ZRywRA0IX0Mdq17SEh6RhjrkMHzu4JtA',name:'Despeje de ecuaciones'}
 ]){
  const questions=JSON.parse(await readFile(new URL(`../supabase/banks/${bank.file}.json`,import.meta.url),'utf8'));
  // The source-bank tests validate content and coverage before this script runs.
  const result=await db.rpc('publish_drive_bank',{p_file:bank.id,p_folder:'1fnDq4-7P8mGTFv_QbiVPc4yGhB6W_3UG',p_modified:null,p_name:bank.name,p_subject:'fisica',p_questions:questions});
  if(result.error)throw new Error(`${bank.name}: ${result.error.message}`);
  const saved=await db.from('skills').select('name,active,skill_levels(description)').eq('id',result.data).single();
  if(saved.error)throw new Error('Readback failed');
  const count=saved.data.skill_levels.reduce((n,l)=>n+JSON.parse(l.description).questions.length,0);
  if(count!==50||!saved.data.active)throw new Error('Bank verification failed');
  console.log(JSON.stringify({name:saved.data.name,questions:count,active:true}));
 }
}finally{await db.auth.signOut({scope:"local"});}
