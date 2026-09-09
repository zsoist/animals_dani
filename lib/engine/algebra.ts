// Exact rational expressions over single-letter variables; no evaluation of code.
type Polynomial = Map<string, number>;
type Rational = { n: Polynomial; d: Polynomial };
const constant = (n: number): Polynomial => new Map(n ? [['', n]] : []);
function add(a: Polynomial, b: Polynomial, sign = 1): Polynomial {
 const out = new Map(a);
 for (const [k,v] of b) { const n=(out.get(k)??0)+sign*v; if(!Number.isSafeInteger(n))throw new Error('Expresión demasiado grande'); if(n)out.set(k,n);else out.delete(k); }
 if(out.size>128)throw new Error('Expresión demasiado grande');return out;
}
function multiply(a: Polynomial,b: Polynomial): Polynomial {
 let out:Polynomial=new Map();
 for(const [ak,av] of a)for(const [bk,bv] of b)out=add(out,new Map([[[...ak,...bk].sort().join(''),av*bv]]));
 return out;
}
export function parseExpression(raw:string):Rational {
 const text=raw.replace(/\s/g,'').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
 if(!text || text.length>100 || /[^A-Za-z0-9+*/()\-]/.test(text))throw new Error('Usa letras, operaciones y paréntesis');
 const tokens=text.match(/[A-Za-z]|\d+|[+*/()\-]/g)??[];let index=0;
 const one=()=>constant(1);
 const atom=():Rational=>{const token=tokens[index++];if(token==='+' )return atom();if(token==='-'){const v=atom();return {n:multiply(constant(-1),v.n),d:v.d};}if(token==='('){const v=sum();if(tokens[index++]!==')')throw new Error('Cierra el paréntesis');return v;}if(token&&/^\d+$/.test(token)){const n=Number(token);if(n>1000)throw new Error('Usa números pequeños');return {n:constant(n),d:one()};}if(token&&/^[A-Za-z]$/.test(token))return {n:new Map([[token,1]]),d:one()};throw new Error('Completa la expresión');};
 const product=():Rational=>{let v=atom();while(index<tokens.length){const t=tokens[index];const implicit=/^[A-Za-z0-9(]/.test(t);if(t!=='*'&&t!=='/'&&!implicit)break;if(!implicit)index++;const b=atom();if(t==='/'){if(!b.n.size)throw new Error('No se puede dividir entre cero');v={n:multiply(v.n,b.d),d:multiply(v.d,b.n)};}else v={n:multiply(v.n,b.n),d:multiply(v.d,b.d)};}return v;};
 const sum=():Rational=>{let v=product();while(tokens[index]==='+'||tokens[index]==='-'){const sign=tokens[index++]==='+'?1:-1;const b=product();v={n:add(multiply(v.n,b.d),multiply(b.n,v.d),sign),d:multiply(v.d,b.d)};}return v;};
 const result=sum();if(index!==tokens.length)throw new Error('Revisa los paréntesis');return result;
}
export function equivalentExpressions(a:string,b:string):boolean {
 const x=parseExpression(a),y=parseExpression(b);return add(multiply(x.n,y.d),multiply(y.n,x.d),-1).size===0;
}
export function expressionSymbols(text:string):string[]{return [...new Set(text.match(/[A-Za-z]/g)??[])];}
