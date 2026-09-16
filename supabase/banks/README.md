# Bancos reales de Daniela — importados el 16 de septiembre de 2026

Carpeta: https://drive.google.com/drive/folders/1fnDq4-7P8mGTFv_QbiVPc4yGhB6W_3UG

| Archivo original | Drive ID | Preguntas | Niveles del PDF |
| --- | --- | --- | --- |
| conversion_de_unidades.pdf | 1OkX8N6jpHsBLm7wjtT3LFgYheXlnNI_s | 50 | 1–4 |
| despeje_de_ecuaciones.pdf | 1ZRywRA0IX0Mdq17SEh6RhjrkMHzu4JtA | 50 | 1–4 |

Los JSON contienen el banco de producción revisado contra las preguntas y el solucionario de cada PDF. Se restauraron subíndices y potencias que la extracción de texto separaba; `sourceNumber` conserva la numeración original. Las pistas fueron añadidas para acompañar el razonamiento. No se inventaron preguntas para rellenar niveles.

Cada banco contiene 13, 13, 12 y 12 preguntas por nivel. Refugio muestra esos niveles como 0–3. El reto selecciona 3, 3, 2 y 2 preguntas respectivamente, sin repetir, de una sola microhabilidad. Las opciones se mezclan en nuevas sesiones v4 conservando los identificadores y la respuesta correcta; sesiones v2/v3 existentes mantienen su comportamiento.

Conversiones: tamaño de unidades; longitud, capacidad y presión; áreas y volúmenes; densidad y fuerza por volumen. Despeje: suma/resta; multiplicación/división; fórmulas de física; transformaciones encadenadas. Los formatos reales son respuesta numérica, selección múltiple y verdadero/falso. Estos PDF no contienen ejercicios con imágenes ni parejas.

Para volver a aplicar una versión revisada: primero ejecutar `pnpm test`, luego `node --env-file=.env.local scripts/import-reviewed-banks.mjs`. Requiere credenciales de tutor; usa RLS y la publicación atómica existente. No sobrescribe un banco con una sesión pendiente hoy. No ejecutar para sincronizar automáticamente: es una instantánea revisada, no el conector OAuth.

Google OAuth sigue pendiente de configurar. Las preguntas importadas ya se sirven desde Supabase y no dependen de esa conexión. No se inventó una fecha de modificación de Drive: `drive_modified_time` queda nulo para esta importación manual.
