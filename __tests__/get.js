const particl = require('..');

describe('.get()', () => {
  test('when called with no arguments, it returns undefined', () => {
    const p = particl();

    expect(p.get()).toBe(undefined);
  });

  test("when a property doesn't exist, it returns undefined", () => {
    const p = particl();

    expect(p.get('noSuchProp')).toBe(undefined);
  });

  test('when a property exists, it returns the value', () => {
    const myObject = {};
    const p = particl({ myKey: myObject });

    expect(p.get('myKey')).toBe(myObject);
  });

  test('when fetching an array of properties, it returns an array of values', () => {
    const p = particl({ a: 1, b: 2, c: 3 });

    expect(p.get(['a', 'b', 'c'])).toEqual([1, 2, 3]);
  });

  test('when a callback is provided, the results are passed in to the callback', () => {
    const p = particl({ a: 1, b: 2, c: 3 });

    p.get(['a', 'b', 'c'], (a, b, c) => {
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(c).toBe(3);
    });
  });
});
