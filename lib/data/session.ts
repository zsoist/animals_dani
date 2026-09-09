import 'server-only';
import {redirect} from 'next/navigation';
import {database} from './server';
import {isConfigured} from './config';
export async function requireProfile(){if(!isConfigured())redirect('/auth');const db=await database();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/auth');const {data,error}=await db.from('profiles').select('id,display_name,role').eq('id',user.id).single();if(error||!data)throw new Error('No se pudo cargar tu perfil.');return {id:String(data.id),alias:String(data.display_name),role:String(data.role)}}
export async function requireTutor(){const profile=await requireProfile();if(profile.role!=='tutor')redirect('/');return profile}
