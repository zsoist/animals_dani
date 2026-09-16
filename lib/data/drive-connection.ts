import 'server-only';
import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
import {OAuth2Client} from 'google-auth-library';
import {createClient} from '@supabase/supabase-js';
import {tutorDatabase} from './tutor-auth';
import {publicConfig} from './config';
export const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.readonly';
export function driveOAuthReady(){return Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET&&process.env.GOOGLE_REDIRECT_URI);}
export function driveOAuth(){
 if(!driveOAuthReady())throw new Error('Falta activar la conexión de Google para esta aplicación.');
 return new OAuth2Client(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET,process.env.GOOGLE_REDIRECT_URI);
}
function secretKey(){const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('No se pudo guardar la conexión.');return createHash('sha256').update(`refugio-drive:${key}`).digest();}
export function sealToken(token:string){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',secretKey(),iv);const encrypted=Buffer.concat([cipher.update(token,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64');}
export function openToken(sealed:string){const raw=Buffer.from(sealed,'base64');const cipher=createDecipheriv('aes-256-gcm',secretKey(),raw.subarray(0,12));cipher.setAuthTag(raw.subarray(12,28));return Buffer.concat([cipher.update(raw.subarray(28)),cipher.final()]).toString('utf8');}
export async function driveConnection(){
 const db=await tutorDatabase();const {data}=await db.auth.getUser();if(!data.user)throw new Error('Entra como Admin.');
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('Falta la conexión privada.');
 const store=createClient(publicConfig().url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const result=await store.from('drive_connections').select('*').eq('user_id',data.user.id).maybeSingle();
 if(result.error)throw new Error('No se pudo leer la conexión de Drive.');
 return {db,store,userId:data.user.id,connection:result.data as {refresh_token:string|null;folder_id:string|null;folder_name:string|null}|null};
}
