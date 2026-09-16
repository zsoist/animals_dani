import 'server-only';
import {GoogleAuth} from 'google-auth-library';
import {tutorDatabase} from './tutor-auth';
import {driveConnection,driveOAuth,openToken,driveOAuthReady} from './drive-connection';
import {driveFolderId} from '@/lib/engine/drive-bank';
const scope='https://www.googleapis.com/auth/drive.readonly';
function configuration(){
 const raw=process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON,folder=process.env.GOOGLE_DRIVE_FOLDER_ID;
 if(!raw||!folder)return null;
 const c=JSON.parse(raw) as {client_email?:string;private_key?:string};
 if(!c.client_email||!c.private_key||!/^[\w-]+$/.test(folder))throw new Error('Revisa la configuración privada de Drive.');
 return {credentials:{client_email:c.client_email,private_key:c.private_key},folder};
}
async function access(){
 await tutorDatabase();
 const service=configuration();
 if(service){const auth=new GoogleAuth({credentials:service.credentials,scopes:[scope]});const token=await auth.getAccessToken();if(!token)throw new Error('No pudimos autenticar Drive.');return {headers:{Authorization:`Bearer ${token}`},folder:service.folder,folderName:'Banco de preguntas',email:service.credentials.client_email};}
 if(!driveOAuthReady())return null;
 const {connection}=await driveConnection();
 if(!connection?.refresh_token)return null;
 const client=driveOAuth();client.setCredentials({refresh_token:openToken(connection.refresh_token)});
 let token:string|null|undefined;
 try{token=(await client.getAccessToken()).token;}catch{throw new Error('Google necesita que vuelvas a conectar tu cuenta.');}
 if(!token)throw new Error('Vuelve a conectar Google.');
 return {headers:{Authorization:`Bearer ${token}`},folder:connection.folder_id,folderName:connection.folder_name,email:undefined};
}
export async function setDriveFolder(value:string){
 const folder=driveFolderId(value),config=await access();if(!config)throw new Error('Conecta Google antes de elegir la carpeta.');
 if(configuration())throw new Error('Esta carpeta se administra mediante la configuración del servidor.');
 const response=await fetch(`https://www.googleapis.com/drive/v3/files/${folder}?fields=id,name,mimeType,trashed`,{headers:config.headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Tu cuenta no puede abrir esa carpeta. Comprueba el enlace y los permisos.');
 const file=await response.json() as {name:string;mimeType:string;trashed?:boolean};
 if(file.trashed||file.mimeType!=='application/vnd.google-apps.folder')throw new Error('El enlace debe ser de una carpeta.');
 const {store,userId}=await driveConnection();
 const saved=await store.from('drive_connections').update({folder_id:folder,folder_name:file.name,updated_at:new Date().toISOString()}).eq('user_id',userId);
 if(saved.error)throw new Error('No se pudo guardar la carpeta.');
 return {folder,name:file.name};
}
export async function driveBank(fileId?:string){
 const config=await access();if(!config)return {configured:false as const,oauthReady:driveOAuthReady()};
 if(!config.folder)return {configured:true as const,needsFolder:true as const,files:[]};
 const {headers}=config;
 const base='https://www.googleapis.com/drive/v3/files';
 if(fileId){
  if(!/^[\w-]{5,200}$/.test(fileId))throw new Error('Archivo inválido.');
  const meta=await fetch(`${base}/${fileId}?fields=id,name,mimeType,size,parents,trashed`,{headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!meta.ok)throw new Error('No se pudo abrir ese archivo de Drive.');
  const file=await meta.json() as {name:string;mimeType:string;size:string;parents?:string[];trashed?:boolean};
  if(file.trashed||!file.parents?.includes(config.folder)||file.mimeType!=='application/pdf'||Number(file.size)>15*1024*1024)throw new Error('Elige un PDF de la carpeta conectada, de hasta 15 MB.');
  const response=await fetch(`${base}/${fileId}?alt=media`,{headers,cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Drive no pudo entregar el PDF. Reintenta.');
  return {configured:true as const,response,name:file.name,folder:config.folder};
 }
 const params=new URLSearchParams({q:`'${config.folder}' in parents and trashed = false and mimeType = 'application/pdf'`,fields:'files(id,name,size,modifiedTime),nextPageToken',pageSize:'100',orderBy:'modifiedTime desc'});
 const files:Array<{id:string;name:string;size:string;modifiedTime:string}>=[];
 do{
  const response=await fetch(`${base}?${params}`,{headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('No pudimos leer la carpeta. Comprueba que esté compartida con la cuenta de servicio.');
  const data=await response.json() as {files:typeof files;nextPageToken?:string};files.push(...data.files);
  if(!data.nextPageToken)break;params.set('pageToken',data.nextPageToken);
 }while(files.length<500);
 return {configured:true as const,files:files.slice(0,500),folder:config.folder,folderName:config.folderName,email:config.email};
}
