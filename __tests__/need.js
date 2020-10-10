const particl = require('..');

describe('.need()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  describe('.need(string, func)', () => {
    describe("when the property doesn't exist", () => {
      test('the callback does not get invoked immediately', () => {
        let invoked = false;

        p.need('noSuchProp', () => {
          invoked = true;
        });

        expect(invoked).toBe(false);
      });

      describe("when there's a provider available for the property", () => {
        test('the provider gets invoked, and the need gets fulfilled', () => {
          const calls = [];

          p.provide('prop', () => {
            calls.push('provider');
            return 'val';
          });

          expect(calls).toEqual([]);

          p.need('prop', (val) => {
            calls.push('needer');
            expect(val).toBe('val');
          });

          expect(calls).toEqual(['provider', 'needer']);
        });
      });

      describe('when the prop gets set later', () => {
        test('the callback gets invoked', () => new Promise((resolve) => {
          const valThatWillBeSet = { prop: 'maybe' };

          p.need('propThatWillBeSet', (val) => {
            expect(val).toBe(valThatWillBeSet);
            resolve();
          });

          setTimeout(() => {
            p.set('propThatWillBeSet', valThatWillBeSet);
          }, 0);
        }));
      });
    });

    describe('when the property does already exist', () => {
      test('the callback gets invoked immediately', () => {
        p = particl({ a: 1 });
        let invoked = false;

        p.need('a', () => {
          invoked = true;
        });

        expect(invoked).toBe(true);
      });
    });
  });

  describe('.need(string)', () => {
    test('invokes providers, even though no callback specified', () => {
      let providerInvoked = false;

      p.provide('a', () => {
        providerInvoked = true;
      });

      p.need('a');

      expect(providerInvoked).toBe(true);
    });

    test('returns a promise that resolves once the value is set', () => {
      setTimeout(() => {
        p.set('a', true);
      }, 10);
      return p.need('a').then((a) => {
        expect(a).toBe(true);
      });
    });
  });

  describe('.need(array, func)', () => {
    test('invokes provider and gets fulfilled', () => {
      let providerInvoked = false;
      let needFulfilled = false;
      p.set('a', 11);
      p.provide('b', () => {
        providerInvoked = true;
        return 22;
      });
      expect(providerInvoked).toBe(false);
      p.need(['a', 'b'], (a, b) => {
        expect(a).toBe(11);
        expect(b).toBe(22);
        needFulfilled = true;
      });
      expect(providerInvoked).toBe(true);
      expect(needFulfilled).toBe(true);
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.need(['a', 'b'], () => null)).toBe(p);
    });
  });

  describe('.need(array)', () => {
    test('invokes providers and returns a promise', async () => {
      let providerInvoked = false;
      p.set('a', 111);
      p.provide('b', () => {
        providerInvoked = true;
        return 222;
      });
      expect(providerInvoked).toBe(false);
      const { a, b } = await p.need(['a', 'b']);
      expect(a).toBe(111);
      expect(b).toBe(222);
    });
  });
});
