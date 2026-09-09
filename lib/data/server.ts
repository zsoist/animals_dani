import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicConfig } from './config';
export async function database() {
 const jar = await cookies();
 const { url, key } = publicConfig();
 return createServerClient(url, key, {
  cookies: {
   getAll: () => jar.getAll(),
   setAll: (values) => {
    try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
    catch { /* Server components read cookies; the proxy refreshes them. */ }
   },
  },
 });
}
export async function isTutorPreview(){
 const db=await database();const auth=await db.auth.getUser();
 if(!auth.data.user)return false;
 const profile=await db.from('profiles').select('role').eq('id',auth.data.user.id).maybeSingle();
 return profile.data?.role==='tutor';
}
