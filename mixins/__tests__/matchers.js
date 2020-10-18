const particl = require('../..');
const matchersMixin = require('../matchers');

describe('mixins/matchers', () => {
  let p;
  let nextMatch;
  let onMatch;
  let onceMatch;
  let set;

  const isCelcius = (temp) => temp >= -273;

  beforeEach(() => {
    p = particl({ celcius: 0 }, [matchersMixin]);
    ({ nextMatch, onMatch, onceMatch, set } = p);
  });

  describe('nextMatch()', () => {
    describe('nextMatch(key, isMatch)', () => {
      test('resolves the next time the prop changes to a value isMatch returns truthy for', async () => {
        setTimeout(() => { set('celcius', 'too hot'); }, 0);
        setTimeout(() => { set('celcius', 25); }, 1);
        const celcius = await nextMatch('celcius', isCelcius);
        expect(celcius).toBe(25);
      });
    });

    describe('nextMatch(key, isMatch, cb)', () => {
      test('invokes the callback next time the prop changes to a value isMatch returns truthy for', (done) => {
        setTimeout(() => { set('celcius', 'too hot'); }, 0);
        setTimeout(() => { set('celcius', 25); }, 1);
        nextMatch('celcius', isCelcius, (val) => {
          try {
            expect(val).toBe(25);
            done();
          } catch (ex) {
            done(ex);
          }
        });
      });

      test('returns the api object, for chaining', () => {
        expect(nextMatch('celcius', isCelcius, () => {})).toBe(p);
      });
    });
  });

  describe('onMatch()', () => {
    describe('onMatch(key, isMatch, callbsack)', () => {
      test('invokes callback every time prop changes to value isMatch returns truthy for', (done) => {
        const calls = [];
        setTimeout(() => { set('celcius', 'too cold'); }, 0);
        setTimeout(() => { set('celcius', 15.5); }, 1);
        setTimeout(() => { set('celcius', 'just right'); }, 2);
        setTimeout(() => { set('celcius', 6000); }, 3);
        setTimeout(() => { set('celcius', 'smokin'); }, 5);
        setTimeout(() => {
          try {
            expect(calls).toEqual([15.5, 6000]);
            done();
          } catch (ex) {
            done(ex);
          }
        }, 6);
        onMatch('celcius', isCelcius, (val) => { calls.push(val); });
      });
    });
  });

  describe('onceMatch()', () => {
    describe('onceMatch(key, isMatch)', () => {
      test('resolves immediately if a matching property is already set', async () => {
        const val = await onceMatch('celcius', isCelcius);
        expect(val).toBe(0);
      });

      test('if non-matching prop set, it waits for matching one', async () => {
        set('celcius', 'chilly');
        setTimeout(() => { set('celcius', 5); }, 1);
        const celcius = await onceMatch('celcius', isCelcius);
        expect(celcius).toBe(5);
      });
    });

    describe('onceMatch(key, isMatch, callback)', () => {
      test('invokes callback if a matching property is already set', (done) => {
        onceMatch('celcius', isCelcius, (val) => {
          try {
            expect(val).toBe(0);
            done();
          } catch (ex) {
            done(ex);
          }
        });
      });

      test('waits to invoke callback if non-matching prop is set', (done) => {
        set('celcius', 'dank');
        onceMatch('celcius', isCelcius, (val) => {
          try {
            expect(val).toBe(-101);
            done();
          } catch (ex) {
            done(ex);
          }
        });
        setTimeout(() => { set('celcius', -101); }, 1);
      });
    });
  });
});
