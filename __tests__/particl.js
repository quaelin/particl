const particl = require('../particl');

test('Theres a VERSION string', () => {
  expect(typeof particl.VERSION).toBe('string');
});
