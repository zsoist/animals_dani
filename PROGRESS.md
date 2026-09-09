# Refugio — progreso

## Fase 1 — completada
Esquema Supabase, RLS, catálogo, usuarios, escena 3D, acceso directo de Laura y botón Admin desplegados.

## Fase 2 — completada
- Generadores deterministas para despejes, unidades y química, cuatro niveles.
- Normalización de respuestas, firmas de errores, pistas progresivas y clasificación UNKNOWN.
- Mastery, decaimiento, bandas, subida/bajada de nivel, selector adaptativo y reinyección.
- 100 semillas por generador/nivel verificadas: 1200 ejercicios correctos en Vitest.

## Fase 3 — completada
- Misión diaria de diez preguntas superpuesta a la escena.
- Teclado numérico propio con coma decimal, borrado carácter a carácter y botón para limpiar; feedback, pista, reinyección y persistencia de intentos.
- Recompensa persistente en shelter_state, sesión completada y racha.
- Milo permanece visible después de recargar.
- En móvil, el encuadre de práctica eleva la escena para mantener a Milo visible sobre la tarjeta de preguntas.

## Fase 4 — completada
- Panel Admin con resumen, dominio por habilidad, aciertos, nivel y error dominante basado en intentos reales.
- Acceso de tutor validado en servidor; estudiante redirige al refugio.

## Verificación
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`: pasan.
- Producción: https://animals-dani.vercel.app responde HTTP 200.
- Inicio de misión real comprobado en móvil; primera pregunta generada desde Supabase.
- RLS verificada previamente: Laura no ve perfil/intentos de Tutor y no puede escribir registros ajenos.

## Límites honestos
- No se midió Lighthouse móvil, FPS real en 4G ni draw calls.
- No se ejecutó una sesión completa de diez respuestas en navegador automatizado; el inicio de sesión y la tarjeta de práctica sí se comprobaron en móvil.
