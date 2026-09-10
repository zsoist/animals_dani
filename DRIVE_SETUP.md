# Banco privado de Google Drive

La conexión está implementada, pero no está activada hasta configurar una cuenta de servicio de Google. No hace públicos los PDF ni usa el acceso del chat para entrar en la aplicación.

1. En Google Cloud, habilita Drive API y crea una cuenta de servicio con una clave JSON. No necesita roles del proyecto ni delegación del dominio.
2. Comparte únicamente la carpeta del banco con el correo de esa cuenta, como lector.
3. En Vercel configura `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` con el JSON privado y `GOOGLE_DRIVE_FOLDER_ID` con el identificador de esa carpeta; redespliega. Nunca uses variables `NEXT_PUBLIC_` para estas credenciales.
4. Admin → Subir PDF o imagen → Mi banco en Google Drive → Actualizar archivos. Abre un PDF, prepara el texto completo o recorta una pregunta con imagen, elige formatos, revisa y guarda.

Se listan hasta 500 PDF directamente dentro de la carpeta, de hasta 15 MB. No se recorren subcarpetas. El botón Actualizar consulta los cambios reales. La importación completa admite hasta 30 páginas y 14.000 caracteres; no hace OCR de escaneos ni extrae automáticamente las imágenes de cada pregunta. Para escaneos, se recorta la pregunta y se completa su respuesta. El formato con imagen conserva el recorte/página adjunto; la IA usa el texto extraído, no visión.

Las preguntas guardadas se mezclan de forma determinista en cada nueva sesión, conservando nivel y formato. Los borradores requieren revisión y activación del profesor. No hay sincronización desatendida ni publicación automática de nuevos PDF.

Referencias: [cuentas de servicio de Google](https://developers.google.com/identity/protocols/oauth2/service-account) y [búsqueda de archivos en Drive](https://developers.google.com/workspace/drive/api/guides/search-files).
