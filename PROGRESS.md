# Refugio — progreso

## Estado: rediseño 2D implementado, publicación en curso

Las fases 1–4 tienen implementación. La última petición reemplaza 3D por 2D y permite habilidades nuevas del tutor.

- Refugio ilustrado original, colores turquesa/coral/lavanda, gatos animados e interactivos, escena visible en práctica.
- Problemas grandes, teclado propio con coma/punto/fracciones, borrado y selección, feedback y avance manual.
- Racha legible con calendario de siete días, récord y estado de hoy.
- Admin con estadísticas, tendencias, errores reales, pistas, notas y editor de habilidades y preguntas propias.
- Verificación de respuestas y rescates en servidor; persistencia en el proyecto Supabase autorizado.

## Verificación del 9 de septiembre de 2026

- `pnpm typecheck`, `pnpm lint`, `pnpm test`: pasan. 33 pruebas; 100 semillas por familia y nivel (1.200), con solucionadores independientes de ecuaciones, conversiones y conteo de átomos.
- Navegador móvil 390 × 844: refugio y ejercicio legibles; teclado, coma, borrado y coeficientes comprobados.
- Sesión completa de diez ejercicios contra Supabase: respuesta incorrecta produce pista y reinyección tres posiciones después; respuestas correctas guardadas; Bruno rescatado y racha de un día conservados tras recarga.
- Admin: login real, creación de habilidad «Fracciones equivalentes», prioridad, pistas y nota guardadas. La práctica nueva apareció en la siguiente selección. Habilidad temporal de prueba eliminada al terminar.
- La sesión de verificación permanece en el refugio compartido: dos gatos (Milo y Bruno). No se borraron intentos previos.
- Pendiente de cierre: build final, publicación y verificación HTTP de producción.

## Límites honestos

- Lighthouse y rendimiento en un dispositivo físico con 4G no medidos; no se afirma una puntuación.
- No se reanudan sesiones incompletas al recargar; los intentos y recompensas ya guardados se conservan.
- Las preguntas personalizadas tienen clasificación genérica UNKNOWN; las firmas específicas corresponden a las tres familias generadas.
- El resumen del tutor consulta los últimos 1.000 intentos. No hay contenido de texto libre evaluado por IA.
- Los criterios originales exclusivamente 3D quedan sustituidos por la última decisión explícita del usuario.
