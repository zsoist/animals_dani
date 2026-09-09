"use client";
import { useActionState, useEffect } from "react";
import { signIn } from "@/lib/data/auth";
import {track} from "@/components/telemetry/client";
export function Login() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  useEffect(()=>{if(state.error)track("auth_result",{success:false,reason:"access_unconfirmed"});},[state]);
  return (
    <form action={action} data-track="admin_login">
      <label htmlFor="email">Usuario</label>
      <input
        id="email"
        name="email"
        type="text"
        autoComplete="username"
        required
      />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      <button className="primary" disabled={pending}>
        {pending ? "Abriendo la puerta…" : "Entrar"}
      </button>
    </form>
  );
}
