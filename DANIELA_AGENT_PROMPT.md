# Prompt único para Codex o Claude

Copia y pega todo el bloque siguiente después de abrir este repositorio en Codex o Claude:

```text
Quiero dejar Refugio completamente instalado y listo para desarrollar en mis propias cuentas.

Lee primero AGENTS.md, DANIELA_SETUP.md, .env.example y package.json. Trabaja de principio a fin y no te detengas en explicaciones intermedias salvo cuando necesites que yo haga un paso humano obligatorio.

Objetivo final:
- repositorio instalado localmente con pnpm;
- proyecto Supabase nuevo, exclusivo para Refugio y propiedad de mi cuenta;
- proyecto Vercel nuevo, conectado a mi repositorio GitHub y propiedad de mi cuenta;
- .env.local completo sin publicar secretos;
- migraciones, seed y usuarios aplicados;
- credenciales guardadas solo en .env.credentials.json y fuera de Git;
- pruebas, lint, tipos y build aprobados;
- producción desplegada y verificada en navegador;
- entorno local arrancando con pnpm dev para que pueda vibecodear.

Reglas:
1. No reutilices el Supabase DAN GPT, el project ref pwcvskguqyhbhlwnsmmy ni un Vercel anterior. Deben ser proyectos nuevos y míos.
2. No muestres contraseñas, tokens, claves privadas ni valores de .env en el chat o terminal. Solo puedes mostrar nombres de variables.
3. Antes de migrar, ejecuta pnpm setup:doctor y confirma que .vercel/project.json apunta a mi proyecto y que SUPABASE_PROJECT_REF coincide con NEXT_PUBLIC_SUPABASE_URL.
4. Usa las migraciones del repositorio; no reconstruyas el esquema manualmente.
5. Cuando necesites login, CAPTCHA, crear un proyecto con costo o que copie una clave, dime una sola instrucción clara y espera. Continúa automáticamente después.
6. Ejecuta pnpm setup:daniela solo cuando los enlaces y variables estén verificados.
7. Al final abre la producción, confirma Hola, Laura, Milo, Ver misión de hoy y /auth, revisa errores recientes de Vercel y ejecuta pnpm setup:verify y pnpm verify.
8. Si algo falla, diagnostica la causa, corrígela, vuelve a verificar y no declares terminado hasta que todo esté verde.

Empieza ahora con un inventario de herramientas y pnpm setup:doctor. Si todavía no existen mis proyectos, ayúdame a crearlos en el orden correcto.
```
