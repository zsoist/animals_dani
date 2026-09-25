# Entrega del Refugio a Daniela

Este procedimiento crea una instalación independiente, propiedad de Daniela: su repositorio de GitHub, su proyecto Supabase y su proyecto Vercel. No se copian claves de la instalación anterior ni el progreso histórico de Laura.

## 1. Preparar las cuentas

1. Comparte este repositorio con la cuenta de GitHub de Daniela o transfiérelo a una organización que ella controle.
2. Daniela crea un proyecto **nuevo y exclusivo** en Supabase. Debe guardar la contraseña de la base de datos al crearlo.
3. Daniela importa el repositorio desde GitHub en Vercel y crea un proyecto nuevo. Todavía no importa que el primer despliegue falle por variables ausentes.
4. En su computador instala Node.js 22 o posterior y activa pnpm con `corepack enable`.

No reutilices el proyecto Supabase `DAN GPT`: contiene tablas de otras aplicaciones. El refugio debe tener su propia base para evitar que una migración ajena vuelva a afectar sus políticas RLS.

## 2. Clonar y configurar las claves locales

```sh
git clone URL_DEL_REPOSITORIO
cd CARPETA_DEL_REPOSITORIO
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Completa `.env.local` con valores del proyecto Supabase de Daniela:

- `SUPABASE_PROJECT_REF`: identificador corto que aparece en la URL del dashboard.
- `SUPABASE_DB_PASSWORD`: contraseña guardada al crear el proyecto. Solo se usa durante la instalación local.
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable key; una anon key heredada también funciona.
- `SUPABASE_SERVICE_ROLE_KEY`: secret key o service-role key. Es privada y nunca debe usar el prefijo `NEXT_PUBLIC_`.

Deja `LAURA_PASSWORD` vacío. El instalador creará una contraseña aleatoria. Los archivos `.env.local`, `.env.credentials.json` y `.vercel/` están excluidos de Git.

## 3. Enlazar Supabase y Vercel

```sh
pnpm exec supabase login
pnpm exec vercel login
pnpm exec vercel link
```

En `vercel link`, selecciona el proyecto que Daniela importó desde GitHub. Comprueba que `.vercel/project.json` mencione ese proyecto antes de continuar.

## 4. Crear la base, usuarios y variables de producción

```sh
pnpm setup:remote
```

El comando hace cuatro cosas:

1. enlaza el proyecto Supabase indicado por `SUPABASE_PROJECT_REF`;
2. aplica todas las migraciones y `supabase/seed.sql`;
3. crea el usuario compartido de Laura y el usuario tutor;
4. configura en Vercel las cinco variables necesarias para abrir el refugio.

Las dos contraseñas quedan en `.env.credentials.json`. Daniela debe guardarlas en su gestor de contraseñas. El acceso de estudiante se usa internamente; para `/tutor`, el usuario visible es `admin` y la contraseña es la del registro con rol `tutor`.

Este instalador está pensado para un proyecto Supabase vacío. No lo ejecutes sobre la instalación anterior ni sobre una base con usuarios del refugio ya creados.

## 5. Verificar y publicar

```sh
pnpm setup:verify
pnpm verify
pnpm exec vercel --prod --yes
```

Después del despliegue:

1. abre la URL de producción y confirma que aparece `Hola, Laura`, Milo y el botón `Ver misión de hoy`;
2. abre `/auth`, entra como `admin` con la contraseña del tutor y confirma que carga el panel;
3. ejecuta `pnpm exec vercel logs --environment production --since 10m --level error` y confirma que no hay errores nuevos;
4. en Supabase, revisa Advisors y confirma que no hay avisos RLS nuevos.

## 6. Servicios opcionales

- Numa/DeepSeek: añade `DEEPSEEK_API_KEY` como secreto de producción en Vercel. `DEEPSEEK_MODEL` es opcional.
- Google Drive: configura las variables `GOOGLE_*` en Vercel, comparte la carpeta con la cuenta de servicio y usa `https://DOMINIO-DE-DANIELA/api/tutor/drive/callback` como `GOOGLE_REDIRECT_URI`. Consulta `DRIVE_SETUP.md`.
- Previews de Vercel: las claves del Supabase de producción se configuran solo para Production. Para previews, crea un Supabase separado o añade variables de Preview conscientemente; no expongas la clave privada en código cliente.

## Recuperación rápida

Si la portada queda detenida en `Abriendo el refugio…`, revisa primero los logs de Vercel y luego que el usuario compartido pueda leer su fila en `public.profiles`. Las políticas del catálogo dependen de esa lectura. La migración `20260925151338_restore_profile_read_policies.sql` restaura esa garantía de forma idempotente.
