const particl = require('..');

describe('.once()', () => {
  describe("when the property doesn't exist", () => {
    test('the callback does not get invoked immediately', () => {
      const p = particl();
      let calls = 0;

      p.once('noSuchProp', () => {
        calls += 1;
      });

      expect(calls).toBe(0);
    });

    describe('even when there IS a provider available for the property', () => {
      test('the provider does NOT get invoked', () => {
        const p = particl();
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
      test('the callback gets invoked when the property is set', () => new Promise((resolve) => {
        const p = particl();
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
    test('the callback does get invoked immediately', () => {
      const p = particl({ a: 1 });
      let calls = 0;

      p.once('a', () => {
        calls += 1;
      });

      expect(calls).toBe(1);
    });
  });
});
