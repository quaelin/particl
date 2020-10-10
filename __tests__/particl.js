const particl = require('..');

test("there's a VERSION string", () => {
  expect(typeof particl.VERSION).toBe('string');
});

test('particl(object) initializes properties', () => {
  const p = particl({ alpha: 1 });
  expect(p.get('alpha')).toBe(1);
});
