const particl = require('../particl');

describe('.on()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  describe('when a property changes', () => {
    test('any registered on() listeners get invoked, with the new value', () => {
      const events = [];

      p.set('a', 1);
      p.on('a', (a) => events.push(`X${a}`));
      p.set('a', 2);
      p.on('a', (a) => events.push(`Y${a}`));
      p.set('a', 3);
      p.on('a', (a) => events.push(`Z${a}`));
      p.set('NOT-a', 'B');

      expect(`${events}`).toBe('X2,X3,Y3');
    });
  });

  describe('listeners registered for multiple properties', () => {
    test('get invoked with ALL the values, when *any* of the properties change', () => {
      const events = [];

      p.set({ a: 1, b: 2 });
      p.on(['a', 'b', 'c'], (a, b, c) => events.push(`{a:${a},b:${b},c:${c}}`));
      p.set('b', 3);
      p.set('a', 4);
      p.set('X', 10);

      expect(`${events}`).toBe('{a:1,b:3,c:undefined},{a:4,b:3,c:undefined}');
    });
  });
});
