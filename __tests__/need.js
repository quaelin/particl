const particl = require('..');

describe('.need()', () => {
  describe("when the property doesn't exist", () => {
    test('the callback does not get invoked immediately', () => {
      const p = particl();
      let calls = 0;

      p.need('noSuchProp', () => {
        calls += 1;
      });

      expect(calls).toBe(0);
    });

    describe("when there's a provider available for the property", () => {
      test('the provider gets invoked, and the need gets fulfilled', () => {
        const p = particl();
        const calls = [];

        p.provide('prop', (done) => {
          calls.push('provider');
          done('val');
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
        const p = particl();
        const valThatWillBeSet = { myObject: '' };

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
      const p = particl({ a: 1 });
      let calls = 0;

      p.need('a', () => {
        calls += 1;
      });

      expect(calls).toBe(1);
    });
  });
});
