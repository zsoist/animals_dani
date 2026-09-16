import { Fragment } from 'react';
/** Render plain text and explicit subscripts without accepting markup from a PDF. */
export function MathText({text}:{text:string}) {
 return <>{text.split(/(_(?:abs|atm|[a-zA-Z0-9]))/g).map((part,index)=>part.startsWith('_')?<sub key={index}>{part.slice(1)}</sub>:<Fragment key={index}>{part}</Fragment>)}</>;
}
export function QuestionContent({prompt}:{prompt:string}) {
 const paragraphs=prompt.split(/\n\s*\n/).filter(Boolean);
 return <div className="bank-question-content">{paragraphs.map((part,index)=><p className={index>0&&part.includes('=')?'bank-formula':'bank-statement'} key={index}><MathText text={part}/></p>)}</div>;
}
