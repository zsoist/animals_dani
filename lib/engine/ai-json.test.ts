import {expect,it} from 'vitest';
import {parseAIJson} from './ai-json';
it('acepta JSON, cercas y escapes matemáticos sin ejecutar texto',()=>{
  expect(parseAIJson('```json\n{"reply":"hola"}\n```')).toEqual({reply:'hola'});
  expect(parseAIJson(String.raw`{"reply":"Usa \(x\)"}`)).toEqual({reply:String.raw`Usa \(x\)`});
  expect(()=>parseAIJson('{"reply":')).toThrow();
  expect(()=>parseAIJson('process.exit()')).toThrow();
});
