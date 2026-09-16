import {cookies} from 'next/headers';
import {randomBytes} from 'node:crypto';
import {driveConnection,driveOAuth,DRIVE_SCOPE} from '@/lib/data/drive-connection';
export async function GET(){
 try{
  const {userId}=await driveConnection(),client=driveOAuth();
  const state=randomBytes(32).toString('hex');
  const pkce=await client.generateCodeVerifierAsync();
  (await cookies()).set('drive_oauth',JSON.stringify({state,userId,verifier:pkce.codeVerifier}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/tutor/drive',maxAge:600});
  const url=client.generateAuthUrl({scope:[DRIVE_SCOPE],access_type:'offline',prompt:'consent',state,code_challenge:pkce.codeChallenge,code_challenge_method:'S256' as import('google-auth-library').CodeChallengeMethod});
  return Response.redirect(url);
 }catch{return new Response('No se pudo iniciar la conexión. Vuelve al panel de profesor y revisa la configuración de Google.',{status:400});}
}
