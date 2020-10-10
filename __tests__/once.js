const particl = require('..');

describe('.once()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  describe('.once(string, func)', () => {
    describe("when the property doesn't exist", () => {
      test('the callback does not get invoked immediately', () => {
        let calls = 0;

        p.once('noSuchProp', () => {
          calls += 1;
        });

        expect(calls).toBe(0);
      });

      describe('even when there IS a provider available for the property', () => {
        test('the provider does NOT get invoked', () => {
          let calls = 0;

          p.provide('prop', () => {
            calls += 1;
          });

          p.once('prop', () => {
            calls += 1;
          });

          expect(calls).toBe(0);
        });
      });

      describe('when the prop gets set later', () => {
        test('the callback gets invoked', () => new Promise((resolve) => {
          const valThatWillBeSet = { myObject: '' };

          p.once('propThatWillBeSet', (val) => {
            expect(val).toBe(valThatWillBeSet);
            resolve();
          });

          setTimeout(() => {
            p.set('propThatWillBeSet', valThatWillBeSet);
          }, 0);
        }));
      });
    });

    describe('when the property does alreay exist', () => {
      test('the callback gets invoked immediately', () => {
        p = particl({ a: 1 });
        let calls = 0;

        p.once('a', () => {
          calls += 1;
        });

        expect(calls).toBe(1);
      });
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.once('a', () => null)).toBe(p);
    });
  });

  describe('.once(string)', () => {
    test('returns a promise that resolves to the single value (once it gets set)', async () => {
      setTimeout(() => {
        p.set('a', true);
      }, 0);
      const a = await p.once('a');
      expect(a).toBe(true);
    });
  });

  describe('.once(array, func)', () => {
    test('invokes func only after all properties are set', () => {
      let invoked = false;
      p.set('a', 1);
      p.once(['a', 'b'], (a, b) => {
        invoked = true;
        expect(a).toBe(1);
        expect(b).toBe(2);
      });
      expect(invoked).toBe(false);
      p.set('b', 2);
      expect(invoked).toBe(true);
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.once(['a', 'b'], () => null)).toBe(p);
    });
  });

  describe('.once(array)', () => {
    test('returns a promise that resolves to a hash of the requested properties', async () => {
      p.set({ a: 99, b: 77 });
      const { a, b } = await p.once(['a', 'b']);
      expect(a).toBe(99);
      expect(b).toBe(77);
    });
  });
});
