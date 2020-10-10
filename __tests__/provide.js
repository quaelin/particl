const particl = require('..');

describe('.provide()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  describe('different ways to provide', () => {
    test('call a callback', async () => {
      p.provide('a', (done) => {
        done(1);
      });
      const a = await p.need('a');
      expect(a).toBe(1);
    });

    test('return a promise', async () => {
      p.provide('b', () => new Promise((resolve) => {
        setTimeout(() => {
          resolve(2);
        }, 0);
      }));
      const b = await p.need('b');
      expect(b).toBe(2);
    });

    test('return a value', async () => {
      p.provide('c', () => 3);
      const c = await p.need('c');
      expect(c).toBe(3);
    });
  });

  describe('when a provider is registered', () => {
    test('a call to "need" will trigger it', () => {
      let triggered = false;

      p.provide('a', () => { triggered = true; });
      p.need('a', () => 0);

      expect(triggered).toBe(true);
    });

    test('a call to "once" will NOT trigger it', () => {
      let triggered = false;

      p.provide('a', () => { triggered = true; });
      p.once('a', () => 0);

      expect(triggered).toBe(false);
    });
  });

  describe('when a need is registered first', () => {
    test('a call to provide will fulfill it', () => {
      let fulfilledValue;

      p.need('a', (val) => { fulfilledValue = val; });
      p.provide('a', () => 'val');

      expect(fulfilledValue).toBe('val');
    });
  });

  describe('when more than one provider is registered', () => {
    test('only the first gets invoked', () => {
      let firstInvoked = false;
      let secondInvoked = false;

      p.provide('a', () => { firstInvoked = true; });
      p.provide('a', () => { secondInvoked = true; });
      p.need('a', () => 0);

      expect(firstInvoked).toBe(true);
      expect(secondInvoked).toBe(false);
    });
  });

  describe('when a provider provides a value', () => {
    test('it gets passed to the needs callback', () => {
      let receivedVal;

      p.provide('a', (done) => { done('val'); });
      p.need('a', (a) => { receivedVal = a; });

      expect(receivedVal).toBe('val');
    });
  });
});
