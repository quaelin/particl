const particl = require('..');

describe('.has()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  test('when called with no arguments, returns undefined', () => {
    expect(p.has()).toBe(undefined);
  });

  test('when called for a property that is NOT set, return false', () => {
    expect(p.has('a')).toBe(false);
  });

  test('when called for a property that IS set (even to a falsy value), return true', () => {
    p = particl({ a: 0 });

    expect(p.has('a')).toBe(true);
  });
});
