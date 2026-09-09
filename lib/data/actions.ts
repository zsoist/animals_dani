'use server';
import {createSession,finishSession,saveAttempt} from './student';
export async function startMission(){return createSession()}
export async function recordAttempt(input:Parameters<typeof saveAttempt>[0]){return saveAttempt(input)}
export async function completeMission(id:string,correct:number,duration:number){return finishSession(id,correct,duration)}
