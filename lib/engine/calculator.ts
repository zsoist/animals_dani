export function calculate(raw:string):string {
 const text=raw.replaceAll(',','.').replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-').replace(/\s/g,'');
 if(!text || text.length>80 || /[^\d.+*/()\-]/.test(text))throw new Error('Escribe una operación con números.');
 const tokens=text.match(/\d+(?:\.\d*)?|\.\d+|[+*/()\-]/g)??[];
 if(tokens.join('')!==text)throw new Error('Revisa los números de la operación.');
 let i=0;
 const atom=():number=>{const t=tokens[i++];if(t==='-')return -atom();if(t==='+')return atom();if(t==='('){const v=sum();if(tokens[i++]!==')')throw new Error('Falta cerrar un paréntesis.');return v;}if(!t||!/^\d|^\.\d/.test(t))throw new Error('Completa la operación.');return Number(t);};
 const product=():number=>{let value=atom();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],n=atom();if(op==='/'&&n===0)throw new Error('No se puede dividir entre cero.');value=op==='*'?value*n:value/n;}return value;};
 const sum=():number=>{let value=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],n=product();value=op==='+'?value+n:value-n;}return value;};
 const value=sum();if(i!==tokens.length)throw new Error('Separa los números con una operación.');
 if(!Number.isFinite(value)||Math.abs(value)>1e12)throw new Error('Prueba con una operación más pequeña.');
 return String(Number(value.toPrecision(12)));
}
