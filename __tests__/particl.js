const particl = require('..');

test("there's a VERSION string", () => {
  expect(typeof particl.VERSION).toBe('string');
});

test('particl(object) initializes properties', () => {
  const p = particl({ alpha: 1 });
  expect(p.get('alpha')).toBe(1);
});

test('particl(func) explodes the api', () => {
  let arg;
  const p = particl((api) => {
    arg = api;
  });
  expect(arg).toBe(p);
});

test('particl(object, func) initializes properties AND explodes the api', () => {
  const initialProps = { a: 1, b: true };
  let arg;
  let innerProps;
  const p = particl(initialProps, (api) => {
    arg = api;
    innerProps = api.get(['a', 'b']);
  });
  expect(arg).toBe(p);
  expect(innerProps).toEqual([1, true]);
});

test('particl(object, array, func) inits props, does API mixins, and explodes', () => {
  const initialProps = { a: 1, b: true };
  let myFunc1Called = false;
  let myFunc2Value;
  const mixins = [
    // Object style
    { myFunc1: () => { myFunc1Called = true; } },

    // Function style
    (api) => ({ myFunc2: () => { myFunc2Value = api.get('a') + 1; } }),
  ];
  let arg;
  let innerProps;
  const p = particl(initialProps, mixins, (api) => {
    arg = api;
    innerProps = api.get(['a', 'b']);
    api.myFunc1();
  });
  expect(arg).toBe(p);
  expect(innerProps).toEqual([1, true]);
  expect(myFunc1Called).toBe(true);
  expect(myFunc2Value).toBe(undefined);
  p.myFunc2();
  expect(myFunc2Value).toBe(2);
});
