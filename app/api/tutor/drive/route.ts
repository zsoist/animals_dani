import {driveBank} from '@/lib/data/drive';
export const maxDuration=60;
export async function GET(request:Request){
 try{
  const result=await driveBank(new URL(request.url).searchParams.get('file')??undefined);
  if('response' in result&&result.response)return new Response(result.response.body,{headers:{'Content-Type':'application/pdf','Cache-Control':'private, no-store'}});
  return Response.json(result,{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){return Response.json({error:error instanceof Error?error.message:'No pudimos abrir Drive.'},{status:400});}
}
