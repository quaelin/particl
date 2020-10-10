const particl = require('..');

describe('.provide()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  describe('.next(string, func)', () => {
    test('invokes func only once, the next time the property changes', () => {
      let invocations = 0;
      let newVal;
      p.set('a', 'orig value');
      p.next('a', (a) => {
        invocations += 1;
        newVal = a;
      });
      p.set('b', 'NOT a');
      expect(invocations).toBe(0);
      p.set('a', 'next value');
      expect(invocations).toBe(1);
      p.set('a', 'time after next value!');
      expect(invocations).toBe(1);
      expect(newVal).toBe('next value');
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.next('a', () => null)).toBe(p);
    });
  });

  describe('.next(string)', () => {
    test('returns a promise', async () => {
      p.set('a', 'orig');
      setTimeout(() => {
        p.set('a', 'timeout');
      }, 0);
      const a = await p.next('a');
      expect(a).toBe('timeout');
    });
  });

  describe('.next(array, func)', () => {
    test('invokes func the next time ANY of the properties change, but provides ALL the current values', () => {
      const invocations = [];
      p.set({ a: 1, b: 2 });
      p.next(['a', 'b'], (a, b) => {
        invocations.push([a, b]);
      });
      expect(invocations.length).toBe(0);
      p.set('a', 11);
      expect(invocations.length).toBe(1);
      p.set('b', 22);
      expect(invocations).toEqual([[11, 2]]);
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.next(['a', 'b'], () => null)).toBe(p);
    });
  });

  describe('.next(array)', () => {
    test('promise resolves the next time ANY of the props change, but provides ALL the current values in a hash', async () => {
      p.set({ a: 1, b: 2, c: 3 });
      setTimeout(() => {
        p.set('a', 11);
      }, 0);
      const { a, b, c } = await p.next(['a', 'b']);
      expect(a).toBe(11);
      expect(b).toBe(2);
      expect(c).toBe(undefined); // was not requested
    });
  });
});
