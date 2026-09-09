# El refugio de Laura

Aplicación Next.js con React Three Fiber, Supabase y acceso directo al refugio de Laura. Solo Admin pide usuario y contraseña.

## Estado

Fase 1 en preparación. El proyecto Vercel está conectado. La nueva cuenta gratuita de Supabase aún no está disponible en el conector; no se han aplicado migraciones ni creado usuarios remotos. Las fases 2–4 se implementan después de verificar esta base.

## Instalación y despliegue en tres comandos

Requisitos: pnpm, acceso a Vercel y un proyecto Supabase nuevo. Copiar `.env.example` a `.env.local` y completar las claves del proyecto. La clave de servicio es exclusiva del servidor. Definir `SUPABASE_PROJECT_REF` y `SUPABASE_DB_PASSWORD` en el entorno de la terminal. Autenticar la CLI Supabase según sus instrucciones. El script de instalación escribe las credenciales aleatorias en un archivo local excluido de Git y configura las variables de Vercel.

```sh
pnpm install --frozen-lockfile
pnpm setup:remote
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm exec vercel --prod --yes
```

Para desarrollar: `pnpm dev`.

Las migraciones están en `supabase/migrations` y el contenido inicial en `supabase/seed.sql`. La creación de los dos usuarios Auth es administrativa; no hay registro público. El generador de credenciales está en `lib/data/provision.mjs`.

## Decisiones de acceso

Todos los visitantes de la URL usan el mismo refugio de Laura, por petición expresa. Sus credenciales permanecen en el servidor y sus consultas se ejecutan como estudiante, sujetas a RLS. Admin conserva sesión por cookies y validación de rol en el servidor. No se envían claves privadas al navegador.

## Referencias de implementación

- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/installation)
