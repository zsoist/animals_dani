# El refugio de Laura

Juego educativo en Next.js, con refugio 2D ilustrado, Supabase y acceso directo para Laura. Solo Admin pide usuario y contraseña.

## Estado

Las cuatro áreas están implementadas: acceso y persistencia, motor adaptativo, misión de diez desafíos con rescates y panel de tutor. La revisión visual incluye habitación 2D, gatos interactivos, racha con calendario y ejercicios grandes.

En `/tutor`, el usuario `admin` usa la contraseña existente. Desde «Nueva habilidad» se crean prácticas con enunciados, respuestas y pistas propias; también se editan prioridades, niveles, activación y notas. Las tres familias originales generan ejercicios automáticamente. Las prácticas personalizadas admiten números, fracciones y coeficientes.

Producción: https://animals-dani.vercel.app

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
- La escena actual usa SVG y CSS; los componentes 3D anteriores no se cargan en la aplicación.

## Admin: preparar material

1. Abre Nueva habilidad o edita una existente y selecciona preguntas propias.
2. En PDF e imágenes, abre tu archivo, elige página y recorte y pulsa Añadir como pregunta con imagen. Completa respuesta, nivel y tres pistas; guarda la habilidad.
3. Crear con IA acepta un prompt y, opcionalmente, texto extraído del PDF. Utiliza `DEEPSEEK_API_KEY` exclusivamente en el servidor; usa la facturación de esa cuenta. Revisa los borradores antes de guardar. `DEEPSEEK_MODEL` permite elegir el modelo (predeterminado `deepseek-v4-flash`).

El calendario permite un solo tema diario. Si ya empezó una práctica, el tema permanece ese día mientras esté activo. Nivel inicial también define el mínimo; nivel fijo impide la adaptación. PDF original no se almacena: se guardan las imágenes de preguntas seleccionadas. Los cuidados de los animales no suman respuestas académicas.

## Numa · tutor con memoria

DeepSeek explica el ejercicio actual en español, ofrece pistas y usa los últimos 200 intentos (20 por habilidad en el resumen). La memoria pedagógica y la conversación persisten en Supabase. Laura puede editar o vaciar su memoria y el profe puede consultar conversaciones y generar un informe. No se recopilan datos de navegación ni información personal adicional. La ayuda IA se registra como asistencia al calcular dominio. Los tiempos nuevos excluyen pestañas ocultas y espera de comprobación; los antiguos quedan fuera del análisis temporal IA.

Configura `DEEPSEEK_API_KEY` como secreto de Vercel y aplica `20260909200656_ai_tutor_memory.sql`. Nunca uses una variable NEXT_PUBLIC para la clave. Cada usuario tiene un máximo de 100 consultas en 24 horas, 6 por minuto y una solicitud simultánea. Los límites se aplican en Postgres; los ejercicios siguen funcionando sin IA. La API no evalúa respuestas ni modifica recompensas. El acceso directo de Laura sigue siendo compartido: quien abra el refugio accede a su conversación.
