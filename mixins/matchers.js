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

  const ext = {
    nextMatch(key, isMatch, func) {
      if (func) {
        waitForMatch(key, isMatch, func);
        return api;
      }
      return new Promise((resolve) => {
        waitForMatch(key, isMatch, resolve);
      });
    },

    onMatch(key, isMatch, func) {
      return on(key, (val) => {
        if (isMatch(val)) {
          func(val);
        }
      });
    },

    onceMatch(key, isMatch, func) {
      const current = get(key);
      const match = isMatch(current);
      if (func) {
        if (match) {
          func(current);
        } else {
          waitForMatch(key, isMatch, func);
        }
        return api;
      }
      if (match) return Promise.resolve(current);
      return new Promise((resolve) => {
        waitForMatch(key, isMatch, resolve);
      });
    },
  };

  return ext;
};
