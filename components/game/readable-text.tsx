import { Fragment } from "react";
/** Render a small, safe subset of model formatting as React text. */
export function ReadableText({text}:{text:string}) {
 return <div className="readable-text">{text.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph.split(/(\*\*[^*]+\*\*)/g).map((part,j)=>part.startsWith('**')&&part.endsWith('**')?<strong key={j}>{part.slice(2,-2)}</strong>:<Fragment key={j}>{part}</Fragment>)}</p>)}</div>;
}
