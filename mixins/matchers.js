module.exports = (api) => {
  const { get, off, on } = api;

  const waitForMatch = (key, isMatch, cb) => {
    const listener = (val) => {
      if (isMatch(val)) {
        off(listener);
        cb(val);
      }
    };
    on(key, listener);
  };

  return {
    nextMatch(key, isMatch, /* optional */ cb) {
      if (cb) {
        waitForMatch(key, isMatch, cb);
        return api;
      }
      return new Promise((resolve) => {
        waitForMatch(key, isMatch, resolve);
      });
    },

    onMatch(key, isMatch, cb) {
      return on(key, (val) => {
        if (isMatch(val)) {
          cb(val);
        }
      });
    },

    onceMatch(key, isMatch, /* optional */ cb) {
      const current = get(key);
      const match = isMatch(current);
      if (cb) {
        if (match) {
          cb(current);
        } else {
          waitForMatch(key, isMatch, cb);
        }
        return api;
      }
      if (match) return Promise.resolve(current);
      return new Promise((resolve) => {
        waitForMatch(key, isMatch, resolve);
      });
    },
  };
};
