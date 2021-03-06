const particl = require('../particl');

describe('.explode()', () => {
  let p;

  beforeEach(() => {
    p = particl();
  });

  test('makes the whole api available as individual functions', () => {
    p.explode(async ({ get, set, has, on, need, provide }) => {
      set({ collector: [], count: 0 });

      on('track', (val) => {
        get(({ collector, count }) => {
          collector.push(val);
          set('count', count + 1);
        });
      });

      set('track', { initializing: true });

      on('data', (data) => {
        set('track', { heyWeGotSomeData: data });
      });

      provide('data', () => 'Channing Datum');

      if (!has('data')) {
        await need('data');
      }

      expect(get('collector')).toEqual([
        { initializing: true },
        { heyWeGotSomeData: 'Channing Datum' },
      ]);
    });
  });

  test('returns the particl instance for method chaining', () => {
    expect(p.explode(() => null)).toBe(p);
  });
});
