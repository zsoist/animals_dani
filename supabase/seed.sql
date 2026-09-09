insert into public.skills(id,name,subject,description) values
('10000000-0000-0000-0000-000000000001','Despejar ecuaciones','matematicas','Encontrar la incógnita usando operaciones inversas.'),
('10000000-0000-0000-0000-000000000002','Conversión de unidades','fisica','Relacionar medidas de longitud, masa, área y densidad.'),
('10000000-0000-0000-0000-000000000003','Balanceo químico','quimica','Conservar los átomos al completar una reacción.') on conflict(id) do nothing;
insert into public.skill_levels(skill_id,level,description)
select s.id,n,case s.subject when 'matematicas' then (array['Una suma o resta','Multiplicación y suma','Ecuaciones con fracciones','Despeje de fórmulas físicas'])[n] when 'fisica' then (array['Longitud','Masa y volumen','Área','Densidad'])[n] else (array['Reacciones simples','Grupos poliatómicos','Combustión','Completar y verificar'])[n] end
from public.skills s cross join generate_series(1,4) n on conflict do nothing;
insert into public.cats(id,name,personality,story,trait_tags,palette) values
('20000000-0000-0000-0000-000000000001','Milo','curioso','Llegó escondido en una caja de libros. Todavía revisa cada caja que encuentra.',array['cajas','explorador'],'{"body":"#c79765","belly":"#f4e4d0"}'),
('20000000-0000-0000-0000-000000000002','Luna','tímido','La encontramos bajo un banco después de la lluvia. Una manta tibia le da valor.',array['mantas','tranquila'],'{"body":"#8d9298","belly":"#e7e2dc"}'),
('20000000-0000-0000-0000-000000000003','Pipa','juguetón','Persiguió una hoja hasta la puerta del refugio. Ahora convierte las tardes en juegos.',array['hojas','activa'],'{"body":"#e0af82","belly":"#fff1db"}'),
('20000000-0000-0000-0000-000000000004','Nube','dormilón','Dormía junto a una panadería. Aquí encontró su rincón de sol favorito.',array['sol','siesta'],'{"body":"#ddd8cb","belly":"#fff7e9"}'),
('20000000-0000-0000-0000-000000000005','Bruno','gruñón','Cuidaba un jardín abandonado. Protesta bajito, pero siempre espera a sus amigos.',array['jardin','leal'],'{"body":"#756c66","belly":"#c4b8a6"}'),
('20000000-0000-0000-0000-000000000006','Miel','cariñoso','Se acercó buscando una mano amiga. Su ronroneo acompaña cada regreso a casa.',array['compañia','ronroneo'],'{"body":"#ceab6a","belly":"#f4e4d0"}') on conflict(id) do nothing;
