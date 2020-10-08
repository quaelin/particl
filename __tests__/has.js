const particl = require('..');

describe('.has()', () => {
  test('when called with no arguments, returns undefined', () => {
    const p = particl();

    expect(p.has()).toBe(undefined);
  });

  test('when called for a property that is NOT set, return false', () => {
    const p = particl();

    expect(p.has('a')).toBe(false);
  });

  test('when called for a property that IS set (even to a falsy value), return true', () => {
    const p = particl({ a: 0 });

    expect(p.has('a')).toBe(true);
  });
});
