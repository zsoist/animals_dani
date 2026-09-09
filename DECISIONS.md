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
