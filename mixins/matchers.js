// Provides `nextMatch()`, `onMatch()` and `onceMatch()` notifiers that each
// take an `isMatch()` test function and only notify on matching value changes.

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
    // Notify the next time `key` gets changed to a value that `isMatch` returns
    // truthy for.
    nextMatch(key, isMatch, /* optional */ cb) {
      if (cb) {
        waitForMatch(key, isMatch, cb);
        return api;
      }
      return new Promise((resolve) => {
        waitForMatch(key, isMatch, resolve);
      });
    },

    // Notify every time `key` gets set to a value that `isMatch` returns truthy
    // for.
    onMatch(key, isMatch, cb) {
      return on(key, (val) => {
        if (isMatch(val)) {
          cb(val);
        }
      });
    },

    // Notify as soon as `key` is set to a value that `isMatch` returns truthy
    // for.
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
