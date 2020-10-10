const particl = require('..');

describe('.need()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

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
