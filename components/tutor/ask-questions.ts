export async function askQuestions(body:Record<string,unknown>):Promise<{questions:unknown;evidenceCount?:number}>{
 let response:Response;
 try{response=await fetch('/api/tutor/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(175000)});}catch{throw new Error('No llegó la respuesta. Tu trabajo sigue aquí. Reintenta con 3 preguntas.');}
 let data:{questions?:unknown;evidenceCount?:number;error?:string};
 try{data=await response.json();}catch{throw new Error('El servicio no terminó la solicitud. Tu borrador sigue aquí; prueba con 3 preguntas.');}
 if(!response.ok)throw new Error(data.error||'No se pudieron preparar las preguntas. Reintenta en un momento.');
 if(!data.questions)throw new Error('La propuesta llegó vacía. Reintenta con un objetivo más concreto.');
 return {questions:data.questions,evidenceCount:data.evidenceCount};
}
