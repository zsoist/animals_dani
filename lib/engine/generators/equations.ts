import type {Exercise,Level} from '../types';
import {random,integer} from '../random';
import {equivalentExpressions} from '../algebra';
type Formula={context:string;formula:string;target:string;answer:string;meaning:string;step:string;errors:[string,string][]};
export const formulaBank:Record<Level,Formula[]>={
1:[{"context": "Gases: ley de Boyle", "formula": "k = P*V", "target": "P", "answer": "k/V", "meaning": "k: producto constante · P: presión · V: volumen", "step": "Divide ambos lados entre V.", "errors": [["k*V", "OPERACION_INVERSA"], ["V/k", "FACTOR_INVERTIDO"]]},
{"context": "Termodinámica: energía interna", "formula": "U = Q-W", "target": "Q", "answer": "U+W", "meaning": "U: cambio de energía interna · Q: calor recibido · W: trabajo realizado", "step": "Suma W en ambos lados.", "errors": [["U-W", "SIGNO_AL_TRANSPONER"], ["W-U", "ORDEN_OPERACIONES"]]},
{"context": "Arquímedes: empuje", "formula": "E = p*g*V", "target": "E", "answer": "p*g*V", "meaning": "E: empuje · p: densidad del líquido · g: gravedad · V: volumen desplazado", "step": "E ya está sola: conserva el producto del otro lado.", "errors": [["p*g/V", "OPERACION_INVERSA"], ["p/(g*V)", "ORDEN_OPERACIONES"]]},
{"context": "Presión", "formula": "F = P*A", "target": "P", "answer": "F/A", "meaning": "F: fuerza · P: presión · A: área", "step": "Divide ambos lados entre A.", "errors": [["F*A", "OPERACION_INVERSA"], ["A/F", "FACTOR_INVERTIDO"]]},
{"context": "Matemáticas: relación lineal", "formula": "y = x+10", "target": "x", "answer": "y-10", "meaning": "x, y: cantidades relacionadas", "step": "Resta 10 en ambos lados.", "errors": [["y+10", "SIGNO_AL_TRANSPONER"], ["10-y", "ORDEN_OPERACIONES"]]},
],
2:[{"context": "Gases: ley de Boyle", "formula": "P = k/V", "target": "V", "answer": "k/P", "meaning": "P: presión · V: volumen · k: producto constante", "step": "Multiplica por V y divide entre P.", "errors": [["P/k", "FACTOR_INVERTIDO"], ["k*P", "OPERACION_INVERSA"]]},
{"context": "Termodinámica: calor", "formula": "Q = m*c*T", "target": "m", "answer": "Q/(c*T)", "meaning": "Q: calor · m: masa · c: calor específico · T: cambio de temperatura", "step": "Divide entre el producto c*T.", "errors": [["Q/c*T", "ORDEN_OPERACIONES"], ["Q*c*T", "OPERACION_INVERSA"]]},
{"context": "Arquímedes: empuje", "formula": "E = p*g*V", "target": "V", "answer": "E/(p*g)", "meaning": "E: empuje · p: densidad del líquido · g: gravedad · V: volumen desplazado", "step": "Divide entre el producto p*g.", "errors": [["E/p*g", "ORDEN_OPERACIONES"], ["E*p*g", "OPERACION_INVERSA"]]},
{"context": "Densidad", "formula": "D = m/V", "target": "V", "answer": "m/D", "meaning": "D: densidad · m: masa · V: volumen", "step": "Multiplica por V y divide entre D.", "errors": [["D/m", "FACTOR_INVERTIDO"], ["m*D", "OPERACION_INVERSA"]]},
{"context": "Matemáticas: producto", "formula": "y = 25*x", "target": "x", "answer": "y/25", "meaning": "x, y: cantidades relacionadas", "step": "Divide ambos lados entre 25.", "errors": [["y*25", "OPERACION_INVERSA"], ["25/y", "FACTOR_INVERTIDO"]]},
],
3:[{"context": "Gases ideales", "formula": "P*V = n*R*T", "target": "T", "answer": "P*V/(n*R)", "meaning": "P: presión · V: volumen · n: cantidad de gas · R: constante · T: temperatura absoluta", "step": "Divide ambos lados entre el producto n*R.", "errors": [["P*V/n*R", "ORDEN_OPERACIONES"], ["n*R/(P*V)", "FACTOR_INVERTIDO"]]},
{"context": "Termodinámica: calor", "formula": "Q = m*c*(T-t)", "target": "T", "answer": "Q/(m*c)+t", "meaning": "Q: calor · m: masa · c: calor específico · T: temperatura final · t: inicial", "step": "Divide entre m*c y suma t.", "errors": [["Q/(m*c)-t", "SIGNO_AL_TRANSPONER"], ["Q/m*c+t", "ORDEN_OPERACIONES"]]},
{"context": "Arquímedes: peso aparente", "formula": "A = W-E", "target": "E", "answer": "W-A", "meaning": "A: peso aparente · W: peso · E: empuje", "step": "Suma E en ambos lados y resta A.", "errors": [["A-W", "SIGNO_AL_TRANSPONER"], ["W+A", "SIGNO_AL_TRANSPONER"]]},
{"context": "Presión hidrostática", "formula": "P = p*g*h", "target": "h", "answer": "P/(p*g)", "meaning": "P: presión · p: densidad · g: gravedad · h: profundidad", "step": "Divide entre p*g.", "errors": [["P/p*g", "ORDEN_OPERACIONES"], ["P*p*g", "OPERACION_INVERSA"]]},
{"context": "Matemáticas: dos operaciones", "formula": "y = 10*x+25", "target": "x", "answer": "(y-25)/10", "meaning": "x, y: cantidades relacionadas", "step": "Resta 25 y divide toda la diferencia entre 10.", "errors": [["(y+25)/10", "SIGNO_AL_TRANSPONER"], ["y-25/10", "ORDEN_OPERACIONES"]]},
],
4:[{"context": "Gases ideales", "formula": "P*V = n*R*T", "target": "n", "answer": "P*V/(R*T)", "meaning": "P: presión · V: volumen · n: cantidad de gas · R: constante · T: temperatura absoluta", "step": "Divide ambos lados entre R*T.", "errors": [["P*V/R*T", "ORDEN_OPERACIONES"], ["R*T/(P*V)", "FACTOR_INVERTIDO"]]},
{"context": "Termodinámica: calor", "formula": "Q = m*c*(T-t)", "target": "c", "answer": "Q/(m*(T-t))", "meaning": "Q: calor · m: masa · c: calor específico · T: temperatura final · t: inicial", "step": "Divide entre todo el producto m*(T-t).", "errors": [["Q/m*(T-t)", "ORDEN_OPERACIONES"], ["Q/(m*(T+t))", "SIGNO_AL_TRANSPONER"]]},
{"context": "Arquímedes: peso aparente", "formula": "A = W-p*g*V", "target": "V", "answer": "(W-A)/(p*g)", "meaning": "A: peso aparente · W: peso · p: densidad del líquido · g: gravedad · V: volumen desplazado", "step": "Resta A de W y divide entre p*g.", "errors": [["(W+A)/(p*g)", "SIGNO_AL_TRANSPONER"], ["W-A/(p*g)", "ORDEN_OPERACIONES"]]},
{"context": "Presión total en un líquido", "formula": "P = a+p*g*h", "target": "h", "answer": "(P-a)/(p*g)", "meaning": "P: presión total · a: presión en superficie · p: densidad · g: gravedad · h: profundidad", "step": "Resta a y divide toda la diferencia entre p*g.", "errors": [["(P+a)/(p*g)", "SIGNO_AL_TRANSPONER"], ["P-a/(p*g)", "ORDEN_OPERACIONES"]]},
{"context": "Matemáticas: paréntesis", "formula": "y = 10*(x+25)", "target": "x", "answer": "y/10-25", "meaning": "x, y: cantidades relacionadas", "step": "Divide entre 10 y resta 25.", "errors": [["y/10+25", "SIGNO_AL_TRANSPONER"], ["(y-25)/10", "ORDEN_OPERACIONES"]]},
],
};
export function equations(skillId:string,level:Level,seed:string,topic=""):Exercise {
 const normalized=topic.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 const groups=[/gas/,/termo|calor|temperatura/,/arquim|empuje|flot/,/presion|densidad/,/matemat/].flatMap((pattern,i)=>pattern.test(normalized)?[i]:[]);
 const bank=groups.length?groups.map(i=>formulaBank[level][i]):formulaBank[level];
 const f=bank[integer(random(seed),0,bank.length-1)];
 const errors:Exercise['errorSignatures']=[];
 for(const [value,errorType] of f.errors)if(!equivalentExpressions(value,f.answer)&&!errors.some(e=>equivalentExpressions(e.value,value)))errors.push({value,errorType});
 return {skillId,level,seed,prompt:`${f.context}: ${f.formula}. Despeja ${f.target}.`,answer:f.answer,answerFormat:'expression',formula:f.formula,target:f.target,symbolMeaning:f.meaning,errorSignatures:errors,hints:[`Queremos dejar ${f.target} sola. Deshaz las operaciones en ambos lados de la igualdad.`,f.step,`${f.step} Resultado: ${f.target} = ${f.answer}. No necesitas sustituir números.`]};
}
