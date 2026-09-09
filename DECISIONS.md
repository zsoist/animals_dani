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
