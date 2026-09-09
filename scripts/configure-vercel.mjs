import {readFile,appendFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const credentials=JSON.parse(await readFile('.env.credentials.json','utf8'));
const laura=credentials.find(c=>c.role==='student');
await appendFile('.env.local',`\nLAURA_EMAIL=${laura.email}\nLAURA_PASSWORD=${laura.password}\n`);
process.env.LAURA_EMAIL=laura.email;process.env.LAURA_PASSWORD=laura.password;
for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','LAURA_EMAIL','LAURA_PASSWORD','TUTOR_EMAIL','TUTOR_PASSWORD']){
 const value=process.env[name];if(!value)throw new Error(`Falta ${name}`);
 const body=JSON.stringify({key:name,value,type:name.startsWith('NEXT_PUBLIC_')?'plain':'sensitive',target:['production']});
 const result=spawnSync('vercel',['api','/v10/projects/prj_aZksgfpQf9hsU8jOCqY11EP6m3Yb/env?upsert=true','--method','POST','--input','-','--silent'],{input:body,encoding:'utf8'});
 if(result.status!==0)throw new Error(`No se pudo configurar ${name}: ${result.stderr}`);
 console.log(`${name}: configurada`);
}
