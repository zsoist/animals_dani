const provisioningRequired=[
 'SUPABASE_PROJECT_REF',
 'SUPABASE_DB_PASSWORD',
 'NEXT_PUBLIC_SUPABASE_URL',
 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
 'SUPABASE_SERVICE_ROLE_KEY',
];
const developmentRequired=[
 'NEXT_PUBLIC_SUPABASE_URL',
 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
 'SUPABASE_SERVICE_ROLE_KEY',
 'LAURA_EMAIL',
 'LAURA_PASSWORD',
];

export function parseEnvText(text){
 const env={};
 for(const line of text.split(/\r?\n/)){
  const match=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if(!match)continue;
  let value=match[2];
  if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
  env[match[1]]=value;
 }
 return env;
}

function credentialFile(text){
 try{
  const parsed=JSON.parse(text);
  if(Array.isArray(parsed))return {projectRef:null,credentials:parsed};
  if(parsed&&Array.isArray(parsed.credentials))return {projectRef:parsed.projectRef??null,credentials:parsed.credentials};
  return {projectRef:null,credentials:[]};
 }catch{return {projectRef:null,credentials:[]}}
}

export function parseCredentials(text,projectRef){
 const file=credentialFile(text);
 if(projectRef&&file.projectRef!==projectRef)return [];
 return file.credentials;
}

export function hasCompleteCredentials(text,projectRef){
 const file=credentialFile(text);
 if(projectRef&&file.projectRef!==projectRef)return false;
 return ['student','tutor'].every(role=>{
   const item=file.credentials.find(candidate=>candidate?.role===role);
   return Boolean(item?.email&&item?.password);
  });
}

export function inspectSetup({env,hasVercelLink,linkedSupabaseRef,hasCredentials}){
 const missingRequired=provisioningRequired.filter(name=>!String(env[name]??'').trim());
 const missingDevelopment=developmentRequired.filter(name=>!String(env[name]??'').trim());
 const issues=[];
 if(missingRequired.length)issues.push(`Faltan variables: ${missingRequired.join(', ')}.`);
 if(!hasVercelLink)issues.push('Falta enlazar el proyecto Vercel.');
 const configuredRef=String(env.SUPABASE_PROJECT_REF??'').trim();
 const configuredUrl=String(env.NEXT_PUBLIC_SUPABASE_URL??'').trim();
 if(configuredRef&&configuredUrl){
  try{
   const urlRef=new URL(configuredUrl).hostname.split('.')[0];
   if(urlRef!==configuredRef)issues.push('SUPABASE_PROJECT_REF no coincide con NEXT_PUBLIC_SUPABASE_URL.');
  }catch{issues.push('NEXT_PUBLIC_SUPABASE_URL no es una URL válida.');}
 }
 if(linkedSupabaseRef&&configuredRef&&linkedSupabaseRef!==configuredRef)issues.push('El enlace local de Supabase apunta a otro proyecto.');
 const canProvision=missingRequired.length===0&&hasVercelLink&&issues.length===0;
 const canDevelop=missingDevelopment.length===0;
 return {missingRequired,missingDevelopment,issues,canProvision,canDevelop,needsProvisioning:!hasCredentials};
}

function envValue(value){
 return /^[A-Za-z0-9_@./:+-]*$/.test(value)?value:JSON.stringify(value);
}

export function upsertEnvText(text,updates){
 const names=new Set(Object.keys(updates));
 const kept=text.split(/\r?\n/).filter(line=>{
  const match=line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
  return !match||!names.has(match[1]);
 });
 while(kept.at(-1)==='')kept.pop();
 for(const [name,value] of Object.entries(updates))kept.push(`${name}=${envValue(String(value))}`);
 return `${kept.join('\n')}\n`;
}
