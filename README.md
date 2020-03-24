# Proxy Watcher

A library that recursively watches an object for mutations via [`Proxys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and tells you which paths changed.

The following values are fully supported: [primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), [functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions), [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get), [setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set), [Dates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), [RegExps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), [Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [ArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

Other values are partially supported: [Promises](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise), [WeakMaps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), [WeakSets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) and custom classes. Basically mutations happening inside them won't be detected, however setting any of these as a value will be detected as a mutation.

## Functions

The following functions are provided.

- **watch**: starts watching an object for mutations, and returns a proxy object.
- **unwatch**: stops watching an object for mutations, and returns the raw object being proxied.
- **record**: records and returns an array of root paths that have been accessed while executing the provided function.
- **target**: returns the raw object being proxied.
- **isProxy**: returns a boolean indicating if the provided object is a proxy object or not.

## Limitations

- Mutations happening at locations that need to be reached via a [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) aren't detected, as a precise string path for them can't be generated (e.g. `{ [Symbol ()]: { unreachableViaStringPath: true }`).
- A path is a dot-separated string of keys, therefore using only dots as your keys may lead to some weird paths generated that can't be parsed properly (e.g. `foo.....bar`, is that `foo/.../bar` or `foo/././bar`?)
- Proxys will make certain operations even 100x slower on current engines, however those operations are simple things like property accesses which will almost never be your actual bottleneck, even with this kind of performance hit.
- Proxys are un-polyfillable, if you have to support platforms that don't [support them](https://caniuse.com/#search=proxy) you can't use this library.
- It's possible that the callback will be called when nothing actually changed (e.g. it will happen if you to flip a boolean twice synchronously).

## Install

```sh
npm install --save proxy-watcher
```

## Usage

The following interface is provided:

```ts
type Disposer = () => void;

function watch ( object: Object, callback: ( paths: string[] ) => any ): [Proxy, Disposer];
function unwatch ( proxy: Proxy ): Object;
function record ( proxy: Proxy, fn: ( proxy: Proxy ) => void ): string[];
function target ( proxy: Proxy ): Object;
function isProxy ( object: Object | Proxy ): boolean;
```

Basically you have to pass the `watch` function an object, which will be watched for any changes, and a callback, which will be called with an array of paths changed whenever changes are detected.

The function will return an array containing a proxy object, always use this object rather than the raw object you pass the `watch` function, and a disposer function, which when called will stop the watching operation and will return back the original unproxied object.

```ts
import {watch, unwatch, record, target, isProxy} from 'proxy-watcher';

/* WATCH */

const [proxy, dispose] = watch ({
  foo: true,
  arr: [1, 2, 3]
}, paths => {
  console.log ( 'Something changed at these paths:', paths );
});

proxy.foo; // => true
proxy.arr; // => [1, 2, 3]

proxy.foo = true; // Nothing actually changed, the callback won't be called
proxy.arr[0] = 1; // Nothing actually changed, the callback won't be called

proxy.foo = false; // Callback called with paths: ['foo']
proxy.bar = true; // Callback called with paths: ['bar']
proxy.arr.push ( 4 ) = true; // Callback called with paths: ['arr.3', 'arr']

/* RECORD */ // Record root keys accessed

record ( proxy, () => {
  console.log ( proxy.foo );
}); // => ['foo']

/* TARGET */ // Return the raw unproxied object

target ( proxy ); // => { foo: false, bar = true, arr: [1, 2, 3, 4] }

/* IS PROXY */

isProxy ( proxy ); // => true
isProxy ( target ( proxy ) ); // => false

/* UNWATCH */

dispose (); // Stop watching
unwatch ( proxy ); // Altertnative way to stop watching
```

## License

MIT © Fabio Spampinato
