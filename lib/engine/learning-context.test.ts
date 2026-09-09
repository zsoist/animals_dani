import { describe, expect, it } from 'vitest';
import { learningEvidence, redactLearningText } from './learning-context';
import type { Attempt } from './types';
const attempt: Attempt = {id:'1',user_id:'student',skill_id:'units',level:3,exercise_seed:'a',prompt_text:'Convierte 5 cm² a m²',expected_answer:'0.0005',given_answer:'0.05',correct:false,response_ms:900000,hint_level:0,error_type:'FACTOR_LINEAL_EN_AREA',session_id:'s',created_at:'2026-09-09'};
describe('Evidencia real del tutor IA', () => {
  it('no presenta tiempos antiguos ni ausencia de práctica como cero', () => {
    const [units, empty] = learningEvidence([attempt], [{id:'units',name:'Unidades'}, {id:'new',name:'Nueva'}], []);
    expect(units.medianActiveSeconds).toBeNull();
    expect(units.errors).toEqual({FACTOR_LINEAL_EN_AREA:1});
    expect(empty.accuracy).toBeNull();
    expect(empty.sample).toBe(0);
  });
  it('calcula mediana, ayudas IA y aciertos sin mezclar habilidades', () => {
    const data = [ {...attempt, timing_version:2, response_ms:10000, correct:true, error_type:null, ai_help:true}, {...attempt, timing_version:2, response_ms:20000}, {...attempt, skill_id:'other'} ];
    const [result] = learningEvidence(data,[{id:'units',name:'Unidades'}],[]);
    expect(result.sample).toBe(2);
    expect(result.accuracy).toBe(50);
    expect(result.hintedCorrect).toBe(1);
    expect(result.medianActiveSeconds).toBe(15);
    expect(result.examples[1].expected).toBe('0.0005');
  });
  it('retira credenciales y contacto, conservando operaciones de estudio', () => {
    expect(redactLearningText('sk-example123456789 user@example.com +57 300 123 4567')).not.toMatch(/example|300/);
    expect(redactLearningText('3x + 5 = 20; 0,05; 1/2')).toBe('3x + 5 = 20; 0,05; 1/2');
  });
});
