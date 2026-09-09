# Refugio — progreso

## Fase 1 — completada el 2026-09-09
- Producción: https://animals-dani.vercel.app — GET HTTP 200.
- Proyecto Supabase: pwcvskguqyhbhlwnsmmy, DAN GPT, plan gratuito, us-east-2.
- Acceso conseguido con la cuenta ChatGPT del usuario en el navegador. El conector y CLI Supabase aún pertenecen a la cuenta anterior.
- Migración inicial y seed aplicados desde los archivos SQL del repositorio; historial registrado en supabase_migrations.
- Verificados en SQL: 11 tablas con RLS, 3 habilidades, 6 gatos.
- Dos usuarios Auth reales creados con alias Laura y Tutor. Credenciales locales en .env.credentials.json (no versionado).
- Variables Supabase y acceso de Laura configuradas en Vercel. Clave de servicio solo servidor.
- Laura entra directamente en /; Admin usa usuario admin y contraseña del tutor.
- Login Admin comprobado en producción: /auth → /tutor.
- Login de estudiante, aislamiento del perfil tutor y rechazo PostgreSQL 42501 a escritura de otro usuario verificados con la API real.
- Consulta directa a intentos del tutor desde estudiante devuelve 0 filas; no hay aún intentos en producción.
- Habitación y Milo animado verificados visualmente a 390 × 844; gato cargado desde Supabase tras recargar.
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (3 pruebas de configuración), `pnpm build`: pasan.

## Pendiente
2. Motor puro de aprendizaje y pruebas de 100 semillas por nivel.
3. Sesión, recompensas persistentes, rescates y racha.
4. Panel del tutor, CRUD e insights.

## Criterios §11
1. Cumplido: las cuatro comprobaciones pasan.
2. Cumplido: producción HTTP 200, escena 3D móvil cargada.
3. Pendiente: sesión de ejercicios y rescate.
4. Pendiente: pistas y reinyección.
5. Pendiente: diagnóstico de conversión de área.
6. Parcial: Admin requiere sesión, RLS real verificada; falta prueba end-to-end de /tutor con cookie estudiante y fixture de intento ajeno.
7. Pendiente: CRUD de habilidades.
8. Pendiente: motor y pruebas de semillas.
9. Pendiente: Lighthouse móvil.
10. Cumplido para el código actual: sin marcadores pendientes, tipos explícitos inseguros ni datos simulados en producción.

## Límites de verificación
- No se midieron aún FPS, carga 4G ni draw calls con seis gatos.
- Three emite una advertencia interna sobre Clock deprecado; no hay errores TypeScript.
