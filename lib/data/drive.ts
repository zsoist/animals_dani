import 'server-only';
import {GoogleAuth} from 'google-auth-library';
import {tutorDatabase} from './tutor-auth';
const scope='https://www.googleapis.com/auth/drive.readonly';
function configuration(){
 const raw=process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON,folder=process.env.GOOGLE_DRIVE_FOLDER_ID;
 if(!raw||!folder)return null;
 const c=JSON.parse(raw) as {client_email?:string;private_key?:string};
 if(!c.client_email||!c.private_key||!/^[\w-]+$/.test(folder))throw new Error('Revisa la configuración privada de Drive.');
 return {credentials:{client_email:c.client_email,private_key:c.private_key},folder};
}
export async function driveBank(fileId?:string){
 await tutorDatabase();
 const config=configuration();if(!config)return {configured:false as const};
 const auth=new GoogleAuth({credentials:config.credentials,scopes:[scope]});
 const token=await auth.getAccessToken();if(!token)throw new Error('No pudimos autenticar la carpeta de Drive.');
 const headers={Authorization:`Bearer ${token}`};
 const base='https://www.googleapis.com/drive/v3/files';
 if(fileId){
  if(!/^[\w-]{5,200}$/.test(fileId))throw new Error('Archivo inválido.');
  const meta=await fetch(`${base}/${fileId}?fields=id,name,mimeType,size,parents,trashed`,{headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!meta.ok)throw new Error('No se pudo abrir ese archivo de Drive.');
  const file=await meta.json() as {name:string;mimeType:string;size:string;parents?:string[];trashed?:boolean};
  if(file.trashed||!file.parents?.includes(config.folder)||file.mimeType!=='application/pdf'||Number(file.size)>15*1024*1024)throw new Error('Elige un PDF de la carpeta conectada, de hasta 15 MB.');
  const response=await fetch(`${base}/${fileId}?alt=media`,{headers,cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Drive no pudo entregar el PDF. Reintenta.');
  return {configured:true as const,response,name:file.name};
 }
 const params=new URLSearchParams({q:`'${config.folder}' in parents and trashed = false and mimeType = 'application/pdf'`,fields:'files(id,name,size,modifiedTime),nextPageToken',pageSize:'100',orderBy:'modifiedTime desc'});
 const files:Array<{id:string;name:string;size:string;modifiedTime:string}>=[];
 do{
  const response=await fetch(`${base}?${params}`,{headers,cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('No pudimos leer la carpeta. Comprueba que esté compartida con la cuenta de servicio.');
  const data=await response.json() as {files:typeof files;nextPageToken?:string};files.push(...data.files);
  if(!data.nextPageToken)break;params.set('pageToken',data.nextPageToken);
 }while(files.length<500);
 return {configured:true as const,files,email:config.credentials.client_email};
}
