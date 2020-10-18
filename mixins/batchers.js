module.exports = (api) => {
  const { get, has, off, on } = api;

  class Accumulator {
    constructor(key, options = {}, batchesRemaining, cb) {
      if (!options.size) options.size = 1;
      this.key = key;
      this.options = options;
      this.batchesRemaining = batchesRemaining;
      this.items = [];
      this.cb = cb;
    }

    accumulate(val) {
      const { isMatch } = this.options;
      if (!isMatch || isMatch(val)) {
        this.items.push(val);
      }
    }

    check() {
      const now = Date.now();
      const {
        options: { size, timeout },
        items,
        batchStart,
        batchesRemaining,
        batchTimer,
      } = this;
      const fullBatch = items.length >= size;
      const pastTime = timeout && (batchStart + timeout < now);
      const anyItems = items.length >= 1;
      if (batchesRemaining && (fullBatch || (pastTime && anyItems))) {
        this.items = [];
        this.batchesRemaining -= 1;
        if (batchTimer) clearTimeout(batchTimer);
        // eslint-disable-next-line no-use-before-define
        if (this.batchesRemaining) this.resetTimer();
        this.cb(items);
        return true;
      }
      return false;
    }

    resetTimer() {
      const { options: { timeout } } = this;
      if (timeout) {
        this.batchStart = Date.now();
        this.batchTimer = setTimeout(() => { this.check(); }, timeout);
      }
    }

    waitForBatches() {
      this.resetTimer();
      const listener = (val) => {
        this.accumulate(val);
        this.check();
        if (!this.batchesRemaining) {
          off(this.key, listener);
        }
      };
      on(this.key, listener);
    }
  }

  return {
    nextBatch(key, options, /* optional */ cb) {
      if (cb) {
        (new Accumulator(key, options, 1, cb)).waitForBatches();
        return api;
      }
      return new Promise((resolve) => {
        (new Accumulator(key, options, 1, resolve)).waitForBatches();
      });
    },

    onBatch(key, options, cb) {
      (new Accumulator(key, options, Infinity, cb)).waitForBatches();
      return api;
    },

    onceBatch(key, options, /* optional */ cb) {
      const accumulator = new Accumulator(key, options, 1);
      if (has(key)) accumulator.accumulate(get(key));
      if (cb) {
        accumulator.cb = cb;
        if (!accumulator.check()) accumulator.waitForBatches();
        return api;
      }
      return new Promise((resolve) => {
        accumulator.cb = resolve;
        if (!accumulator.check()) accumulator.waitForBatches();
      });
    },
  };
};
