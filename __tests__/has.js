const particl = require('..');

describe('.has()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  test('when called with no arguments, returns undefined', () => {
    expect(p.has()).toBe(undefined);
  });

  describe('.has(string)', () => {
    test('when property is NOT set, return false', () => {
      expect(p.has('a')).toBe(false);
    });

    test('when property IS set (even to a falsy value), return true', () => {
      p = particl({ a: 0 });

      expect(p.has('a')).toBe(true);
    });
  });

  describe('.has(array)', () => {
    test('when all of the preperties exist, returns true', () => {
      p = particl({ a: 1, b: 0 });

      expect(p.has(['a', 'b'])).toBe(true);
    });

    test("when at least one of the properties doesn't exist, returns false", () => {
      p = particl({ a: 1 });

      expect(p.has(['a', 'b'])).toBe(false);
    });
  });
});
