import {describe,expect,it} from 'vitest';
import {hasCompleteCredentials,inspectSetup,parseCredentials,upsertEnvText} from './setup-state.mjs';

describe('inspectSetup',()=>{
 it('lists only missing key names and requires a Vercel link',()=>{
  const result=inspectSetup({env:{},hasVercelLink:false,linkedSupabaseRef:null,hasCredentials:false});
  expect(result.missingRequired).toEqual([
   'SUPABASE_PROJECT_REF',
   'SUPABASE_DB_PASSWORD',
   'NEXT_PUBLIC_SUPABASE_URL',
   'NEXT_PUBLIC_SUPABASE_ANON_KEY',
   'SUPABASE_SERVICE_ROLE_KEY',
  ]);
	  expect(result.issues).toContain('Falta enlazar el proyecto Vercel.');
  expect(result.canProvision).toBe(false);
  expect(result.canDevelop).toBe(false);
 });

 it('blocks provisioning when the Supabase URL belongs to a different project',()=>{
  const result=inspectSetup({
   env:{
    SUPABASE_PROJECT_REF:'project-a',
    SUPABASE_DB_PASSWORD:'database-password',
    NEXT_PUBLIC_SUPABASE_URL:'https://project-b.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:'publishable-key',
	    SUPABASE_SERVICE_ROLE_KEY:'secret-key',
    LAURA_EMAIL:'student@example.test',
    LAURA_PASSWORD:'student-password',
   },
   hasVercelLink:true,
   linkedSupabaseRef:null,
   hasCredentials:false,
  });
  expect(result.canProvision).toBe(false);
  expect(result.issues).toContain('SUPABASE_PROJECT_REF no coincide con NEXT_PUBLIC_SUPABASE_URL.');
 });

 it('allows provisioning only when required keys and links agree',()=>{
  const result=inspectSetup({
   env:{
    SUPABASE_PROJECT_REF:'project-a',
    SUPABASE_DB_PASSWORD:'database-password',
    NEXT_PUBLIC_SUPABASE_URL:'https://project-a.supabase.co',
	    NEXT_PUBLIC_SUPABASE_ANON_KEY:'publishable-key',
	    SUPABASE_SERVICE_ROLE_KEY:'secret-key',
	    LAURA_EMAIL:'student@example.test',
	    LAURA_PASSWORD:'student-password',
   },
   hasVercelLink:true,
   linkedSupabaseRef:'project-a',
   hasCredentials:true,
  });
	  expect(result).toMatchObject({canProvision:true,canDevelop:true,needsProvisioning:false,issues:[],missingRequired:[]});
 });

 it('marks user provisioning as pending when credentials do not exist yet',()=>{
  const result=inspectSetup({
   env:{
    SUPABASE_PROJECT_REF:'project-a',
    SUPABASE_DB_PASSWORD:'database-password',
    NEXT_PUBLIC_SUPABASE_URL:'https://project-a.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:'publishable-key',
    SUPABASE_SERVICE_ROLE_KEY:'secret-key',
   },
   hasVercelLink:true,
   linkedSupabaseRef:null,
   hasCredentials:false,
  });
	  expect(result).toMatchObject({canProvision:true,canDevelop:false,needsProvisioning:true});
 });

 it('allows normal development without database migration credentials',()=>{
  const result=inspectSetup({
   env:{
    NEXT_PUBLIC_SUPABASE_URL:'https://project-a.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:'publishable-key',
    SUPABASE_SERVICE_ROLE_KEY:'secret-key',
    LAURA_EMAIL:'student@example.test',
    LAURA_PASSWORD:'student-password',
   },
   hasVercelLink:true,
   linkedSupabaseRef:null,
   hasCredentials:true,
  });
  expect(result).toMatchObject({
   canProvision:false,
   canDevelop:true,
   missingRequired:['SUPABASE_PROJECT_REF','SUPABASE_DB_PASSWORD'],
   missingDevelopment:[],
  });
 });
});

describe('upsertEnvText',()=>{
 it('replaces duplicate credentials while preserving unrelated settings',()=>{
  const result=upsertEnvText('LAURA_EMAIL=old@example.test\nKEEP_ME=yes\nLAURA_EMAIL=duplicate@example.test\nLAURA_PASSWORD=\n',{
   LAURA_EMAIL:'estudiante@refugio.test',
   LAURA_PASSWORD:'new-password',
  });
  expect(result).toBe('KEEP_ME=yes\nLAURA_EMAIL=estudiante@refugio.test\nLAURA_PASSWORD=new-password\n');
 });
});

describe('hasCompleteCredentials',()=>{
 const credentials=[
  {role:'student',email:'student@example.test',password:'student-password'},
  {role:'tutor',email:'tutor@example.test',password:'tutor-password'},
 ];

 it('requires a usable student and tutor record scoped to the active project',()=>{
  const file=JSON.stringify({projectRef:'project-a',credentials});
  expect(hasCompleteCredentials(file,'project-a')).toBe(true);
  expect(hasCompleteCredentials(file,'project-b')).toBe(false);
  expect(parseCredentials(file,'project-b')).toEqual([]);
  expect(hasCompleteCredentials('[{"role":"student"}]')).toBe(false);
  expect(hasCompleteCredentials('not json')).toBe(false);
 });

 it('still reads legacy credential arrays for an already configured development checkout',()=>{
  expect(parseCredentials(JSON.stringify(credentials))).toEqual(credentials);
  expect(parseCredentials(JSON.stringify(credentials),'project-a')).toEqual([]);
  expect(hasCompleteCredentials(JSON.stringify(credentials))).toBe(true);
  expect(hasCompleteCredentials(JSON.stringify(credentials),'project-a')).toBe(false);
 });
});
