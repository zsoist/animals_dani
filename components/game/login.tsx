'use client';
import {useActionState} from 'react';
import {signIn} from '@/lib/data/auth';
export function Login(){const [state,action,pending]=useActionState(signIn,{error:''});return <form action={action}><label htmlFor="email">Usuario</label><input id="email" name="email" type="text" autoComplete="username" required/><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required/>{state.error&&<p className="error" role="alert">{state.error}</p>}<button className="primary" disabled={pending}>{pending?'Abriendo la puerta…':'Entrar'}</button></form>}
