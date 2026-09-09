# Refugio — progreso

## Fase 1 — en curso
- Repositorio y Vercel conectados.
- Stack instalado con versiones exactas.
- Pendiente: proyecto Supabase de la nueva cuenta gratuita; solo se ven Trophe y Trophe-QA en la conexión actual.
- En construcción: esquema, políticas RLS, seed, autenticación por roles y refugio procedural.

## Fases siguientes
2. Motor puro y pruebas de 100 semillas por nivel.
3. Sesión, recompensas persistentes, rescates y racha.
4. Panel del tutor e insights.

## Criterios §11
1. Pendiente: comprobaciones.
2. Pendiente: despliegue y escena móvil autenticada.
3. Pendiente: sesión completa y persistencia.
4. Pendiente: pistas y reinyección.
5. Pendiente: diagnóstico de conversión de área.
6. Pendiente: RLS real y redirección por rol.
7. Pendiente: CRUD.
8. Pendiente: motor.
9. Pendiente: Lighthouse móvil.
10. Pendiente: inspección final.

## Verificación de la base local
- `pnpm typecheck`, `pnpm lint`, `pnpm test` (3 pruebas de configuración) y `pnpm build`: pasan.
- No son pruebas del motor: la Fase 2 no ha empezado.
- Inspección de código de producción: sin marcadores pendientes, tipos explícitos inseguros ni datos simulados.
- Cambio solicitado: Laura accede a / sin login; solo el botón Admin requiere usuario y contraseña.
- Esquema SQL y catálogo inicial preparados; no aplicados porque la cuenta Supabase nueva no está conectada.
- El refugio muestra la habitación real en 3D; los gatos se cargan desde Supabase y aún no aparecen hasta completar esa conexión.

## Despliegue de la base — 2026-09-09
- URL real: https://animals-dani.vercel.app — GET devuelve HTTP 200.
- Habitación WebGL comprobada visualmente a 390 × 844: suelo, paredes, ventana, alfombra y luz cálida.
- /tutor sin sesión devuelve HTTP 307 hacia /auth.
- Las cuatro comprobaciones locales pasan; hay tres pruebas de configuración, no de aprendizaje.
- Fase 1 NO completada: falta proyecto Supabase nuevo, migración aplicada, usuarios reales, verificación de RLS y gato inicial cargado de la base.
- Criterios cumplidos: 1, 2, 10 (3/10 para la base existente). Criterios 3–8 pendientes por Supabase y fases 2–4; 9 pendiente de Lighthouse.
- Nota de rendimiento: no se ha medido el presupuesto de draw calls con seis gatos ni fps/4G. Three emite una advertencia interna de deprecación de Clock; no es un error TypeScript.
- Próximo paso: conectar la cuenta/proyecto Supabase gratuito, completar .env.local y ejecutar la instalación remota descrita en README.md. Después verificar Fase 1 y avanzar en orden.
