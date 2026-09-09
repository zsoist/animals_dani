import { describe, expect, it } from 'vitest';
import { ActiveClock } from './active-clock';
describe('Tiempo activo de respuesta', () => {
  it('excluye pestañas ocultas, pausas y espera de red', () => {
    const c = new ActiveClock(); c.sync(1000,true);
    expect(c.read(4000)).toBe(3000);
    c.sync(4000,false); expect(c.read(64000)).toBe(3000);
    c.sync(64000,true); expect(c.read(66000)).toBe(5000);
  });
  it('separa reintentos y preguntas sin acumular el tiempo anterior', () => {
    const c = new ActiveClock(); c.sync(0,true); c.reset(5000);
    expect(c.read(7000)).toBe(2000);
    c.sync(7000,false); c.reset(9000); expect(c.read(12000)).toBe(0);
    c.sync(12000,true); expect(c.read(14000)).toBe(2000);
  });
});
