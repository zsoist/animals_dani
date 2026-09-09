# Refugio — progreso

## Estado: rediseño 2D publicado y verificado

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
- Build final aprobado. Publicado en https://animals-dani.vercel.app: HTTP 200 verificado y habitación 2D comprobada en navegador de producción. Despliegue `dpl_2yvqpMN2HxFjqbVvPMK5eBfsCAf7`.

## Límites honestos

- Lighthouse y rendimiento en un dispositivo físico con 4G no medidos; no se afirma una puntuación.
- No se reanudan sesiones incompletas al recargar; los intentos y recompensas ya guardados se conservan.
- Las preguntas personalizadas tienen clasificación genérica UNKNOWN; las firmas específicas corresponden a las tres familias generadas.
- El resumen del tutor consulta los últimos 1.000 intentos. No hay contenido de texto libre evaluado por IA.
- Los criterios originales exclusivamente 3D quedan sustituidos por la última decisión explícita del usuario.

## Revisión posterior: centro de rescate y estudio de preguntas

Publicada en https://animals-dani.vercel.app. Despliegue `dpl_HTUJWV4Gzjtne7LxLvSArBbPySnA`: página y worker PDF responden HTTP 200; acceso Admin y estudio de preguntas comprobados en producción. Typecheck, lint, 41 pruebas y build final aprobados.

- Escena amplia de centro de rescate con paleta intensa; preguntas en tarjetas centradas sobre el fondo atenuado.
- Comedor, pelota, limpieza y día/noche con respuestas visuales. Juego y limpieza persisten cuidado sin alterar aciertos.
- Un tema por día; calendario semanal, prioridad, nivel mínimo o fijo. Las tres habilidades existentes tienen mínimo nivel 3 guardado desde Admin.
- Importador PDF e imágenes: página, extracción de texto, recorte vertical, adjuntar imagen, visor con zoom y desplazamiento. PDF local de prueba abierto y texto extraído correctamente; imagen adjuntada al borrador y zoom a 150% comprobado. El archivo de prueba no se publicó como contenido de Laura.
- Banco editable con duplicado, reordenado, importación/exportación JSON y guardado. Se mantiene validación de respuestas y RLS existentes.
- Generación OpenAI integrada con prompt, nivel, cantidad y referencia del PDF. No hay clave configurada: se verificó el aviso real de clave ausente, no se verificó una generación pagada.
- 41 pruebas pasan, incluyendo 1.200 ejercicios, selección de tema estable por día, calendario, dificultad, importación y recorrido de preguntas propias sin repeticiones hasta agotar el banco.
- Navegador en 1280 × 720: tarjeta centrada, cuidado interactivo, respuesta nivel 3 guardada y siguiente ejercicio de la misma habilidad. El control de viewport de esta sesión no aplicó 390 × 844; no se declara una nueva verificación móvil visual.
- Animaciones de transformaciones/opacity y movimiento reducido. 60 FPS es objetivo; no se midió FPS en móvil físico ni Lighthouse en esta revisión.

## DeepSeek y memoria — 2026-09-09
- Implementado Numa dentro del refugio y los ejercicios: pistas, explicación, revisión, historial persistente y memoria editable.
- DeepSeek real verificado: conversación conservada tras recarga; informe del admin generado con 30 intentos reales.
- Generación de preguntas conectada al servidor; clave en entorno local ignorado y Vercel producción cifrado.
- Migración aplicada, tablas con RLS y RPC de cuotas accesible únicamente al servidor.
- Medición de tiempo activo y etiqueta de ayuda IA; tiempos antiguos excluidos de evidencia temporal.
- Verificado en navegador: respuesta contextual sin dar solución, recarga del historial, informe real y generación de dos borradores con segunda revisión de razonamiento. Un intento guardó 59.110 ms de tiempo activo, ai_help=true y hint_level=1.
- 47 tests pasan, incluyendo mediana de tiempos, privacidad y reloj con pausas/reintentos; typecheck, lint y build pasan. Producción publicada y HTTP 200 verificado para / y /api/coach; consulta real de Numa desde Vercel exitosa. Memoria editada conservada. Una respuesta mal formada de proveedor mostró error recuperable; se añadió parser probado para cercas JSON y escapes matemáticos.

## Refinamiento del refugio y laboratorio IA — 2026-09-09
- Implementados patio ilustrado original, Numa y seis gatos recortables, cuidado animado y reducción de movimiento. Preguntas centradas, texto legible y superficies de carga/conexión nuevas.
- Admin reorganizado en Progreso, Laboratorio IA y Habilidades, con búsqueda, filtros, preguntas plegables y prueba de respuesta sin crear intentos.
- Generación real verificada: tres preguntas de despejes a partir de 15 intentos reales, revisión matemática independiente y prueba de la primera respuesta correcta. Guardado en Supabase como «Despejar ecuaciones · Refuerzo», desactivado, disponible para revisión del profe.
- La consulta pedagógica admite una pregunta concreta del profesor y exportación del análisis; conserva el historial y memoria existentes. Consulta real de conversiones verificada con razonamiento DeepSeek: plan de un solo tema y ejemplos comprobados, sin metas de velocidad inventadas.
- Typecheck, lint, 48 pruebas y build pasan. Incluyen 1.200 semillas por familia/nivel y 100 comprobaciones adicionales de decimales exactos legibles.
- Capturas Chrome reales en 390 × 844 y 1280 × 900: refugio, tarjeta central, progreso y laboratorio. Revisión independiente Impeccable: corregido selector pedagógico truncado; disposición final ship. Se trata de refinamiento de dirección fijada, no de una exploración conceptual nueva.
- No se midieron FPS ni Lighthouse. No se afirma que la IA sea infalible; los borradores requieren revisión del profe.
- Publicada en https://animals-dani.vercel.app, despliegue `dpl_A4FoiSVb2nT9bDWWf4LcPwoZEqFa`. HTTP 200 de la página y las tres ilustraciones comprobados; login admin, laboratorio, catálogo y análisis persistido verificados en producción. Código `b21ee52`.

## Fórmulas de octavo, gatos pequeños y comedor diario
- Gatos más pequeños, violeta/verde y otras variantes, con nombre, personalidad e historia verificados al tocar en móvil.
- Comedor bloqueado hasta completar los diez retos de hoy, tanto en la interfaz como en la acción del servidor. Los aciertos ya no aumentan comida.
- 16 fórmulas simbólicas en cuatro niveles, teclado de letras y operaciones, pistas y firmas algebraicas. Editor e IA aceptan expresiones.
- 55 pruebas: equivalencias exactas, sintaxis inválida, clasificación de errores, 100 semillas por familia/nivel con sustitución independiente y bloqueo del comedor mediante pruebas de la acción del servidor.
- Móvil 390 × 844: fórmula x = s+v*t, respuesta equivalente (x-s)/(v) aceptada y guardada realmente; teclado, ficha de Milo y colores comprobados.
- Publicado en https://animals-dani.vercel.app, despliegue `dpl_BeS1oPDjhZjRYrjrBPoGBM2aMj2o`, código `372419b`. HTTP 200 y nueva misión simbólica con teclado de letras comprobados en producción. Typecheck, lint, 55 pruebas y build pasan.
