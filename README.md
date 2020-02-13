# Proxy Watcher

A function that recursively watches an object for mutations via [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)s and tells you which paths changed.

It supports [primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), [functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions), [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get), [setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set), [Dates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date), [RegExps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), [Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), [Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [ArrayBuffers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Sets](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

## Install

```sh
npm install --save proxy-watcher
```

## Usage

The following interface is provided:

```ts
type Callback = ( paths: string[] ) => any;

type Disposer<T> = () => T;

function watch<Object extends object> ( object: Object, callback: Callback ): [proxy, Disposer<Object>];
```

Basically you have to pass the `watch` function an object, which will be watched for any changes, and a callback, which will be called with an array of paths changed whenever changes are detected.

The function will return an array containing a proxy object, always use this object rather than the raw object you pass the `watch` function, and a disposer function, which when called will stop the watching operation and will return back the original unproxied object.

```ts
import watch from 'proxy-watcher';

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
```

## License

MIT © Fabio Spampinato
