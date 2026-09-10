"use client";
import {MatchAnswer} from "@/components/game/match-answer";
import { useState } from "react";
import type { CustomQuestion } from "@/lib/engine/types";
import { evaluate } from "@/lib/engine/exercises";
import { ImageViewer } from "@/components/game/image-viewer";
export function QuestionPreview({ question }: { question: CustomQuestion }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState(0);
  const choices=question.answerFormat==="boolean"?[{value:"verdadero",label:"Verdadero"},{value:"falso",label:"Falso"}]:question.choices;
  return <div className="question-trial">
    <strong>Así lo verá Laura</strong>
    {question.image && <ImageViewer src={question.image} alt={question.imageAlt} />}
    <p className="trial-problem">{question.prompt || "Escribe el enunciado para probarlo."}</p>
    {question.answerFormat==="match"?<MatchAnswer exercise={{...question,seed:"preview"}} value={answer} onChange={setAnswer}/>:choices?.length?<fieldset className="answer-choices"><legend>Elige una respuesta</legend>{choices.map(c=><label key={c.value}><input type="radio" checked={answer===c.value} onChange={()=>setAnswer(c.value)}/>{c.label}</label>)}</fieldset>:<label>Prueba una respuesta<input value={answer} onChange={e => {setAnswer(e.target.value); setFeedback("");}} placeholder={question.answerFormat === "expression" ? "Por ejemplo F/a" : "Escribe tu respuesta"} /></label>}
    <div className="trial-actions"><button type="button" className="secondary" disabled={!answer.trim() || !question.answer} onClick={() => {
      const result = evaluate({...question,choices, skillId:"preview",seed:"preview",errorSignatures:[]}, answer);
      setFeedback(!result.valid ? result.message : result.correct ? "Correcto. Esta respuesta sería aceptada." : "Todavía no coincide. Revisa la pista y prueba de nuevo.");
    }}>Comprobar respuesta</button><button type="button" className="quiet" disabled={hint===3} onClick={()=>setHint(h=>h+1)}>Ver pista {Math.min(3,hint+1)}</button></div>
    {hint>0 && <p className="trial-hint">{question.hints[hint-1]}</p>}
    {feedback && <p role="status">{feedback}</p>}
    <small>Esta prueba no guarda intentos ni cambia el progreso de Laura.</small>
  </div>;
}
