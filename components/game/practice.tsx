'use client';

import { useMemo, useState } from 'react';
import { completeMission, recordAttempt } from '@/lib/data/actions';
import { evaluate, generate } from '@/lib/engine/exercises';
import { reinforce } from '@/lib/engine/selector';
import type { Question, ShelterState, Skill, Streak } from '@/lib/engine/types';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ',', '-'];

export function Practice({ sessionId, queue, skills, onDone, state, streak, userId }: { sessionId: string; queue: Question[]; skills: Skill[]; onDone: () => void; state: ShelterState; streak: Streak; userId: string }) {
  const [items, setItems] = useState(queue);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState(0);
  const [message, setMessage] = useState('');
  const [correct, setCorrect] = useState(0);
  const [started] = useState(() => Date.now());
  const [earned, setEarned] = useState(0);
  const question = items[index];
  const skill = skills.find((item) => item.id === question?.skillId);
  const exercise = useMemo(() => question && generate(question.family, question.skillId, question.level, question.seed), [question]);

  if (!question || !exercise || !skill) return <section className="panel practice-panel"><span className="eyebrow">Misión terminada</span><h2>Los gatos están contentos.</h2><p>{correct}/10 correctas · Comida +{earned}</p><button className="primary" onClick={onDone}>Volver al refugio</button></section>;

  const addKey = (key: string) => setAnswer((current) => {
    if (key === ',' && /[,.]/.test(current)) return current;
    if (current === '0' && /^\d$/.test(key)) return key;
    return `${current}${key}`;
  });
  const backspace = () => setAnswer((current) => current.slice(0, -1));
  const clear = () => setAnswer('');
  const check = async () => {
    const result = evaluate(exercise, answer);
    if (!result.valid) { setMessage(result.message); return; }
    try {
      await recordAttempt({ user_id: userId, skill_id: skill.id, level: exercise.level, exercise_seed: exercise.seed, prompt_text: exercise.prompt, expected_answer: exercise.answer, given_answer: answer, correct: result.correct, response_ms: Date.now() - started, hint_level: hint, error_type: result.errorType, session_id: sessionId });
      if (result.correct) {
        const nextCorrect = correct + 1;
        setCorrect(nextCorrect);
        setEarned((value) => value + 1);
        if (index >= 9) await completeMission(sessionId, nextCorrect, Date.now() - started);
        setMessage('¡Bien! El refugio se ilumina un poco.');
        setTimeout(() => { setIndex((value) => value + 1); setAnswer(''); setHint(0); setMessage(''); }, 450);
      } else {
        setItems((old) => reinforce(old, index));
        setMessage(result.errorType ? `Milo sigue intentando. Pista: ${exercise.hints[Math.min(hint, 2)]}` : `Milo sigue intentando. ${exercise.hints[Math.min(hint, 2)]}`);
        setHint((value) => Math.min(3, value + 1));
      }
    } catch { setMessage('No pudimos guardar este paso. Inténtalo otra vez.'); }
  };

  return <section className="panel practice-panel">
    <span className="eyebrow">Misión: ayudar a {skill.name}</span>
    <div className="practice-heading"><h2>{index + 1}/10</h2><span>{correct} aciertos</span></div>
    <p className="prompt">{exercise.prompt}</p>
    <div className="answer-wrap"><input readOnly inputMode="none" value={answer} placeholder="Toca las teclas para responder" aria-label="Respuesta"/><button type="button" className="delete-key" onClick={backspace} aria-label="Borrar último carácter">⌫</button></div>
    <div className="keypad" aria-label="Teclado de respuesta">{keys.map((key) => <button className="key" key={key} onClick={() => addKey(key)}>{key}</button>)}<button className="key key-muted" onClick={clear}>Borrar</button><button className="key key-muted" onClick={() => addKey('/')}>/</button></div>
    <button className="primary" onClick={check}>Comprobar</button>
    <button className="quiet hint-button" onClick={() => { setHint((value) => Math.min(3, value + 1)); setMessage(exercise.hints[Math.min(hint, 2)]); }}>Pedir pista</button>
    {message && <p className="status" role="status">{message}</p>}
    <p className="status">🔥 {streak.current} días · 🍽️ {state.food + earned}/10</p>
  </section>;
}
