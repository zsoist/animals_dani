import {afterEach,describe,expect,it} from 'vitest';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const doctor=fileURLToPath(new URL('./setup-doctor.mjs',import.meta.url));
const roots=[];
afterEach(async()=>{await Promise.all(roots.splice(0).map(root=>rm(root,{recursive:true,force:true})))});

async function fixture({complete}){
 const root=await mkdtemp(join(tmpdir(),'refugio-doctor-'));roots.push(root);
 await mkdir(join(root,'.vercel'),{recursive:true});
 await mkdir(join(root,'supabase','.temp'),{recursive:true});
 const secret='DO_NOT_PRINT_ME';
 const env=complete?[
  'SUPABASE_PROJECT_REF=project-a',
  `SUPABASE_DB_PASSWORD=${secret}`,
  'NEXT_PUBLIC_SUPABASE_URL=https://project-a.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY=publishable-key',
  `SUPABASE_SERVICE_ROLE_KEY=${secret}`,
  'LAURA_EMAIL=student@example.test',
  'LAURA_PASSWORD=student-password',
 ].join('\n'):'';
 await writeFile(join(root,'.env.local'),`${env}\n`);
 if(complete){
  await writeFile(join(root,'.vercel','project.json'),'{}\n');
  await writeFile(join(root,'supabase','.temp','project-ref'),'project-a\n');
  await writeFile(join(root,'.env.credentials.json'),JSON.stringify({
   projectRef:'project-a',
   credentials:[
    {role:'student',email:'student@example.test',password:'student-password'},
    {role:'tutor',email:'tutor@example.test',password:'tutor-password'},
   ],
  }));
 }
 return {root,secret};
}

describe('setup doctor CLI',()=>{
 it('reports a ready checkout without printing secret values',async()=>{
  const {root,secret}=await fixture({complete:true});
  const result=spawnSync(process.execPath,[doctor,'--root',root],{encoding:'utf8'});
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('LISTO PARA DESARROLLAR');
  expect(`${result.stdout}${result.stderr}`).not.toContain(secret);
 });

 it('fails with actionable missing setup steps',async()=>{
  const {root}=await fixture({complete:false});
  const result=spawnSync(process.execPath,[doctor,'--root',root],{encoding:'utf8'});
  expect(result.status).toBe(1);
  expect(result.stdout).toContain('Falta enlazar el proyecto Vercel.');
 expect(result.stdout).toContain('SUPABASE_PROJECT_REF');
 });

 it('reports development ready when migration-only secrets are absent',async()=>{
  const {root}=await fixture({complete:true});
  await writeFile(join(root,'.env.local'),[
   'NEXT_PUBLIC_SUPABASE_URL=https://project-a.supabase.co',
   'NEXT_PUBLIC_SUPABASE_ANON_KEY=publishable-key',
   'SUPABASE_SERVICE_ROLE_KEY=secret-key',
   'LAURA_EMAIL=student@example.test',
   'LAURA_PASSWORD=student-password',
  ].join('\n'));
  const result=spawnSync(process.execPath,[doctor,'--root',root],{encoding:'utf8'});
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('LISTO PARA DESARROLLAR');
 expect(result.stdout).toContain('Reinstalación pendiente');
 });

 it('does not treat a partial credential file as provisioned',async()=>{
  const {root}=await fixture({complete:true});
  await writeFile(join(root,'.env.credentials.json'),'[{"role":"student"}]');
  const result=spawnSync(process.execPath,[doctor,'--root',root],{encoding:'utf8'});
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('Credenciales del refugio pendientes');
  expect(result.stdout).toContain('LISTO PARA EJECUTAR: pnpm setup:remote');
 });
});
