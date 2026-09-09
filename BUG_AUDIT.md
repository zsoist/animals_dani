# Auditoría de fiabilidad y seguimiento — 2026-09-09

Hallazgos de código reproducibles antes de corregir:

1. `saveAttempt` inserta intento, luego actualiza dominio y luego recompensa mediante tres peticiones independientes. Un fallo entre ellas deja datos parciales; reintentar genera otro UUID y duplica el intento. Corrección implementada: identificador estable del envío, transacción y control de concurrencia.
2. `finishSession` guarda sesión, gato y racha por separado. Dos cierres concurrentes pueden escoger el mismo gato y dejar un cierre parcial. Corrección implementada: transacción y bloqueo por estudiante.
3. `saveSkill` no acepta `expression` aunque el editor y el motor sí. Además guarda habilidad y niveles por separado. Corrección implementada: aceptar formato, prueba de regresión y guardado atómico.
4. `studentClient` inicia sesión con contraseña por cada petición. La caché de React solo agrupa dentro de un render; seguimiento frecuente amplificaría las llamadas Auth. Corrección implementada: sesión solo servidor reutilizada con renovación y exclusión de solicitudes concurrentes.
5. La conversación IA y su memoria se guardan por separado; un error después de guardar mensajes devuelve fallo y un reintento usa nuevo requestId. Corrección implementada: guardado atómico y recuperación por requestId estable.
6. No existe evidencia del uso de ayudas no enviadas, edición, salida de misión, controles del refugio, archivos o funciones del profe. Añadir eventos propios acotados, reintentos y deduplicación, separados de hechos académicos.

No se recopilan contraseñas, teclas individuales, texto libre adicional, contenido PDF, pantallas, IP, navegación fuera de la app ni huellas del dispositivo. Conversaciones y respuestas académicas conservan su almacenamiento explícito existente. El refugio es compartido: sus eventos no prueban identidad individual.

Verificado: 63 pruebas unitarias; reintento real de eventos con un solo registro y eliminación de propiedades privadas; respuesta simbólica con pista guardada desde Chrome; pruebas SQL con rollback para intento, recompensa, cierre, habilidad y conversación. La memoria editada manualmente sobrevive a una respuesta IA en curso. DeepSeek real respondió y un segundo envío con el mismo identificador recuperó exactamente la misma respuesta, sin mensajes duplicados.

Además: un único reintento ante JSON inválido de DeepSeek dentro de un presupuesto compartido de 55 segundos. El chat general ya no incorpora ejercicios contextuales antiguos como si siguieran abiertos. No se garantiza disponibilidad del proveedor ni ausencia absoluta de errores.
