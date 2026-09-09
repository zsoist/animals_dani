import {ingestEvents} from '@/lib/data/telemetry';
export async function POST(request:Request){
 if(request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin not allowed'},{status:403});
 try {const text=await request.text();if(text.length>60000)return Response.json({error:'Batch too large'},{status:413});const data=JSON.parse(text) as {events?:unknown};return Response.json(await ingestEvents(data.events));}
 catch{return Response.json({error:'Pending; retry later'},{status:503});}
}
