import {questionKinds,type QuestionKind} from '@/lib/engine/question-kinds';
export function QuestionKinds({value,onChange,image=false,onImage}:{value:QuestionKind[];onChange:(value:QuestionKind[])=>void;image?:boolean;onImage?:()=>void}){
 return <fieldset className="question-kinds"><legend>Tipos de pregunta <small>Puedes elegir varios</small></legend><div>{questionKinds.map(([id,label])=><label key={id}><input type="checkbox" checked={value.includes(id)} onChange={e=>onChange(e.target.checked?[...value,id]:value.filter(v=>v!==id))}/>{label}</label>)}{onImage&&<label><input type="checkbox" checked={image} onChange={onImage}/>Con imagen</label>}</div></fieldset>;
}
