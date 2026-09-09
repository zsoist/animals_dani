import {spawnSync} from 'node:child_process';
import {readFile,appendFile} from 'node:fs/promises';
function run(command,args,input){const result=spawnSync(command,args,{stdio:input?['pipe','inherit','inherit']:'inherit',input,env:process.env});if(result.status!==0)throw new Error(`${command} no completó la configuración.`)}
if(!process.env.SUPABASE_PROJECT_REF||!process.env.SUPABASE_DB_PASSWORD)throw new Error('Define SUPABASE_PROJECT_REF y SUPABASE_DB_PASSWORD.');
run('pnpm',['exec','supabase','link','--project-ref',process.env.SUPABASE_PROJECT_REF]);
run('pnpm',['exec','supabase','db','push','--include-seed','--yes']);
run('node',['--env-file=.env.local','lib/data/provision.mjs']);
const credentials=JSON.parse(await readFile('.env.credentials.json','utf8'));
const laura=credentials.find(c=>c.role==='student');
await appendFile('.env.local',`\nLAURA_EMAIL=${laura.email}\nLAURA_PASSWORD=${laura.password}\n`);
process.loadEnvFile('.env.local');
for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','LAURA_EMAIL','LAURA_PASSWORD']){
 const value=process.env[name];if(!value)throw new Error(`Falta ${name}`);
 run('vercel',['env','add',name,'production','--force'],value);
}
