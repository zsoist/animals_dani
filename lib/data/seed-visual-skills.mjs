import {createClient} from '@supabase/supabase-js';
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false}});
const {error:authError}=await db.auth.signInWithPassword({email:process.env.TUTOR_EMAIL,password:process.env.TUTOR_PASSWORD});
if(authError)throw new Error('No se pudo autenticar al tutor para añadir las microhabilidades.');
const definitions=[
 {id:'30000000-0000-4000-8000-000000000001',family:'perimeter',name:'Calcular perímetros',description:'Recorrer y sumar el contorno de cuadrados, rectángulos, triángulos y figuras en L; distinguir borde de superficie.'},
 {id:'30000000-0000-4000-8000-000000000002',family:'area',name:'Calcular áreas',description:'Medir superficies con rectángulos, triángulos, mosaicos y figuras compuestas; sumar piezas o restar huecos.'},
 {id:'30000000-0000-4000-8000-000000000003',family:'measurement',name:'Identificar qué medir',description:'Reconocer si un problema pide perímetro, área, volumen, masa, presión o densidad antes de calcular.'},
];
for(const skill of definitions){
 const existing=await db.from('skills').select('id').eq('id',skill.id).maybeSingle();
 if(existing.error)throw existing.error;
 if(existing.data){console.log(`${skill.name}: ya existe; se conservan los ajustes del tutor.`);continue;}
 const levels=[1,2,3,4].map(level=>({level,description:JSON.stringify({kind:'generated',family:skill.family,practiceDays:[],fixedLevel:false,classTopic:skill.description})}));
 const {error}=await db.rpc('save_skill_atomic',{p_id:skill.id,p_values:{name:skill.name,description:skill.description,subject:'matematicas',active:true,priority:1,base_difficulty:1,is_test:false},p_levels:levels});
 if(error)throw error;
 console.log(`${skill.name}: guardada y activa.`);
}
const {data,error}=await db.from('skills').select('name,active,skill_levels(level,description)').in('id',definitions.map(s=>s.id));
if(error)throw error;
for(const row of data){if(row.skill_levels.length!==4)throw new Error('Faltan niveles');console.log(`${row.name}: cuatro niveles persistidos; familia ${JSON.parse(row.skill_levels[0].description).family}.`);}
