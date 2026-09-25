import {access,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {hasCompleteCredentials,inspectSetup,parseEnvText} from './setup-state.mjs';

const rootFlag=process.argv.indexOf('--root');
const root=resolve(rootFlag>=0&&process.argv[rootFlag+1]?process.argv[rootFlag+1]:process.cwd());
async function exists(path){try{await access(path);return true}catch{return false}}
async function text(path){try{return await readFile(path,'utf8')}catch{return ''}}

const env=parseEnvText(await text(resolve(root,'.env.local')));
const hasVercelLink=await exists(resolve(root,'.vercel','project.json'));
const linkedSupabaseRef=(await text(resolve(root,'supabase','.temp','project-ref'))).trim()||null;
const hasCredentials=hasCompleteCredentials(await text(resolve(root,'.env.credentials.json')),env.SUPABASE_PROJECT_REF);
const result=inspectSetup({env,hasVercelLink,linkedSupabaseRef,hasCredentials});

console.log('REFUGIO · DIAGNÓSTICO DE INSTALACIÓN');
console.log(`${result.missingDevelopment.length?'✗':'✓'} Desarrollo local${result.missingDevelopment.length?`: faltan ${result.missingDevelopment.join(', ')}`:' listo'}`);
console.log(`${result.missingRequired.length?'○':'✓'} Reinstalación/migraciones${result.missingRequired.length?`: faltan ${result.missingRequired.join(', ')}`:' listas'}`);
console.log(`${hasVercelLink?'✓':'✗'} Proyecto Vercel ${hasVercelLink?'enlazado':'sin enlazar'}`);
console.log(`${linkedSupabaseRef?'✓':'○'} Proyecto Supabase ${linkedSupabaseRef?'enlazado':'se enlazará durante el setup'}`);
console.log(`${hasCredentials?'✓':'○'} Credenciales del refugio ${hasCredentials?'creadas':'pendientes'}`);
for(const issue of result.issues)console.log(`- ${issue}`);
if(result.canProvision&&(!result.canDevelop||result.needsProvisioning)){
 console.log('\nLISTO PARA EJECUTAR: pnpm setup:remote');
 process.exitCode=0;
}
else if(result.canDevelop){
 console.log('\nLISTO PARA DESARROLLAR');
 if(!result.canProvision)console.log('Reinstalación pendiente: añade las credenciales de migración solo cuando vayas a crear o migrar Supabase.');
 process.exitCode=0;
}
else{console.log('\nSIGUIENTE PASO: completa lo indicado y vuelve a ejecutar pnpm setup:doctor');process.exitCode=1}
