# Decisiones vigentes

- La petición del 9 de septiembre sustituye la escena 3D por una habitación 2D original, inspirada en las proporciones de la referencia: turquesa, coral, amarillo y lavanda. SVG y CSS permiten gatos animados sin WebGL ni imágenes remotas.
- Laura entra directamente en el único refugio compartido. Admin pide usuario y contraseña, valida su rol en el servidor y conserva RLS. Quien tenga la URL puede practicar en el refugio de Laura; esto es intencional.
- Supabase sigue siendo el proyecto autorizado `pwcvskguqyhbhlwnsmmy`. No se crean servicios ni cuentas adicionales y las claves permanecen fuera de Git.
- El tutor puede añadir habilidades con preguntas, respuesta, nivel y tres pistas propios. Se guardan como contenido estructurado en `skill_levels.description`, reutilizando esquema y permisos existentes. El motor puro recibe los datos ya decodificados.
- Se mantienen las tres familias de ejercicios generados y se permiten nuevas habilidades de contenido escrito por el tutor. Una habilidad nueva no inventa ejercicios: necesita al menos una pregunta válida. Si faltan preguntas de un nivel, reutiliza las disponibles; el editor permite ampliar el banco.
- Respuestas numéricas con coma, punto y fracciones equivalentes; coeficientes con varias comas. Una entrada inválida no se registra como error académico. El teclado permite borrar, limpiar y editar en la posición seleccionada sin abrir el teclado móvil.
- La escena permanece visible durante la práctica. Se avanza con un botón después de cada respuesta, sin temporizadores que interrumpan la lectura. Comida, mantas, lámparas, gatos rescatados y racha se guardan en Supabase.
- El servidor reconstruye el ejercicio y comprueba la respuesta antes de persistirla. El cierre calcula el resultado desde intentos guardados y evita duplicar el rescate al repetir la finalización.
- Tipografía Nunito servida localmente. Sin trackers ni generación por LLM en ejecución.

## Revisión: centro de rescate, material propio y un tema diario
- La petición más reciente reemplaza la práctica lateral por una tarjeta centrada sobre el refugio a pantalla amplia. Los colores son intensos y las zonas representan cuidado animal.
- Se elige una única habilidad para las diez preguntas del día, con prioridad y calendario del tutor. El primer intento de ese día fija el tema mientras siga activo. No se aplica la antigua mezcla 4/3/2/1.
- Nivel mínimo 3 aplicado a las tres habilidades existentes a petición de mayor dificultad; el tutor puede ajustar el mínimo o fijarlo. Las preguntas propias se recorren sin repetir hasta agotar el banco.
- PDF.js se carga solo en Admin cuando se abre un PDF. Archivos de hasta 15 MB se procesan localmente; la página/recorte se guarda comprimida junto a la pregunta, no el PDF original. Se admiten imágenes JPG, PNG y WebP con visor ampliable.
- Las imágenes usan hasta 1.800 píxeles en el lado mayor y un límite aproximado de 330 KB por imagen, 3 MB por habilidad. Las preguntas se revisan antes de guardarse; el PDF no inventa soluciones.
- Generación opcional con OpenAI mediante prompt y texto del PDF. Clave del servidor o clave introducida para una sola petición; no se persiste. No había clave configurada y no se simuló una respuesta de IA.
- Jugar y limpiar guardan afecto y zonas limpias; comer y cambiar la iluminación tienen respuesta visual sin otorgar aciertos. Los cuidados no alteran el aprendizaje.

## Tutor DeepSeek (2026-09-09)
- Sustituimos la integración opcional OpenAI por DeepSeek v4 Flash real con clave solo servidor; el formulario nunca recibe credenciales.
- Memoria persistente, visible y editable, limitada a aprendizaje; no seguimiento ajeno a la práctica. Conversación y evidencia se envían a DeepSeek para responder.
- Un solo tema vigente al día también se comunica al tutor. La corrección académica permanece determinista y la ayuda IA cuenta como pista.
- RLS en las cuatro tablas nuevas, reservas de uso atómicas y cuotas para controlar gasto. Migración aplicada mediante el editor SQL autenticado de Supabase porque el conector no tenía permisos.
- El admin revisa los borradores generados: validamos formato y respuesta numérica, sin prometer que un modelo nunca comete errores matemáticos.

## Refinamiento Impeccable y laboratorio pedagógico
- Se conserva la dirección 2D fijada por el usuario; el cambio usa ilustración original de OpenAI optimizada y gatos con transparencia, sin nueva exploración conceptual ni promesa de modelo «2.5».
- Tres espacios del profe: comprender el progreso, preparar una práctica y administrar habilidades. La generación incorpora errores reales de la habilidad seleccionada y una estrategia explícita.
- La práctica generada se guarda desactivada por defecto; el profe prueba, edita y activa. Repetir Guardar actualiza la misma habilidad. Se conserva una copia local del borrador generado, sin prometer autoguardado de posteriores ediciones.
- Se pausa el reloj activo mientras Numa responde y se impide avanzar durante esa consulta para mantener la ayuda vinculada al ejercicio correcto.
- Las ecuaciones generadas de nivel 3 usan denominadores que permiten representar el enunciado exactamente con decimales cortos.
- Animaciones de transformaciones y opacidad, con reducción de movimiento persistente y preferencia del sistema. No se afirma rendimiento físico sin medirlo.

## Ajuste solicitado: fórmulas, gatos y comedor
- Despejar significa aislar una letra en una fórmula de octavo, no resolver aritmética mental. 16 fórmulas reales con significado de las variables, teclado simbólico y equivalencia algebraica exacta.
- No se usa IA para calificar expresiones. Parser acotado de expresiones racionales; firmas distinguen inversa, signos, orden y variable sin aislar.
- La comida se desbloquea por completar diez retos diarios; el servidor exige sesión completada de hoy. Los aciertos individuales dan cuidado sin comida. Se conservan los contadores históricos existentes.
- Gatos aproximadamente un tercio menores, colores fantásticos estables mediante filtros visuales, mismas identidades y ficha al tocarlos.

## Seguimiento y fiabilidad — 2026-09-09
- Eventos semánticos propios y propiedades permitidas, sin grabación de pantalla ni teclas. Identidad explícita de refugio compartido.
- Pruebas y vista previa del profe separadas del uso cotidiano; historial académico existente sigue siendo compartido.
- Ventana de 14 días, máximo 5.000 eventos y retención detallada de 90 días. La cola tiene límites explícitos y deduplicación.
- Transacciones SQL para intento/dominio/recompensa, cierre/racha/gato, habilidad/niveles y mensajes/memoria; identificadores estables al reintentar.
- Numa interpreta señales con prudencia, ofrece mensajes cálidos y útiles, preserva ediciones manuales y distingue historial de ejercicio vigente. Un reintento de formato IA comparte el límite de 55 segundos.

## Simplificación solicitada — 2026-09-09
- Se conserva el arte existente y se anima por capas; no se reemplazan los gatos ni la paleta.
- Se oculta la IA a Laura, conservando pistas deterministas y herramientas del profe.
- Nivel mostrado 0–3 equivale a nivel interno 1–4. La sesión crece en dificultad; un repaso puede volver al nivel que necesita apoyo.
- Comida en días impares de racha y caja en pares; un rescate nuevo solo en cada múltiplo de cinco días consecutivos. La racha no quita gatos ya rescatados. El cuidado se entrega por completar, no por acertar todo.
- Los días sin completar reducen suavemente energía hasta un mínimo de 55/100; completar recupera 100. Se calcula desde fechas persistidas, sin tareas programadas ni lenguaje culpabilizador.
- Tema por microhabilidad guardado dentro de su configuración existente; propuestas IA revisables, sin activar contenido automáticamente. Comparaciones basadas en días y niveles coincidentes, con tamaño de muestra visible.

## Reto con oportunidades y gatos vivos — 2026-09-09
- Umbral: siete de diez primeras respuestas válidas correctas; las pistas están permitidas. Corregir un error sirve para aprender, pero no convierte el primer intento en acierto. La reinyección conserva su propio enunciado y puntuación.
- Hasta tres retos diarios. Reabrir uno pendiente recupera preguntas, respuestas y pasos sin gastar otra oportunidad. La fecha del reto queda fija; un reto de ayer no entrega cuidados de hoy.
- Práctica libre ilimitada: diez preguntas de una habilidad y nivel elegido, guardadas en el historial, sin recompensas ni racha. Solo se ofrecen niveles presentes en bancos subidos.
- Recompensas rotan por días logrados: camita, comida, caja, galleta. Se conserva todo lo ganado anteriormente; rescates solo en múltiplos de cinco días.
- Misma ilustración de gatos, sin filtros rosa/verde: partes articuladas, parpadeo y gestos. Comportamiento variable en el patio, con destino a objetos y vecinos; no se usa IA en cada fotograma.

## Misión de llegada y formatos visuales — 2026-09-10
- Nombre elegido: Refugio de Laura. Nombres de gatos sin placa, con sombra de texto suave para leer sobre el patio. Pelota de tejido, rascador y cesta ilustrados; el cuidado ganado usa el mismo conjunto de objetos.
- Bienvenida con misión real de ese día; si ya está logrado, agradece el cuidado. Se muestra una vez por día y pestaña, puede cerrarse o volver a abrirse. Invitación cercana sin amenazas ni culpa.
- Dos ejercicios de reconocimiento A/B/C alternan con uno abierto. Los distractores proceden de errores precalculados; se guarda el valor elegido y se conserva la clasificación del servidor. Bancos personalizados conservan sus preguntas originales. Un intento antiguo con respuesta fuera de las opciones conserva la entrada abierta al retomarlo.
- Escala para longitud, masa, volumen y área: cada salto es ×10/÷10 o ×100/÷100 según corresponda. La densidad compuesta conserva su enunciado porque no es una sola escalera métrica.
- Calculadora opcional de cuatro operaciones, paréntesis y coma decimal, sin ejecución de código. No rellena automáticamente respuestas ni altera el nivel de pista. Apertura, uso y formato de pregunta registrados en eventos propios.
- El generador integrado entregó un atlas opaco tras dos intentos de transparencia. Se conserva el arte y se aplica una máscara cromática en el componente, en lugar de publicar un fondo cuadriculado. No se atribuye a un modelo nominal no expuesto por la herramienta.

## Microhabilidades y variedad visual — 2026-09-09
- Tres generadores separados: perímetros, áreas e identificación de magnitudes. El tutor elige la microhabilidad explícitamente; ya no se infiere siempre por la materia. Configuración guardada en los niveles existentes, sin nuevas tablas ni permisos.
- Conversiones rotan pares dentro de diez preguntas; niveles 0–3 incorporan masa, longitud, capacidad, volumen cúbico, presión, área y densidad. Se usan cantidades enteras sencillas y equivalencias explícitas para concentrarse en unidades; calculadora sigue disponible.
- atm↔Pa usa 101325; atm↔mmHg indica expresamente la aproximación escolar 760. Presión no usa escalera decimal entre atm, Pa y mmHg. Referencia: https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9 . g/kg son masa, no presión ni densidad por sí solas.
- Figura, escalera (cuando corresponde) y texto muestran los mismos datos, sin resolver automáticamente la pregunta. Figuras vectoriales proporcionales con medidas; mosaico de cuatro triángulos, no se presenta como tangram tradicional de siete piezas.
- Semillas v2 solo en sesiones nuevas; las conversiones de colas anteriores conservan el generador legado para que una sesión abierta no cambie de pregunta o respuesta al publicar.
- Identificar qué medir es selección de magnitud con respuestas semánticas persistidas y errores específicos, no letras A/B/C ni errores numéricos artificiales.

## Creación de preguntas del administrador
- Los conceptos se evalúan como texto normalizado u opciones explícitas, nunca como álgebra. El texto ignora mayúsculas, tildes y puntuación final; no pretende evaluar sinónimos mediante IA.
- Las pistas manuales son opcionales; si faltan, se ofrecen ayudas generales identificables, no un procedimiento inventado.
- Generación de hasta diez preguntas en lotes de tres con revisión y una reparación estructural. El profesor revisa y activa el borrador; generar no publica automáticamente.

## Patio y secciones
- Mantener la escena montada pero oculta y pausada al consultar gatos o habilidades. Las acciones de práctica solo están disponibles en Mi refugio.
- Aproximar colisiones con huellas rectangulares del arte, medidas en cada tamaño del patio. Planificar rutas al elegir actividad, no en cada fotograma; comprobar cruces durante el movimiento y ceder el paso.
- La pelota gira dentro de su espacio reservado en vez de desplazarse libremente bajo gatos y etiquetas.

## Formatos, banco privado y calendario de rescates — septiembre 2026
- Elegir múltiples formatos significa mezclar tipos de pregunta; opción múltiple sigue teniendo una sola respuesta correcta. Se añaden verdadero/falso y parejas (2–5), junto a abiertas y opciones. Las imágenes son un apoyo compatible con cada formato.
- Las parejas se mezclan al presentarse, con selección accesible por fila en lugar de arrastre obligatorio. Las respuestas incompletas no cuentan como error académico.
- Calendario interpretado como días de reto logrados acumulados: 1, 3, 4, 5, 6, 7, 8, 9 y 10, nueve gatos. No se pierden por romper la racha. El historial previo se conserva; solo se muestran los rescates cuyo día se haya alcanzado.
- Drive usa una cuenta de servicio de solo lectura y una carpeta compartida privadamente. No hay credenciales de Google disponibles; la integración se entrega sin activar. No se cambian permisos de archivos ni se hacen públicos. Importar y revisar precede a la práctica aleatoria; no se publican automáticamente PDF nuevos.
- PDF completo: máximo 30 páginas/14.000 caracteres para extracción de texto. Imágenes y escaneos se recortan y revisan manualmente; no se afirma OCR ni lectura visual por DeepSeek.

## Cuidados y adopciones — 2026-09-10
- Se conserva el arte del patio. Siete cuidados rotan por días logrados: camita, comida, caja, churu, juguete, estambre y vacuna del juego. Se elige al residente con menos cuidados, usando su personalidad para desempatar.
- La nueva petición especifica racha para los rescates: hitos consecutivos 1,3,4,5,6,7,8,9,10. Se conservan los gatos ya visibles; no se borran desbloqueos históricos ni adopciones al romper una racha.
- Adopción: reto diario con al menos ocho aciertos iniciales y tres preguntas de nivel interno >=3 (nivel visible 2/3) acertadas sin pistas; residente con tres cuidados, distinto del recién rescatado. Nunca se adopta al último residente. Práctica libre no da estos premios.
- Adopciones automáticas al cumplir la condición, con despedida y álbum permanente «Ya tienen hogar». Se reutilizan las ilustraciones del refugio para los objetos nuevos.
- Drive sigue pendiente de credenciales de Google: no se presenta como conectado. Los formatos mixtos ya publicados se conservan.
