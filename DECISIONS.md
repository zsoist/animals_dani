# Decisiones

- La nueva cuenta gratuita de Supabase aún no está conectada. Los proyectos Trophe y Trophe-QA pertenecen a otro producto y no se reutilizan. No se crea un proyecto con coste ni se alteran sus datos.
- Se respeta el orden de fases: no se declara terminada la Fase 1 sin autenticación y RLS verificadas contra el proyecto real.
- El refugio usa geometría procedural y una escena 2D vectorial equivalente cuando WebGL no está disponible.
- Los roles se leen de profiles; la estudiante no puede modificar su perfil ni asignarse el rol tutor.
- Los usuarios se crean con la API administrativa de Auth durante la instalación, con contraseñas aleatorias; las credenciales no se incluyen en Git.
- Se conservan tres familias de generadores. El CRUD posterior solo podrá crear habilidades hasta el máximo de tres activas y deberá elegir una familia compatible.
- Complejidad y seguridad ligeras por instrucción posterior del usuario: sin servicios extra, auditorías extensas ni flujos de aprobación añadidos. Solo autenticación, separación de roles, RLS y secretos del servidor.
- TypeScript 6 y ESLint 9 se fijan por compatibilidad declarada con eslint-config-next; TypeScript 7 y ESLint 10 aún generan conflictos de pares en las dependencias actuales.
- La última instrucción sustituye el login de estudiante: la ruta / abre el único refugio compartido de Laura, sin credenciales visibles. Admin es el único acceso con usuario y contraseña. El servidor utiliza las credenciales privadas de Laura para las operaciones de estudiante, sometidas a RLS. Quien tenga la URL puede usar este refugio; no se implementan cuentas adicionales ni aislamiento entre visitantes.
