const particl = require('../particl');

describe('.off()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  describe('.off(listener) can be used to de-register a listener', () => {
    let invoked;
    const listener = () => { invoked = true; };

    beforeEach(() => {
      invoked = false;
    });

    test('that was added with need()', () => {
      p.need('a', listener);
      p.off(listener);
      p.set('a', true);

      expect(invoked).toBe(false);
    });

    test('that was added with next()', () => {
      p.next('a', listener);
      p.off(listener);
      p.set('a', true);

      expect(invoked).toBe(false);
    });

    test('that was added with on()', () => {
      p.on('a', listener);
      p.off(listener);
      p.set('a', true);

      expect(invoked).toBe(false);
    });

    test('that was added with once()', () => {
      p.once('a', listener);
      p.off(listener);
      p.set('a', true);

      expect(invoked).toBe(false);
    });
  });
});
