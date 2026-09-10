'use server';
import {createSession,finishSession,saveAttempt,completeQuestion} from './student';
export async function startMission(...args:Parameters<typeof createSession>){return createSession(...args)}
export async function recordAttempt(input:Parameters<typeof saveAttempt>[0]){return saveAttempt(input)}
export async function completeMission(id:string,correct:number,duration:number){return finishSession(id,correct,duration)}

export async function finishQuestion(id:string,seed:string){return completeQuestion(id,seed)}
