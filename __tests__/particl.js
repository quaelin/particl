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

test('particl(object1, object2, func) inits props AND allows API mixin', () => {
  const initialProps = { a: 1, b: true };
  let myFuncCalled = false;
  const mixin = { myFunc: () => { myFuncCalled = true; } };
  let arg;
  let innerProps;
  const p = particl(initialProps, mixin, (api) => {
    arg = api;
    innerProps = api.get(['a', 'b']);
    api.myFunc();
  });
  expect(arg).toBe(p);
  expect(innerProps).toEqual([1, true]);
  expect(myFuncCalled).toBe(true);
});
