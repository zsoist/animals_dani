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

## Seguimiento y fiabilidad — 2026-09-09
- Añadido Uso y señales en Admin: actividad, ayudas, funciones exploradas, exportación, separación de orígenes/pruebas y estado de solicitudes IA.
- Eventos propios persistidos con deduplicación, cola local y reintentos; tiempo visible y activo aproximado; no se registra contenido de teclas ni pantallas.
- Corregidos guardados parciales/duplicados de intentos, rescates, habilidades y conversaciones. Expresiones aceptadas en el guardado del profe; sesión compartida reutilizada.
- SQL real con rollback verifica idempotencia, reversión tras error, RLS de eventos, guardado de cuatro niveles y protección de memoria manual. Tres migraciones aplicadas.
- Chrome: pista, respuesta m-d correcta y recompensa persistida; Admin muestra sus eventos de prueba. Reenvío HTTP de evento deja una fila y elimina propiedades privadas.
- DeepSeek real: respuesta persistida; reenvío devuelve la misma y conserva exactamente dos mensajes. Formato inválido del proveedor observado y cubierto con reintento único probado.
- 63 pruebas pasan; typecheck, lint y build pasan. Captura móvil 390 × 844 revisada y cabecera de Uso ajustada para no comprimir el texto.
- Publicado en https://animals-dani.vercel.app, código `5bc1eef`, despliegue `dpl_BFXMkBfTY88qSkJqJjjkiV5ZypfS`. HTTP 200 del refugio, consulta de Numa y recepción de eventos. Evento real persistido, panel autenticado con Uso y señales/estado IA comprobado. Numa en producción respondió sobre fórmulas simbólicas sin inventar un ejercicio abierto; reenvío recuperó la misma respuesta. Acceso anónimo a /tutor entrega redirección de Next a /auth sin datos del panel (respuesta transmitida con marcador de redirección). No se midieron FPS ni Lighthouse. No se afirma captura absoluta ni identidad verificada de Laura.

## Refugio sencillo y microhabilidades por tema — 2026-09-09
- Retirados Numa del refugio/ejercicios, controles manuales de cuidado, bienvenida, cifras de cuidado y racha inferior. Se mantienen arte, paleta, nombres e historias; cabecera con huella, fuego y Admin.
- Animación por capas del mismo recurso de gatos: cabeza, cuerpo, patitas y recorridos con ritmos por personalidad. Movimiento reducido del sistema respetado.
- Veinte fórmulas de gases, calor, Arquímedes, presión/densidad y matemáticas. Solo despeje simbólico y constantes enteras simples. Tema de clase persistido en los cuatro niveles de la habilidad.
- Diez preguntas empiezan en nivel visible 0 y aumentan hasta 3; los repasos conservan su nivel y los bancos propios usan niveles que realmente contienen. Internamente se mantienen niveles 1–4 por compatibilidad con el historial.
- Cuidados automáticos una vez al día (comida/caja para Milo); rescate solo en múltiplos de cinco días consecutivos. Ningún gato existente se retira. Energía derivada de días sin cuidados, acotada y recuperable al terminar; sin escenas de sufrimiento.
- SQL con rollback confirmó recompensa única, rescate en día cinco, ausencia de rescate tras perder un día e idempotencia. Migración aplicada y registrada.
- Admin muestra racha actual, récord y tiempo de práctica; semana, comparación entre días de la misma habilidad a niveles comparables, pistas y ejemplos de errores. Sin funciones exploradas.
- Laboratorio permite indicar tema, pedir tres microhabilidades a DeepSeek, preparar una y guardar tema en la habilidad. Sugerencias reales verificadas y contextos solicitados guardados para Despejar ecuaciones. Informe IA movido al final y abreviado.
- Typecheck, lint, 65 pruebas y build pasan. Chrome en escritorio y 390 × 844: refugio simplificado, historia de Milo, tres pestañas de Admin, progreso semanal y laboratorio comprobados. Análisis real breve de despejes guardado.
- Publicación verificada en https://animals-dani.vercel.app: HTTP 200, refugio sin tutor ni controles manuales, cuidado diario y reto completado persistidos. Admin autenticado muestra las tres pestañas, resumen reducido, tema guardado y análisis breve. No se midieron FPS ni Lighthouse; no se afirma rendimiento de 60 fps.

## Gatos vivos, práctica libre y tres oportunidades — 2026-09-09
- Conservado el patio y el recurso original de gatos, ahora sin filtros fantásticos. Cabeza, cola, patitas y párpados articulados; actividades variables, pelota, acicalado, estiramiento, saludos entre vecinos y descanso. Pausa fuera de vista, durante ejercicios y con movimiento reducido.
- «Hola, Laura» en blanco dentro del patio, frases breves, carga con huellas y colección familiar con filas legibles.
- Reto diario: siete de diez primeras respuestas válidas correctas, tres oportunidades. Guardado de cola y pasos para recuperar una oportunidad abierta sin gastarla otra vez. Las pistas siguen disponibles.
- Práctica libre: habilidad y nivel elegibles, diez ejercicios reales y guardado de intentos; sin modificar racha ni cuidados.
- Recompensas persistentes rotativas: camita, comida, caja y galleta. Al volver al patio tras ganar, aparece el objeto y un gato se dirige a él. Rescates cada cinco días consecutivos; todo lo ganado antes se conserva.
- Migración aplicada y registrada. SQL real con rollback: umbral 6/10 no pasa y 7/10 sí; correcciones no inflan primera respuesta; tres oportunidades; recuperación; práctica libre sin recompensa; idempotencia; rescate día cinco. Pruebas SQL anteriores de cuidados, atomicidad y RLS también pasan.
- Chrome móvil completó una práctica real: 9/10 al primer intento, diez pasos guardados, un ejercicio reinyectado, recompensa nula. Pista y respuesta con coma verificadas. Capturas móvil/escritorio revisadas en dos rondas acotadas.
- Typecheck, lint, 70 pruebas y build pasan. Detector de diseño: avisos sobre sombras interiores de caja/plato (geometría del objeto, no paneles) y nuevos tonos/tamaños; no se cambiaron esos objetos por advertencias genéricas. Sin medición de FPS.
- Publicado en https://animals-dani.vercel.app, código `bc93693`, despliegue `dpl_9hLEqwX864Mmh1sT9FmpqG1GU9tU`. HTTP 200; saludo, pelota y práctica libre presentes. Chrome abrió Despejar ecuaciones, nivel visible 3, con fórmula de Arquímedes después de un reto diario ya logrado. Preferencia temporal de viewport restablecida.

## Patio cuidado, bienvenida y preguntas variadas — 2026-09-09
- Cabecera «Refugio de Laura», nombres de gatos sin placa blanca, nueva pelota de tela, rascador y cesta. Objetos de cuidado conservan el desbloqueo real; se mantiene el arte del patio y de los gatos.
- Invitación diaria accesible con misión ligada a la próxima recompensa, cierre y reapertura. Si el reto está logrado, reconoce el cuidado real sin pedir completarlo de nuevo.
- Calculadora opcional con teclado propio, operaciones, paréntesis y coma decimal. No completa la respuesta por la estudiante. Apertura/uso registrados con la telemetría existente.
- Escala métrica contextual y preguntas A/B/C deterministas intercaladas con respuestas abiertas. Distractores derivados de errores diagnosticables; bancos propios conservados. Respuestas antiguas al recuperar una sesión siguen editables.
- Typecheck, lint, 74 pruebas y build pasan. Las nuevas pruebas recorren 100 semillas por familia/nivel para opciones inequívocas y diagnóstico, además del parser de calculadora y escalas.
- Chrome real en móvil 390 × 844 y escritorio: patio, bienvenida, calculadora 90÷100=0,9, opciones, pista y transición al tercer ejercicio abierto verificados. Supabase confirmó respuesta 9 a 90 cm→m como CORRIMIENTO_DECIMAL y corrección 0.9 con pista. No se alteró la racha ni se fabricaron recompensas para la revisión.
- Dos rondas visuales acotadas. Aviso de dependencias durante Fast Refresh resuelto con carga limpia; no persiste. Detector visual: 26 observaciones informativas, ninguna advertencia. No se midieron FPS/Lighthouse. El registro visual interno anterior puede sincronizarse en un trabajo separado.
- Ilustraciones generadas con la herramienta integrada; procedencia y prompts en public/art/refuge-objects.json. El generador no entregó alfa real: filtro SVG de presentación elimina el fondo neutro; verificado visualmente en Chrome.
- Publicado en https://animals-dani.vercel.app, código `8c7f06e`, despliegue `dpl_GyQXggHDE9azxTRDNPcJ5oKDdMau`. HTTP 200 del refugio y del atlas. Chrome en producción comprobó bienvenida real, objetos, escala, opciones A/B/C y calculadora 78×100=7800; se dejó el patio abierto. Viewport temporal restablecido.

## Perímetros, áreas y conversiones visuales — 2026-09-09
- Implementadas tres microhabilidades generadas con cuatro niveles: perímetros, áreas e identificar qué medir; selector explícito y ejemplos visuales en el editor del tutor.
- Conversiones variadas por sesión: longitud, masa, capacidad, presión, área, volumen cúbico y densidad. Cada práctica de nivel fijo tiene al menos seis pares de unidades distintos en diez ejercicios; distintas representaciones del mismo dato.
- Figuras proporcionales, mosaicos triangulares, figuras en L, instrumentos, escalera métrica y vista escrita. Corrección y diagnóstico reutilizan el motor real.
- 89 pruebas pasan, incluyendo 100 semillas por nueva familia/nivel, áreas por fórmula de polígonos y perímetros por distancias independientes, rotación de unidades y compatibilidad de sesiones previas. Primera compilación, tipos y lint pasan.
- QA móvil detectó claves React duplicadas entre diagrama y calculadora; corregidas con identidades separadas. Figura y escalera verificadas en Chrome; ajustado texto largo para reducir altura.
- Completadas la comprobación final, publicación, alta persistente de habilidades y revisión de geometría en producción.
- Primera publicación `9ea9721`, despliegue `dpl_4uugrn3tv1SHHYJ1HWDsVHfyoJm1`, HTTP 200. Tres habilidades activas, cada una con cuatro niveles, creadas mediante el RPC del tutor y leídas de vuelta. No se necesitó migración de esquema.
- Producción: figura en L 8×4 menos 2×2; respuesta 24 guardada como CONFUNDE_AREA_PERIMETRO, pista de restar hueco, corrección 28 guardada con hint_level 1. Reducida pregunta visible; el enunciado completo sigue en historial y descripción escrita.
- Admin autenticado: nuevas habilidades y ejemplos de sus cuatro niveles visibles; guardado de perímetros conserva family=perimeter en los cuatro niveles. Identificación de presión aceptada y persistida con given_answer=presion. Panel muestra CONFUNDE_AREA_PERIMETRO y la pista del intento real.
- QA final móvil: figura de triángulo proporcional, pregunta breve y vista «En palabras» con base/altura correctas. Viewport restablecido. Refinadas firmas: confusión área/perímetro usa la magnitud real de cada figura (verificada independientemente), y conversión parcial de densidad solo se atribuye cuando cambia también el denominador.
- Tipos, lint, 89 pruebas y build finales pasan. Sin cambios al refugio ni recompensas; no se midieron FPS en esta entrega.

- Publicación final: código `f9a702e`, despliegue `dpl_ApG18fqhKHLeEZ8JxbeoW7EAgWfc`, https://animals-dani.vercel.app responde HTTP 200. Tres microhabilidades disponibles en práctica libre y Admin; seis familias generadas activas en total.

## Reparación de creación del administrador — 2026-09-09
- Unificada la validación de preguntas manuales e IA. Respuestas conceptuales tienen formatos Texto corto y Opciones, sin interpretarse como productos de letras. Se conservan opciones al guardar; números JSON válidos se normalizan.
- Creación manual con pistas opcionales y errores de formato accionables. Tres entradas claras: IA, escribir e importar. Borradores nuevos desactivados por defecto.
- IA por lotes de hasta tres preguntas, revisión independiente, reparación de formato y mensajes de conexión comprensibles. Se preserva el borrador ante errores; registro de fallo con etapa.
- Los fallos históricos tenían error genérico y no permiten atribuir una causa exacta. Reproducción actual encontró conceptos generados como expresiones matemáticas; corregido y cubierto por regresión.
- Chrome con servidor local de producción y Supabase real: generación de seis preguntas conceptuales con opciones y guardado exitoso; creación manual de texto sin descripción ni pistas y guardado exitoso. Dos bancos desactivados para revisión del profesor.
- Typecheck, lint, 98 pruebas y build pasan. Pendiente: publicar y revisar producción.
- Publicado: código dcb444b, despliegue dpl_3Q6hiygomc1gGeWU5TUbtLJdQ7xQ, HTTP 200. Chrome en producción generó tres despejes, guardó el banco desactivado y editó su primer enunciado. Lectura independiente de Supabase confirmó tres preguntas y el texto editado; recarga conserva los bancos en el selector.
- Los dos bancos locales y el banco creado en producción permanecen como borradores útiles para revisión. No se modificó el contenido anterior del profesor. Inspección visual de escritorio realizada; no se afirma medición móvil ni rendimiento en esta corrección.

## Secciones independientes y convivencia del patio — 2026-09-09
- Mis gatos muestra únicamente retratos e historias. Mis habilidades presenta nombre, icono del tema, nivel y progreso. Reto y práctica libre permanecen exclusivamente en Mi refugio; los paneles ocultos no conservan su distribución ni acciones accesibles.
- Navegación de gatos con huellas proporcionales al tamaño real, rutas alrededor de muebles y otros gatos, reservas de destinos y espera cuando se cruza otro residente. Los objetos tienen puntos de acercamiento; no se activa la interacción desde un destino inaccesible.
- Pelota con movimiento contenido y un solo gato por turno. Comida y cajas disponibles también forman parte de sus actividades. Profundidad compartida por posición; se conserva el arte original.
- Admin: las cuatro generaciones más recientes constan completadas sin error tras la reparación anterior; sin nuevos fallos registrados.
- 101 pruebas, tipos y lint pasan; primera compilación pasa. Chrome comprobó aislamiento de las tres secciones y distribución de escritorio. El ajuste de viewport del navegador no se aplicó (1225 px medidos), por lo que no se afirma QA visual móvil. Navegación sí se prueba con dimensiones proporcionales de móvil y escritorio. Detector: avisos informativos de tonos/tamaños heredados, sin rediseñarlos.
- El viewport se aplicó con retraso: comprobados 390 px sin desbordamiento y secciones aisladas también en móvil. Se detectó proximidad de etiqueta a pelota; se amplió la huella para reservar 22 px bajo el gato y se separó la pelota de la cesta. Verificación final: 101 pruebas, tipos, lint y build pasan.
- Publicación final: 0f32e99, despliegue dpl_14kyLBFaUmnEEjfF8FDKwq7LvULR. HTTP 200. Chrome en producción a 390 px confirmó patio con pelota separada, Mis gatos sin acciones de práctica y Mis habilidades con iconos temáticos y sin reto. Se solicitó restablecer el viewport temporal. No se midieron FPS.

## Bancos mixtos y rescates por días logrados — 2026-09-10
- Selección múltiple de tipos para IA; formatos abierto, opciones, verdadero/falso y parejas. Imágenes adjuntables desde PDF. Editor, importación, validación, preview y práctica conservan los formatos; las nuevas sesiones v3 mezclan el banco por nivel sin cambiar sesiones antiguas v2.
- Prueba real IA: primera generación no respetó formatos; corregida prioridad de instrucciones, segunda generó seis preguntas de los cuatro tipos y se guardó el banco desactivado. Preview de parejas respondió correctamente a las tres asociaciones.
- Drive privado implementado con autenticación de tutor, carpeta permitida, límites de tamaño y lectura. Falta configurar credenciales Google y carpeta; no conectado ni probado contra Drive real. PDF completo extrae texto con límites explícitos; importación automática de imágenes/OCR y sincronización desatendida no implementadas.
- Migración de rescates aplicada y registrada mediante editor SQL con acceso ChatGPT existente (MCP sin permisos para este proyecto). Nueve gatos con hitos 1,3,4,5,6,7,8,9,10. Test SQL real de los diez días, racha rota e idempotencia pasó y se revirtió; sin modificar progreso real.
- 111 tests unitarios pasan, tipos y lint pasan. Pendiente compilación final y publicación. Prueba de carga PDF con Chrome bloqueada por permiso de acceso a archivos de la extensión; no se afirma verificación de esa carga.
- Verificación final local: tipos, lint, 111 tests y build pasan. Detector visual: solo avisos informativos de colores/tamaños del admin existente. Pendiente confirmación de producción.

- Publicado: código `580d53e`, despliegue `dpl_4dUt5qpijBhcNRw2PJHNsy7AWpzK`, https://animals-dani.vercel.app responde HTTP 200. Chrome en producción confirmó solo Milo en Mis gatos y el selector de cuatro formatos más imagen en Laboratorio IA; banco mixto persistido visible en el selector del tutor. Viewport temporal restablecido.
- Extracción independiente de un PDF de dos páginas con pdfjs verificada: texto de ambas páginas y cierre del documento correctos. La carga mediante selector del navegador sigue sin verificar por permiso de la extensión. Drive pendiente de credenciales/carpeta, con instrucciones en DRIVE_SETUP.md; sin OCR ni sincronización desatendida.
