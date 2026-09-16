import {cookies} from 'next/headers';
import {driveConnection,driveOAuth,sealToken,DRIVE_SCOPE} from '@/lib/data/drive-connection';
export async function GET(request:Request){
 const url=new URL(request.url),jar=await cookies();
 const saved=jar.get('drive_oauth')?.value;jar.set('drive_oauth','',{path:'/api/tutor/drive',httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:0});
 let result='error';
 try{
  const {userId,store}=await driveConnection();
  const state=saved?JSON.parse(saved) as {state:string;userId:string;verifier:string}:null;
  if(!state||state.userId!==userId||state.state!==url.searchParams.get('state')||!url.searchParams.get('code'))throw new Error('Invalid state');
  const {tokens}=await driveOAuth().getToken({code:url.searchParams.get('code')!,codeVerifier:state.verifier});
  if(!tokens.refresh_token||!tokens.scope?.split(' ').includes(DRIVE_SCOPE))throw new Error('Permission required');
  const savedToken=await store.from('drive_connections').upsert({user_id:userId,refresh_token:sealToken(tokens.refresh_token),updated_at:new Date().toISOString()});
  if(savedToken.error)throw new Error('Connection not saved');result='connected';
 }catch{/* Do not expose OAuth codes, tokens or provider error payloads. */}
 return Response.redirect(new URL(`/tutor?drive=${result}#drive`,request.url));
}
