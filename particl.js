//
// particl.js
// https://github.com/quaelin/particl
// Author: Chris Campbell (@quaelin)
// License: MIT
//
(function () {
  const name = 'particl';
  const VERSION = '0.0.0';

  const ObjProto = Object.prototype;
  const hasOwn = ObjProto.hasOwnProperty;

  // eslint-disable-next-line no-undef
  const root = typeof window !== 'undefined' ? window : global;
  const hadPrevious = hasOwn.call(root, name);
  const prev = root[name];

  // Convenience methods
  const { slice } = Array.prototype;
  const isArray = Array.isArray || ((obj) => ObjProto.toString.call(obj) === '[object Array]');
  const toArray = (obj) => (isArray(obj) ? obj : [obj]);
  const isObject = (obj) => obj && typeof obj === 'object';
  const isFunction = (f) => typeof f === 'function';
  const isPromise = (obj) => isObject(obj) && isFunction(obj.then);
  const isString = (str) => typeof str === 'string';

  function inArray(arr, value) {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
      if (arr[i] === value) {
        return true;
      }
    }
    return false;
  }
  function isEmpty(obj) {
    for (const p in obj) { // eslint-disable-line no-restricted-syntax
      if (hasOwn.call(obj, p)) {
        return false;
      }
    }
    return true;
  }
  function zipObject(props, vals) {
    const obj = {};
    for (let i = 0; i < props.length && i < vals.length; i += 1) {
      obj[props[i]] = vals[i];
    }
    return obj;
  }

  // Property getter
  function get(nucleus, keyOrList) {
    const values = [];
    const result = { values };
    if (!keyOrList) return result;
    const isList = isArray(keyOrList);
    const keys = isList ? keyOrList : [keyOrList];
    const { props } = nucleus;
    const missing = {};
    for (let i = keys.length - 1; i >= 0; i -= 1) {
      const key = keys[i];
      if (!hasOwn.call(props, key)) {
        result.missing = missing;
        missing[key] = true;
      }
      values.unshift(props[key]);
    }
    return result;
  }

  // Helper to remove an exausted listener from the listeners array
  function removeListener(listeners) {
    for (let i = listeners.length - 1; i >= 0; i -= 1) {
      // There should only be ONE exhausted listener.
      if (!listeners[i].calls) {
        listeners.splice(i, 1);
        return;
      }
    }
  }

  // Used to detect listener recursion; a given object may only appear once.
  const objStack = [];

  // Property setter
  function set(nucleus, key, value) {
    const { props, listeners } = nucleus;
    const listenersCopy = [].concat(listeners);
    const had = hasOwn.call(props, key);
    const oldValue = props[key];
    const isObj = isObject(value);
    props[key] = value;
    if (!had || oldValue !== value || (isObj && !inArray(objStack, value))) {
      if (isObj) {
        objStack.push(value);
      }
      for (let i = listenersCopy.length - 1; i >= 0; i -= 1) {
        const listener = listenersCopy[i];
        const { keys, missing } = listener;
        if (missing) {
          if (hasOwn.call(missing, key)) {
            delete missing[key];
            if (isEmpty(missing)) {
              listener.cb.apply({}, get(nucleus, keys).values);
              listener.calls -= 1;
            }
          }
        } else if (inArray(keys, key)) {
          listener.cb.apply({}, get(nucleus, keys).values);
          listener.calls -= 1;
        }
        if (!listener.calls) {
          removeListener(listeners);
        }
      }
      delete nucleus.needs[key];
      if (isObj) {
        objStack.pop();
      }
    }
  }

  // Wrapper to prevent a callback from getting invoked more than once.
  function preventMultiCall(callback) {
    let ran;
    return (...args) => {
      if (!ran) {
        ran = 1;
        callback(...args);
      }
    };
  }

  // Helper function for setting up providers.
  function provide(nucleus, key, provider) {
    const fulfill = preventMultiCall((val) => {
      set(nucleus, key, val);
    });
    const rtval = provider(fulfill);
    if (rtval === undefined) return;
    if (isPromise(rtval)) rtval.then(fulfill);
    else fulfill(rtval);
  }

  // Determine whether two keys (or sets of keys) are equivalent.
  function keysMatch(keyOrListA, keyOrListB) {
    if (keyOrListA === keyOrListB) {
      return true;
    }
    const a = [].concat(toArray(keyOrListA)).sort();
    const b = [].concat(toArray(keyOrListB)).sort();
    return `${a}` === `${b}`;
  }

  // Return an instance.
  const particl = root[name] = function () {
    const args = slice.call(arguments, 0);
    let nucleus = {};
    let props = nucleus.props = {};
    let needs = nucleus.needs = {};
    let providers = nucleus.providers = {};
    let listeners = nucleus.listeners = [];

    const api = {

      // Remove references to all properties and listeners.  This releases
      // memory, and effective stops the particl from working.
      destroy() {
        delete nucleus.props;
        delete nucleus.needs;
        delete nucleus.providers;
        delete nucleus.listeners;
        nucleus = props = needs = providers = listeners = 0;
      },

      // Call `func` on each of the specified keys.  The key is provided as
      // the first arg, and the value as the second.
      each(keyOrList, func) {
        const keys = toArray(keyOrList);
        const len = keys.length;
        for (let i = 0; i < len; i += 1) {
          const key = keys[i];
          func(key, api.get(key));
        }
        return api;
      },

      // Establish two-way binding between a key or list of keys for two
      // different particls, so that changing a property on either particl will
      // propagate to the other.  If a map is provided for `keyOrListOrMap`,
      // properties on this particl may be bound to differently named properties
      // on `otherParticl`.  Note that entangled properties will not actually be
      // synchronized until the first change *after* entanglement.
      entangle(otherParticl, keyOrListOrMap) {
        const isList = isArray(keyOrListOrMap);
        const isMap = !isList && isObject(keyOrListOrMap);
        // eslint-disable-next-line no-nested-ternary
        const keys = isList ? keyOrListOrMap : (isMap ? [] : [keyOrListOrMap]);
        const map = isMap ? keyOrListOrMap : {};
        if (isMap) {
          for (const key in map) { // eslint-disable-line no-restricted-syntax
            if (hasOwn.call(map, key)) {
              keys.push(key);
            }
          }
        } else {
          for (let i = keys.length - 1; i >= 0; i -= 1) {
            const key = keys[i];
            map[key] = key;
          }
        }
        api.each(keys, (key) => {
          const otherKey = map[key];
          api.on(key, (value) => { otherParticl.set(otherKey, value); });
          otherParticl.on(otherKey, (value) => { api.set(key, value); });
        });
        return api;
      },

      explode(func) {
        func(api);
        return api;
      },

      // Get current values for the specified keys.  If `func` is provided,
      // it will be called with the values as args.
      get(keyOrListOrFunc, func) {
        if (!keyOrListOrFunc) return undefined;
        const firstArgType = typeof keyOrListOrFunc;
        const firstArgIsFunc = firstArgType === 'function';
        const keys = firstArgIsFunc ? api.keys() : toArray(keyOrListOrFunc);
        const result = get(nucleus, keys);
        if (firstArgIsFunc) {
          keyOrListOrFunc(zipObject(keys, result.values));
          return api;
        }
        if (func) {
          func(...result.values);
          return api;
        }
        return firstArgType === 'string' ? result.values[0] : result.values;
      },

      // Returns true iff all of the specified keys exist (regardless of
      // value).
      has(keyOrList) {
        if (!keyOrList) return undefined;
        const keys = toArray(keyOrList);
        for (let i = keys.length - 1; i >= 0; i -= 1) {
          if (!hasOwn.call(props, keys[i])) {
            return false;
          }
        }
        return true;
      },

      // Return a list of all keys.
      keys() {
        const keys = [];
        for (const key in props) { // eslint-disable-line no-restricted-syntax
          if (hasOwn.call(props, key)) {
            keys.push(key);
          }
        }
        return keys;
      },

      // Add arbitrary properties to this particl's interface.
      mixin(obj) {
        for (const p in obj) { // eslint-disable-line no-restricted-syntax
          if (hasOwn.call(obj, p)) {
            api[p] = obj[p];
          }
        }
        return api;
      },

      // Call `func` as soon as all of the specified keys have been set.  If
      // they are already set, the function will be called immediately, with
      // all the values provided as args.  In this, it is identical to
      // `once()`.  However, calling `need()` will additionally invoke
      // providers when possible, in order to try and create the required
      // values.
      need(keyOrList, func) {
        const keys = toArray(keyOrList);
        for (let i = keys.length - 1; i >= 0; i -= 1) {
          const key = keys[i];
          const provider = providers[key];
          if (!hasOwn.call(props, key) && provider) {
            provide(nucleus, key, provider);
            delete providers[key];
          } else {
            needs[key] = true;
          }
        }
        if (func) return api.once(keyOrList, func);
        return api.once(keyOrList);
      },

      // Call `func` whenever any of the specified keys is next changed.  The
      // values of all keys will be provided as args to the function.  Or omit
      // the `func` argument and it will return a promise.
      next(keyOrList, func) {
        const keys = toArray(keyOrList);
        if (func) {
          listeners.unshift({ keys, cb: func, calls: 1 });
          return api;
        }
        return new Promise((resolve) => {
          listeners.unshift({
            keys,
            cb: (...vals) => resolve(isString(keyOrList) ? vals[0] : zipObject(keys, vals)),
            calls: 1,
          });
        });
      },

      // Unregister a listener `func` that was previously registered using
      // `need()`, `next()`, `on()` or `once()`.  `keyOrList` is  optional; if
      // provided, it will selectively remove the listener only for the
      // specified combination of properties.
      off(keyOrList, func) {
        if (arguments.length === 1) {
          func = keyOrList;
          keyOrList = 0;
        }
        for (let i = listeners.length - 1; i >= 0; i -= 1) {
          const listener = listeners[i];
          if (listener.cb === func && (!keyOrList || keysMatch(listener.keys, keyOrList))) {
            listeners.splice(i, 1);
          }
        }
        return api;
      },

      // Call `func` whenever any of the specified keys change.  The values
      // of the keys will be provided as args to func.
      on(keyOrList, func) {
        listeners.unshift({
          keys: toArray(keyOrList),
          cb: func,
          calls: Infinity,
        });
        return api;
      },

      // Call `func` as soon as all of the specified keys have been set.  If
      // they are already set, the function will be called immediately, with
      // all the values provided as args.  Guaranteed to be called no more
      // than once.
      once(keyOrList, func) {
        const keys = toArray(keyOrList);
        const { values, missing } = get(nucleus, keys);
        if (func) {
          if (missing) {
            listeners.unshift({ keys, cb: func, missing, calls: 1 });
          } else {
            func(...values);
          }
          return api;
        }
        return new Promise((wrappedResolve) => {
          const resolve = (vals) => wrappedResolve(
            isString(keyOrList) ? vals[0] : zipObject(keys, vals)
          );
          if (missing) {
            listeners.unshift({ keys, cb: (...params) => resolve(params), missing, calls: 1 });
          } else {
            resolve(values);
          }
        });
      },

      // Register a provider for a particular key.  The provider `func` is a
      // function that will be called if there is a need to create the key.
      // It must return a promise, a value, or call its callback.  Provider
      // functions will be called at most once.
      provide(key, func) {
        if (needs[key]) {
          provide(nucleus, key, func);
        } else if (!providers[key]) {
          providers[key] = func;
        }
        return api;
      },

      // Set value for a key, or if `keyOrMap` is an object then set all the
      // keys' corresponding values.
      set(keyOrMap, value) {
        if (isObject(keyOrMap)) {
          for (const key in keyOrMap) { // eslint-disable-line no-restricted-syntax
            if (hasOwn.call(keyOrMap, key)) {
              set(nucleus, key, keyOrMap[key]);
            }
          }
        } else {
          set(nucleus, keyOrMap, value);
        }
        return api;
      },
    };

    if (args.length) {
      const firstArg = args[0];
      if (isFunction(firstArg)) {
        firstArg(api);
      } else {
        api.set(...args);
        if (args.length > 1) {
          const secondArg = args[1];
          if (isFunction(secondArg)) {
            secondArg(api);
          }
        }
      }
    }

    return api;
  };

  particl.VERSION = VERSION;

  particl.noConflict = () => {
    if (root[name] === particl) {
      root[name] = hadPrevious ? prev : undefined;
      if (!hadPrevious) {
        try {
          delete root[name];
        } catch (ex) {
          // no-op
        }
      }
    }
    return particl;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = particl;
  }
}());
