module.exports = (api) => {
  const { get, has, off, on } = api;

  const newAccumulator = (key, options = {}, batchesRemaining, cb) => {
    if (!options.size) options.size = 1;
    return {
      key,
      options,
      items: [],
      batchesRemaining,
      cb,
    };
  };

  const accumulate = (accumulator, val) => {
    const { items, options: { isMatch } } = accumulator;
    if (!isMatch || isMatch(val)) {
      items.push(val);
    }
  };

  const checkAccumulator = (accumulator) => {
    const now = Date.now();
    const {
      options: { size = 1, timeout },
      items,
      batchStart,
      batchesRemaining,
      batchTimer,
    } = accumulator;
    const fullBatch = items.length >= size;
    const pastTime = timeout && (batchStart + timeout < now);
    const anyItems = items.length >= 1;
    if (batchesRemaining && (fullBatch || (pastTime && anyItems))) {
      accumulator.items = [];
      accumulator.batchesRemaining -= 1;
      if (batchTimer) clearTimeout(batchTimer);
      // eslint-disable-next-line no-use-before-define
      if (accumulator.batchesRemaining) resetBatchTimer(accumulator);
      accumulator.cb(items);
      return true;
    }
    return false;
  };

  const resetBatchTimer = (accumulator) => {
    const { options: { timeout } } = accumulator;
    if (timeout) {
      accumulator.batchStart = Date.now();
      accumulator.batchTimer = setTimeout(() => { checkAccumulator(accumulator); }, timeout);
    }
  };

  const waitForBatches = (accumulator) => {
    const { key } = accumulator;
    resetBatchTimer(accumulator);
    const listener = (val) => {
      accumulate(accumulator, val);
      checkAccumulator(accumulator);
      if (!accumulator.batchesRemaining) {
        off(key, listener);
      }
    };
    on(key, listener);
  };

  return {
    nextBatch(key, options, /* optional */ cb) {
      if (cb) {
        waitForBatches(newAccumulator(key, options, 1, cb));
        return api;
      }
      return new Promise((resolve) => {
        waitForBatches(newAccumulator(key, options, 1, resolve));
      });
    },

    onBatch(key, options, cb) {
      waitForBatches(newAccumulator(key, options, Infinity, cb));
      return api;
    },

    onceBatch(key, options, /* optional */ cb) {
      const accumulator = newAccumulator(key, options, 1);
      if (has(key)) {
        accumulate(accumulator, get(key));
      }
      if (cb) {
        accumulator.cb = cb;
        if (!checkAccumulator(accumulator)) {
          waitForBatches(accumulator);
        }
        return api;
      }
      return new Promise((resolve) => {
        accumulator.cb = resolve;
        if (!checkAccumulator(accumulator)) {
          waitForBatches(accumulator);
        }
      });
    },
  };
};
