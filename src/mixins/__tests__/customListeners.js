const particl = require('../../particl');
const customListenersMixin = require('../customListeners');

describe('mixins/customListeners', () => {
  let p;
  let getEvent;
  let hasEvent;
  let needEvent;
  let nextEvent;
  let onEvent;
  let onceEvent;
  let provideEvent;
  let setEvent;

  beforeEach(() => {
    p = particl([customListenersMixin('event')]);
    ({ getEvent, hasEvent, needEvent, nextEvent, onEvent, onceEvent, provideEvent, setEvent } = p);
  });

  describe('get<Key>()', () => {
    test('returns the value', () => {
      p.set('event', 'Halloween');
      expect(getEvent()).toBe('Halloween');
    });
  });

  describe('has<Key>()', () => {
    test('checks for presence of property', () => {
      expect(hasEvent()).toBe(false);
      p.set('event', 'Graduation');
      expect(hasEvent()).toBe(true);
    });
  });

  describe('need<Key>()', () => {
    describe('need<Key>(cb)', () => {
      test('invokes provider and callback with value', (done) => {
        needEvent((val) => {
          expect(val).toBe('Christmas');
          done();
        });
        p.provide('event', () => 'Christmas');
      });

      test('returns the api object, for chaining', () => {
        expect(needEvent(() => {})).toBe(p);
      });
    });

    describe('when called as a promise', () => {
      test('resolves to correct value', async () => {
        setTimeout(() => { p.provide('event', () => 'Wedding'); }, 1);
        const evt = await needEvent();
        expect(evt).toBe('Wedding');
      });
    });
  });

  describe('next<Key>()', () => {
    describe('next<Key>(cb)', () => {
      test('invokes callback next time the key changes', (done) => {
        p.set('event', 'First day of XMas');
        nextEvent((evt) => {
          expect(evt).toBe('Second day of XMas');
          done();
        });
        p.set('event', 'Second day of XMas');
      });

      test('returns the api object, for chaining', () => {
        expect(nextEvent(() => {})).toBe(p);
      });
    });

    describe('when called as a promise', () => {
      test('resolves next time the key changes', async () => {
        p.set('event', 'Third day of XMas');
        setTimeout(() => { p.set('event', 'Fourth day of XMas'); }, 1);
        const evt = await nextEvent();
        expect(evt).toBe('Fourth day of XMas');
      });
    });
  });

  describe('on<Key>(cb)', () => {
    test('callback gets invoked every time key changes', (done) => {
      setTimeout(() => p.set('event', 1), 10);
      setTimeout(() => p.set('event', 2), 20);
      setTimeout(() => p.set('event', 3), 30);
      const events = [];
      onEvent((evt) => { events.push(evt); });
      setTimeout(() => {
        expect(events).toEqual([1, 2, 3]);
        done();
      }, 150);
    });
  });

  describe('once<Key>()', () => {
    describe('once<Key>(cb)', () => {
      test('invokes the callback as soon as a value is available', (done) => {
        p.set('event', 'Happy New Year!');
        onceEvent((evt) => {
          expect(evt).toBe('Happy New Year!');
          done();
        });
      });

      test('returns the api object, for chaining', () => {
        expect(onceEvent(() => {})).toBe(p);
      });
    });

    describe('when called as a promise', () => {
      test('it resolves as soon as a value is available', async () => {
        p.set('event', 'The Ides of March');
        const evt = await onceEvent();
        expect(evt).toBe('The Ides of March');
      });
    });
  });

  describe('provide<Key>()', () => {
    test('works', async () => {
      provideEvent(() => 'intervention');
      const evt = await p.need('event');
      expect(evt).toBe('intervention');
    });
  });

  describe('set<Key>()', () => {
    test('works', () => {
      setEvent('first day of school');
      expect(p.get('event')).toBe('first day of school');
    });
  });
});
