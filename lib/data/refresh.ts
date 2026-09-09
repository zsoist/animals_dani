import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {isConfigured,publicConfig} from './config';
export async function refresh(request:NextRequest){let response=NextResponse.next({request});if(!isConfigured())return response;const {url,key}=publicConfig();const db=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});await db.auth.getClaims();return response}
