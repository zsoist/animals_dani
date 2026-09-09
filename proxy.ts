import type {NextRequest} from 'next/server';
import {refresh} from '@/lib/data/refresh';
export async function proxy(request:NextRequest){return refresh(request)}
export const config={matcher:['/student/:path*','/tutor/:path*','/auth']};
