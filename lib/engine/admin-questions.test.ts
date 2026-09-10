import {expect,it} from 'vitest';
import {validateQuestions} from './import-questions';
import {evaluate} from './exercises';
const question={prompt:'¿Qué calor cambia la temperatura sin cambiar de estado?',answer:'Calor sensible',level:1,hints:['Mira la temperatura','No cambia de estado','Es calor sensible.']};
it('acepta respuestas conceptuales sin tratarlas como multiplicación de letras',()=>{const [q]=validateQuestions([{...question,answerFormat:'text'}]);expect(evaluate({...q,skillId:'s',seed:'s',errorSignatures:[]},' calor SÉNSIBLE ')).toMatchObject({valid:true,correct:true});});
it('normaliza números JSON de la IA sin rechazarlos por su tipo',()=>{expect(validateQuestions([{...question,answer:25,answerFormat:'number'}])[0].answer).toBe('25');});
it('conserva opciones de respuesta y no acepta opciones fuera del banco',()=>{const [q]=validateQuestions([{...question,answerFormat:'choice',choices:['Calor sensible','Calor latente','Trabajo']}]);expect(q.choices).toHaveLength(3);expect(evaluate({...q,skillId:'s',seed:'s',errorSignatures:[]},'Otra')).toMatchObject({valid:false});});
it('rechaza opciones repetidas y respuestas correctas ausentes',()=>{expect(()=>validateQuestions([{...question,answerFormat:'choice',choices:['Sí','Sí','No']}])).toThrow();});
