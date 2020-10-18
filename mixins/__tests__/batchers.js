const particl = require('../..');
const batchersMixin = require('../batchers');

describe('mixins/batchers', () => {
  let p;
  let nextBatch;
  let onBatch;
  let onceBatch;
  let set;

  const newEvent = (obj) => set('event', obj);
  const isImportant = (evt) => evt && evt.type === 'important';

  beforeEach(() => {
    p = particl([batchersMixin]);
    ({ nextBatch, onBatch, onceBatch, set } = p);
  });

  describe('nextBatch()', () => {
    describe('nextBatch(key, options)', () => {
      test('resolves once enough matching items accumulate', async () => {
        setTimeout(() => { newEvent({ type: 'important', val: 1 }); }, 0);
        setTimeout(() => { newEvent({ type: 'unimportant' }); }, 10);
        setTimeout(() => { newEvent({ type: 'important' }); }, 20);
        const batch = await nextBatch('event', { size: 2, isMatch: isImportant });
        expect(batch).toEqual([{ type: 'important', val: 1 }, { type: 'important' }]);
      });

      test('resolves once the timeout expires, as long as there are ANY items', async () => {
        setTimeout(() => { newEvent({ type: 'important', val: 1 }); }, 0);
        const batch = await nextBatch('event', { timeout: 1000, isMatch: isImportant });
        expect(batch).toEqual([{ type: 'important', val: 1 }]);
      });
    });

    describe('nextBatch(key, options, cb)', () => {
      test('invokes callback once enough matching items accumulate', (done) => {
        nextBatch('event', { size: 2, isMatch: isImportant }, (batch) => {
          expect(batch).toEqual([{ type: 'important', val: 1 }, { type: 'important' }]);
          done();
        });
        newEvent({ type: 'important', val: 1 });
        newEvent({ type: 'unimportant' });
        newEvent({ type: 'important' });
      });

      test('invokes callback once the timeout expires, as long as there are ANY items', (done) => {
        nextBatch('event', { size: 2, timeout: 100 }, (batch) => {
          expect(batch).toEqual([{ type: 'whatever', val: 1 }]);
          done();
        });
        newEvent({ type: 'whatever', val: 1 });
      });

      test('returns the api object, for chaining', () => {
        expect(nextBatch('a', {}, () => {})).toBe(p);
      });
    });
  });

  describe('onBatch()', () => {
    describe('onBatch(key, options, callback)', () => {
      test('invokes callback whevener enough items accumulate, OR the timeout elapses', (done) => {
        const batches = [];
        onBatch('event', { size: 2, timeout: 100, isMatch: isImportant }, (batch) => {
          batches.push(batch);
        });
        newEvent({ type: 'important', val: 1 });
        newEvent({ type: 'unimportant' });
        newEvent({ type: 'important' });
        newEvent({ type: 'important', val: 8 });
        setTimeout(() => {
          expect(batches).toEqual([
            [
              { type: 'important', val: 1 },
              { type: 'important' },
            ],
            [{ type: 'important', val: 8 }],
          ]);
          done();
        }, 500);
      });

      test('returns the api object, for chaining', () => {
        expect(onBatch('a', {}, () => {})).toBe(p);
      });

      describe('when there are a lot of events', () => {
        const originalEvents = [];
        for (let i = 0; i < 100; i += 1) {
          originalEvents.push({ id: i });
        }

        test('they all get accounted for in batches', (done) => {
          // Fire them all in random order
          originalEvents.forEach((evt) => {
            setTimeout(() => { newEvent(evt); }, Math.ceil(Math.random() * 100));
          });

          const batches = [];
          onBatch('event', { size: 10 }, (batch) => {
            batches.push(batch);
          });

          setTimeout(() => {
            expect(batches.length).toBeGreaterThan(9);
            const unbatched = [];
            for (let b = 0; b < batches.length; b += 1) {
              for (let e = 0; e < batches[b].length; e += 1) {
                unbatched.push(batches[b][e]);
              }
            }
            unbatched.sort((a, b) => a.id - b.id);
            expect(unbatched).toEqual(originalEvents);
            done();
          }, 500);
        });
      });
    });
  });

  describe('onceBatch()', () => {
    describe('onceBatch(key, options)', () => {
      test('resolves as soon as a single matching batch has happened', async () => {
        setTimeout(() => { newEvent({ type: 'important', val: 1 }); }, 0);
        setTimeout(() => { newEvent({ type: 'unimportant' }); }, 10);
        setTimeout(() => { newEvent({ type: 'important' }); }, 20);
        setTimeout(() => { newEvent({ type: 'important', val: 8 }); }, 50);
        const batch = await onceBatch('event', { size: 2, isMatch: isImportant });
        expect(batch).toEqual([
          { type: 'important', val: 1 },
          { type: 'important' },
        ]);
      });
    });

    describe('onceBatch(key, options, cb)', () => {
      test('invokes callback as sson as a single matching batch has happened', (done) => {
        setTimeout(() => { newEvent({ type: 'important', val: 1 }); }, 0);
        setTimeout(() => { newEvent({ type: 'unimportant' }); }, 10);
        setTimeout(() => { newEvent({ type: 'important' }); }, 20);
        setTimeout(() => { newEvent({ type: 'important', val: 8 }); }, 50);
        onceBatch('event', { size: 2, isMatch: isImportant }, (batch) => {
          expect(batch).toEqual([
            { type: 'important', val: 1 },
            { type: 'important' },
          ]);
          done();
        });
      });

      test('returns the api object, for chaining', () => {
        expect(onceBatch('a', {}, () => {})).toBe(p);
      });
    });
  });
});
