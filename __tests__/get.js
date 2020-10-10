const particl = require('..');

describe('.get()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  test('when called with no arguments, it returns undefined', () => {
    expect(p.get()).toBe(undefined);
  });

  describe('.get(string)', () => {
    test("when a property doesn't exist, it returns undefined", () => {
      expect(p.get('noSuchProp')).toBe(undefined);
    });

    test('when a property exists, it returns the value', () => {
      const myObject = {};
      p = particl({ myKey: myObject });

      expect(p.get('myKey')).toBe(myObject);
    });
  });

  describe('.get(string, func)', () => {
    test('result is passed in to the callback func', () => {
      p = particl({ a: 'Z' });

      p.get('a', (a) => {
        expect(a).toBe('Z');
      });
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.get('a', () => null)).toBe(p);
    });
  });

  describe('.get(array)', () => {
    test('returns an array of values', () => {
      p = particl({ a: 1, b: 2, c: 3 });

      expect(p.get(['a', 'b', 'c'])).toEqual([1, 2, 3]);
    });
  });

  describe('.get(array, func)', () => {
    test('results are passed in to the callback func as arguments', () => {
      p = particl({ a: 1, b: 2, c: 3 });

      p.get(['a', 'b', 'c'], (a, b, c) => {
        expect(a).toBe(1);
        expect(b).toBe(2);
        expect(c).toBe(3);
      });
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.get(['a'], () => null)).toBe(p);
    });
  });

  describe('.get(func)', () => {
    test('immediately invokes func with a hash of all current property values', () => {
      p = particl({ x: 7, y: 8 });
      let got;
      p.get(({ x, y, z }) => {
        got = { x, y, z };
      });
      expect(got).toEqual({ x: 7, y: 8, z: undefined });
    });

    test('returns the particl instance for method chaining', () => {
      expect(p.get(() => null)).toBe(p);
    });
  });
});
