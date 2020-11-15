# particl

A small, easy to use JavaScript module that provides asynchronous control flow,
event/property listeners, barriers, and more.

`particl` is the spiritual successor to [atom](https://github.com/quaelin/atom),
using some more modern language features and adding Promise support and more
thorough tests.

## Features

* Small, no dependencies
* Allows you to _clearly_ code using a variety of async control flow patterns,
  even ones that would be cumbersome to implement clearly with just Promises.

## Install

```
  npm install particl
```

## Tutorial

### Constructor

You can call the `particl()` constructor without arguments, but it's also
possible to pass in initial properties as an object, and/or a callback function
which will be immediately invoked.

```js
  // no arguments
  let p = particl();

  // initial values
  p = particl({ prop1: 'value1', prop2: 'value2' });

  // exploded api view
  p = particl(({ get, set, need, provide, ... }) => {
    ...
  });
  p = particl({ prop1: 'value1' }, ({ get, set, need, provide, ... }) => {
    ...
  });
```

The exploded api form simply makes the entire instance API available as the
first argument to the callback, so that you can easily select the portion of the
api you want to interact with using argument destructuring.

So the following are identical:

```js
  const p = particl();
  p.set('foo', 'bar');

  const p = particl({ foo: 'bar' });

  const p = particl(({ set }) => {
    set({ foo: 'bar' });
  });
```

### Properties

A particl has properties.  The `get()` and `set()` methods may be employed to
read and write values of any type:

```js
  particl(({ get, set }) => {

    set('key', 'value');
    console.log('Value of key:', get('key'));

    set({
      pi: 3.141592653,
      r: 5,
      circumference: () => 2 * get('pi') * get('r'),
    });
    console.log('Circumference:', get('circumference')());
  });
```

If an object is passed in to the constructor, it will initialize properties:

```js
  p = particl({ p: 3.141592653, r: 5 });
```

Use `has()` to query for existence of a property, and `keys()` to get a list of
all properties that have been set.

```js
  if (p.has('skills')) {
    console.log('What "p" brings to the table:', p.keys());
  }
```

The `each()` method lets you execute a function on a series of properties.

```js
  p.set({ r: 0xBA, g: 0xDA, b: 0x55 });
  p.each(['r', 'g', 'b'], (key, value) => {
    console.log(`${key}:${value}`);
  });
```

### Listeners

Listeners may be attached to particls in a variety of ways.

To be notified as soon as a property is set, use the `once()` method.  The
callback will be called immediately if the property is already set.

```js
  p.once('user', (user) => {
    alert(`Welcome, ${user.name}!`);
  });
```

or

```js
  p.once('user').then((user) => {
    alert(`Welcome, ${user.name}!`);
  });
```

Many particl methods can work with more than one property at a time.

```js
  p.once(['app', 'user'], (app, user) => {
    alert(`Welcome to ${app.name}, ${user.name}!`);
  });
```

or

```js
  p.once(['app', 'user']).then(({ app, user }) => {
    alert(`Welcome to ${app.name}, ${user.name}!`);
  });
```

When you just want to know about the next change, even if the property is
already set, use `next()`.

```js
  p.next('click', (click) => {
    alert(`Are you done clicking on ${click.button} yet?`);
  });
```

To watch for any future changes to a property, use the `on()` method.

```js
  function myErrorHandler(error) {
    console.log(`There was a grievous calamity of code in ${p.get('module')}`);
    console.log(error);
  }
  p.on('error', myErrorHandler);
```

Note that setting a property with a primitive (string/number/boolean) value will
only trigger listeners if the value is *different*.  On the other hand, setting
an array or object value will *always* trigger listeners.

You can unregister any listener using `off()`.

```js
  p.off(myErrorHandler);
```

### Needs and Providers

You can register a provider for a property.

```js
  particl(({ need, on, provide }) => {
    provide('privacyPolicy', () => fetch(`${baseUrl}/privacy.txt`));

    on('clickPrivacy', async () => {
      element.innerText = await need('privacyPolicy');
    });
  });
```

Providers only get invoked if there is a need, and if the property is not
already set.  Use the `need()` method to declare a need for a particular
property.  If a corresponding provider is registered, it will be invoked.
Otherwise, `need()` behaves just like `once()`.

### Exploded view

If you call `explode(func)` or else just pass in a function to the constructor,
it will be called with the entire api object, allowing you to easily select just
individual methods you want with argument destructuring:

```js
  particl(async ({ get, need, on, provide, set }) => {
    set({ logDefaults: { appName: 'myApp' }});

    on('log', (event) => {
      console.log({
        ...get('logDefaults'),
        ...event,
        timestamp: Date.now(),
      });
    });
    const log = event => set('log', event);

    provide('data', () => fetch('${baseUrl}/api/data'));

    const data = await need('data');
    log({ msg: 'data loaded '});

    ...
  });
```

### Extending functionality with mixins

The particl constructor provides a way to incorporate mixins that extend the
particl's api.  Use it like this:

```js
  particl(
    [ ...mixins ],
    ({ on, set, get, need, customMethodFromMixin, ... }) => {

    }
  );
```

Some helpful mixins are included in the [mixins/ directory](./mixins).  Fox
example, use the `customListeners` mixin to create customized method names for
specific properties:

```js
  const customListenersMixin = require('particl/mixins/customListeners');

  particl(
    [customListenersMixin('event')],
    ({ onEvent, onceEvent, setEvent }) => {
      // This is a convenient shorthand for on('event', (evt) => { ... })
      onEvent((evt) => {
        console.log('Something happened:', evt);
      });
    }
  );
```

Or use the `matchers` mixin to add _validation_ to your property listeners:

```js
  const matchersMixin = require('particl/mixins/matchers');

  particl(
    [matchersMixin],
    async ({ onceMatch, set }) => {
      set('authStatus', { authenticated: false });

      ...

      const isAuthenticated = (authStatus) => (authStatus?.authenticated);
      await onceMatch('authStatus', isAuthenticated);
      // We only get here once the user is authenticated
    }
  );
```
