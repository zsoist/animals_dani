'use server';
import {createSession,finishSession,saveAttempt,careForShelter} from './student';
export async function startMission(){return createSession()}
export async function recordAttempt(input:Parameters<typeof saveAttempt>[0]){return saveAttempt(input)}
export async function completeMission(id:string,correct:number,duration:number){return finishSession(id,correct,duration)}

export async function care(action:"play"|"clean"|"feed"){return careForShelter(action)}
