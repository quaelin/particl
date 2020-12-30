// Provides custom accessor/listener functions for a given property.  For
// instance, if initialized with "event" it will create `getEvent()`,
// `hasEvent()`, `needEvent()`, `nextEvent()`, `onEvent()`, etc.

const toProperCase = (str) => `${str.charAt(0).toUpperCase()}${str.substr(1)}`;

module.exports = (key) => {
  const Key = toProperCase(key);
  return (api) => {
    const { get, has, need, next, on, once, provide, set } = api;

    return {
      [`get${Key}`]: (func) => get(key, func),

      [`has${Key}`]: () => has(key),

      [`need${Key}`]: (func) => need(key, func),

      [`next${Key}`]: (func) => next(key, func),

      [`on${Key}`]: (func) => on(key, func),

      [`once${Key}`]: (func) => once(key, func),

      [`provide${Key}`]: (func) => provide(key, func),

      [`set${Key}`]: (val) => set(key, val),
    };
  };
};
