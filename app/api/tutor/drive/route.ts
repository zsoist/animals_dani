import {driveBank} from '@/lib/data/drive';
export const maxDuration=60;
export async function GET(request:Request){
 try{
  const result=await driveBank(new URL(request.url).searchParams.get('file')??undefined);
  if('response' in result&&result.response)return new Response(result.response.body,{headers:{'Content-Type':'application/pdf','Cache-Control':'private, no-store'}});
  return Response.json(result,{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'No pudimos abrir Drive.'},{status:400});}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origen inválido.'},{status:403});
 try{const {setDriveFolder}=await import('@/lib/data/drive');const body=await request.json() as {folder?:unknown};if(typeof body.folder!=='string'||body.folder.length>500)throw new Error('Pega el enlace de tu carpeta.');return Response.json(await setDriveFolder(body.folder));}catch(error){return Response.json({error:error instanceof Error?error.message:'No se pudo conectar la carpeta.'},{status:400});}
}
