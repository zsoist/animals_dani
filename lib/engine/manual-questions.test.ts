import {describe,it,expect} from 'vitest';
import {validateQuestions} from './import-questions';
import {evaluate} from './exercises';
const question={prompt:'¿Cuál es la unidad de presión?',answer:'B',answerFormat:'choice',level:1,hints:['','',''],choices:[{value:'A',label:'Metro'},{value:'B',label:'Pascal'},{value:'C',label:'Litro'},{value:'D',label:'Kilogramo'}]};
describe('Manual questions',()=>{
 it('keeps A–D identifiers when option text changes and evaluates the selected answer',()=>{const [saved]=validateQuestions([question],true);expect(saved.answer).toBe('B');expect(evaluate({...saved,skillId:'manual',seed:'s',errorSignatures:[]},'B')).toMatchObject({valid:true,correct:true});});
 it('rejects duplicate visible options even when identifiers differ',()=>{expect(()=>validateQuestions([{...question,choices:question.choices.map(c=>({...c,label:'Pascal'}))}],true)).toThrow('diferentes');});
 it('preserves manually selected false',()=>{expect(validateQuestions([{...question,prompt:'Un litro mide presión.',answerFormat:'boolean',answer:'falso'}],true)[0]).toMatchObject({answer:'falso',choices:[{value:'verdadero',label:'Verdadero'},{value:'falso',label:'Falso'}]});});
});
