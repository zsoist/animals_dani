import {suggestMicroSkills} from '@/lib/data/weekly-plan';
export const maxDuration=90;
export async function POST(request:Request){try{const data=await request.json() as {topic?:unknown};return Response.json(await suggestMicroSkills(data.topic));}catch(error){return Response.json({error:error instanceof Error?error.message:'No pudimos preparar la semana.'},{status:400});}}
