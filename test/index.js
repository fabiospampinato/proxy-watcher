
/* IMPORT */

import * as _ from 'lodash';
import {describe} from 'ava-spec';
import watch from '../dist';

/* HELPERS */

function makeData ( object ) {

  let callsNr = 0,
      paths = [];

  const [proxy, dispose] = watch ( object, changedPaths => {
    callsNr++;
    paths = paths.concat ( changedPaths );
  });

  return {
    object,
    proxy,
    dispose,
    get nr () {
      return callsNr;
    },
    get paths () {
      const result = paths;
      paths = []; // Resetting
      return result;
    }
  };

}

/* PROXY WATCHER */

describe ( 'Proxy Watcher', it => {

  it ( 'get invariants', t => {

    const obj = {};

    Object.defineProperty ( obj, 'nonWritable', {
      configurable: false,
      writable: false,
      value: { a: true }
    });

    Object.defineProperty ( obj, 'nonReadable', {
      configurable: false,
      set: () => {}
    });

    const data = makeData ( obj );

    t.is ( data.proxy.nonWritable, obj.nonWritable );
    t.is ( data.proxy.nonReadable, undefined );
    t.is ( data.nr, 0 );

  });

  it ( 'trap errors don\'t break things', t => {

    t.plan ( 5 );

    const obj = {
      foo: true,
      frozen: Object.freeze ( {} )
    };

    Object.defineProperty ( obj, 'nonWritable', {
      configurable: false,
      writable: false,
      value: { a: true }
    });

    const data = makeData ( obj );

    try {

      data.proxy.nonWritable = 123;

    } catch ( err ) {

      t.true ( err instanceof Error );

    }

    try {

      delete data.proxy.nonWritable;

    } catch ( err ) {

      t.true ( err instanceof Error );

    }

    try {

      data.proxy.frozen.foo = {};

    } catch ( err ) {

      t.true ( err instanceof Error );

    }

    t.is ( data.nr, 0 );

    data.proxy.foo = false;

    t.is ( data.nr, 1 );

  });

  it ( 'watching immutable ~primitives doesn\'t throw an error', t => {

    const values = [
      null,
      undefined,
      123,
      123n,
      NaN,
      true,
      false,
      'string',
      Symbol (),
      /foo/g,
      new ArrayBuffer ( 123 ),
      new Number ( 123 ),
      new Boolean ( true ),
      new String ( 'string' )
    ];

    values.forEach ( value => t.is ( value, watch ( value )[0] ) );

  });

  it ( 'returns a disposer', t => {

    const obj = {
      deep: {
        deeper: true
      }
    };

    const data = makeData ( obj );

    data.proxy.deep.deeper = false; // In order to deeply proxy

    t.is ( data.nr, 1 );

    const target = data.dispose ();

    t.is ( target, obj );

    data.proxy.foo = true;
    data.proxy.deep.foo = true;
    data.proxy.deep.deeper = { foo: true };
    delete data.proxy.deep;

    t.is ( data.nr, 1 );

  });

  it ( 'basics', t => {

    const data = makeData ({ foo: true });

    data.proxy.foo;
    data.proxy.bar;
    data.proxy.foo = true;

    t.is ( data.nr, 0 );

    data.proxy.bar = undefined;

    t.is ( data.nr, 1 );
    t.deepEqual ( data.paths, ['bar'] );

    data.proxy.foo = false;
    data.proxy.foo = false;

    t.is ( data.nr, 2 );
    t.deepEqual ( data.paths, ['foo'] );

    data.proxy.bar = { deep: true };
    data.proxy.bar = { deep: true };
    data.proxy.bar = { deep: true };

    t.is ( data.nr, 5 );
    t.deepEqual ( data.paths, ['bar', 'bar', 'bar'] );

    data.proxy.bar.deep = undefined;
    data.proxy.baz = undefined;
    delete data.proxy.bar.deep;
    delete data.proxy.bar.deep;
    delete data.proxy.bar;

    t.is ( data.nr, 9 );
    t.deepEqual ( data.paths, ['bar.deep', 'baz', 'bar.deep', 'bar'] );

    Object.defineProperty ( data.proxy, 'bar', { value: 2 });
    Object.defineProperty ( data.proxy, 'bar', { value: 2 });

    t.is ( data.nr, 11 );
    t.deepEqual ( data.paths, ['bar', 'bar'] );

    t.true ( data.proxy.hasOwnProperty ( 'foo' ) );
    t.true ( 'foo' in data.proxy );
    t.false ( data.proxy.hasOwnProperty ( 'qux' ) );
    t.false ( 'qux' in data.proxy );

    t.is ( data.nr, 11 );

  });

  it ( 'accessors', t => {

    const obj = {};

    Object.defineProperty ( obj, 'accessor', {
      set ( val ) {
        this._accessor = val;
      },
      get () {
        return this._accessor;
      }
    });

    const data = makeData ( obj );

    data.proxy.accessor = 10;
    data.proxy.accessor = 10;

    t.is ( data.proxy.accessor, 10 );
    t.is ( data.nr, 1 );
    t.deepEqual ( data.paths, ['accessor'] );

  });

  it ( 'deep', t => {

    const data = makeData ({
      deep: {
        arr: [1, 2, { foo: true }, { zzz: true }],
        map: new Map ([ ['1', {}], ['2', {}] ]),
        set: new Set ([ {}, {} ])
      }
    });

    data.proxy.deep.arr[0] = 1;
    data.proxy.deep.arr[1] = 2;
    data.proxy.deep.arr[2].foo = true;

    t.is ( data.nr, 0 );

    data.proxy.deep.arr[0] = -1;
    data.proxy.deep.arr[1] = -2;
    data.proxy.deep.arr[2].foo = false;
    data.proxy.deep.arr[2].bar = 123;
    data.proxy.deep.arr[4] = { other: true };
    data.proxy.deep.arr[4] = { other: false };
    data.proxy.deep.arr.forEach ( x => x.zzz && ( x.mod = true ) );
    data.proxy.deep.map.forEach ( x => x.mod = true );
    data.proxy.deep.set.forEach ( x => x.mod = true );

    _.merge ( data.proxy, {
      root: true,
      deep: {
        deeper: {
          bottom: true
        }
      }
    });

    _.merge ( data.proxy, {
      root: false,
      deep: {
        deeper: {
          bottom: false
        }
      }
    });

    t.is ( data.nr, 13 );
    t.deepEqual ( data.paths, ['deep.arr.0', 'deep.arr.1', 'deep.arr.2.foo', 'deep.arr.2.bar', 'deep.arr.4', 'deep.arr.4', 'deep.arr.3.mod', 'deep.map', 'deep.set', 'root', 'deep.deeper', 'root', 'deep.deeper.bottom'] );

  });

  it ( 'primitives - tricky', t => {

    const data = makeData ({
      minInf: -Infinity,
      inf: Infinity,
      minZero: -0,
      zero: 0,
      nan: NaN,
      bigint: 1n
    });

    data.proxy.minInf = -Infinity;
    data.proxy.inf = Infinity;
    data.proxy.minZero = -0;
    data.proxy.zero = 0;
    data.proxy.nan = NaN;
    data.proxy.bigint = 1n;

    t.is ( data.nr, 0 );

    data.proxy.minInf = Infinity;
    data.proxy.inf = -Infinity;
    data.proxy.minZero = 0;
    data.proxy.zero = -0;
    data.proxy.nan = 0;
    data.proxy.bigint = 2n;

    t.is ( data.nr, 6 );
    t.deepEqual ( data.paths, ['minInf', 'inf', 'minZero', 'zero', 'nan', 'bigint'] );

  });

  it ( 'primitives - constructors', t => {

    const data = makeData ({
      fn: {
        symbol: Symbol (),
        bool: Boolean ( true ),
        str: String ( 'string' ),
        nr: Number ( 123 )
      },
      new: {
        bool: new Boolean ( true ),
        str: new String ( 'string' ),
        nr: new Number ( 123 )
      }
    });

    data.proxy.fn.symbol;
    data.proxy.fn.bool;
    data.proxy.fn.str;
    data.proxy.fn.nr;
    data.proxy.new.bool;
    data.proxy.new.str;
    data.proxy.new.nr;

    t.is ( data.nr, 0 );

    data.proxy.fn.bool = true;
    data.proxy.fn.str = 'string';
    data.proxy.fn.nr = 123;

    t.is ( data.nr, 0 );

    data.proxy.fn.symbol = Symbol ();
    data.proxy.fn.bool = new Boolean ( true );
    data.proxy.fn.str = new String ( 'string' );
    data.proxy.fn.nr = new Number ( 123 );

    t.is ( data.nr, 4 );
    t.deepEqual ( data.paths, ['fn.symbol', 'fn.bool', 'fn.str', 'fn.nr'] );

    data.proxy.new.bool = new Boolean ( true );
    data.proxy.new.str = new String ( 'string' );
    data.proxy.new.nr = new Number ( 123 );

    t.is ( data.nr, 7 );
    t.deepEqual ( data.paths, ['new.bool', 'new.str', 'new.nr'] );

    data.proxy.new.bool = true;
    data.proxy.new.str = 'string';
    data.proxy.new.nr = 123;

    t.is ( data.nr, 10 );
    t.deepEqual ( data.paths, ['new.bool', 'new.str', 'new.nr'] );

    delete data.proxy.fn.bool;
    delete data.proxy.fn.str;
    delete data.proxy.fn.nr;
    delete data.proxy.new.bool;
    delete data.proxy.new.str;
    delete data.proxy.new.nr;

    t.is ( data.nr, 16 );
    t.deepEqual ( data.paths, ['fn.bool', 'fn.str', 'fn.nr', 'new.bool', 'new.str', 'new.nr'] );

  });

  it ( 'date', t => {

    const data = makeData ({ date: new Date () });

    data.proxy.date.getTime ();
    data.proxy.date.getDate ();
    data.proxy.date.getDay ();
    data.proxy.date.getFullYear ();
    data.proxy.date.getHours ();
    data.proxy.date.getMilliseconds ();
    data.proxy.date.getMinutes ();
    data.proxy.date.getMonth ();
    data.proxy.date.getSeconds ();
    data.proxy.date.getTime ();
    data.proxy.date.getTimezoneOffset ();
    data.proxy.date.getUTCDate ();
    data.proxy.date.getUTCDay ();
    data.proxy.date.getUTCFullYear ();
    data.proxy.date.getUTCHours ();
    data.proxy.date.getUTCMilliseconds ();
    data.proxy.date.getUTCMinutes ();
    data.proxy.date.getUTCMonth ();
    data.proxy.date.getUTCSeconds ();
    data.proxy.date.getYear ();

    t.is ( data.nr, 0 );

    data.proxy.date.toDateString ();
    data.proxy.date.toISOString ();
    data.proxy.date.toJSON ();
    data.proxy.date.toGMTString ();
    data.proxy.date.toLocaleDateString ();
    data.proxy.date.toLocaleString ();
    data.proxy.date.toLocaleTimeString ();
    data.proxy.date.toString ();
    data.proxy.date.toTimeString ();
    data.proxy.date.toUTCString ();
    data.proxy.date.valueOf ();

    t.is ( data.nr, 0 );

    data.proxy.date.setDate ( data.proxy.date.getDate () );
    data.proxy.date.setFullYear ( data.proxy.date.getFullYear () );
    data.proxy.date.setHours ( data.proxy.date.getHours () );
    data.proxy.date.setMilliseconds ( data.proxy.date.getMilliseconds () );
    data.proxy.date.setMinutes ( data.proxy.date.getMinutes () );
    data.proxy.date.setMonth ( data.proxy.date.getMonth () );
    data.proxy.date.setSeconds ( data.proxy.date.getSeconds () );
    data.proxy.date.setTime ( data.proxy.date.getTime () );
    data.proxy.date.setUTCDate ( data.proxy.date.getUTCDate () );
    data.proxy.date.setUTCFullYear ( data.proxy.date.getUTCFullYear () );
    data.proxy.date.setUTCHours ( data.proxy.date.getUTCHours () );
    data.proxy.date.setUTCMilliseconds ( data.proxy.date.getUTCMilliseconds () );
    data.proxy.date.setUTCMinutes ( data.proxy.date.getUTCMinutes () );
    data.proxy.date.setUTCMonth ( data.proxy.date.getUTCMonth () );
    data.proxy.date.setUTCSeconds ( data.proxy.date.getUTCSeconds () );

    t.is ( data.nr, 0 );

    const next = x => x % 2 + 1; // Computing an always different valid value

    data.proxy.date.setDate ( next ( data.proxy.date.getDate () ) );
    data.proxy.date.setFullYear ( next ( data.proxy.date.getFullYear () ) );
    data.proxy.date.setHours ( next ( data.proxy.date.getHours () ) );
    data.proxy.date.setMilliseconds ( next ( data.proxy.date.getMilliseconds () ) );
    data.proxy.date.setMinutes ( next ( data.proxy.date.getMinutes () ) );
    data.proxy.date.setMonth ( next ( data.proxy.date.getMonth () ) );
    data.proxy.date.setSeconds ( next ( data.proxy.date.getSeconds () ) );
    data.proxy.date.setTime ( next ( data.proxy.date.getTime () ) );
    data.proxy.date.setUTCDate ( next ( data.proxy.date.getUTCDate () ) );
    data.proxy.date.setUTCFullYear ( next ( data.proxy.date.getUTCFullYear () ) );
    data.proxy.date.setUTCHours ( next ( data.proxy.date.getUTCHours () ) );
    data.proxy.date.setUTCMilliseconds ( next ( data.proxy.date.getUTCMilliseconds () ) );
    data.proxy.date.setUTCMinutes ( next ( data.proxy.date.getUTCMinutes () ) );
    data.proxy.date.setUTCMonth ( next ( data.proxy.date.getUTCMonth () ) );
    data.proxy.date.setUTCSeconds ( next ( data.proxy.date.getUTCSeconds () ) );

    t.is ( data.nr, 15 );
    t.deepEqual ( data.paths, ['date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date', 'date'] );

  });

  it ( 'regex', t => {

    const data = makeData ({ re: /foo/gi });

    data.proxy.re.lastIndex;
    data.proxy.re.source;

    t.is ( data.nr, 0 );

    data.proxy.re.lastIndex = data.proxy.re.lastIndex;

    t.is ( data.nr, 0 );

    data.proxy.re.exec ( 'foo' );
    data.proxy.re.test ( 'foo' );
    'foo'.match ( data.proxy.re );
    'foo'.matchAll ( data.proxy.re );
    'foo'.replace ( data.proxy.re, '' );
    'foo'.search ( data.proxy.re );
    'foo'.split ( data.proxy.re );

    t.is ( data.nr, 0 );

    // data.proxy.re.lastIndex = -10; //FIXME: https://github.com/lodash/lodash/issues/4645

    // t.is ( data.nr, 1 );
    // t.deepEqual ( data.paths, ['re.lastIndex'] );

  });

  it ( 'function', t => {

    const data = makeData ({ fn: function () {} });

    data.proxy.fn.length;
    data.proxy.fn.name;
    data.proxy.fn.displayName;

    t.is ( data.nr, 0 );

    data.proxy.fn.displayName = 'Name';

    t.is ( data.nr, 1 );
    t.deepEqual ( data.paths, ['fn.displayName'] );

  });

  it ( 'array', t => {

    const data = makeData ({ arr: [2, 1, 3] });

    data.proxy.arr.constructor;
    t.is ( data.proxy.arr.length, 3 );

    t.is ( data.nr, 0 );

    data.proxy.arr.concat ( 4 );
    data.proxy.arr.entries ();
    data.proxy.arr.every ( () => false );
    data.proxy.arr.filter ( () => false );
    data.proxy.arr.find ( () => false );
    data.proxy.arr.findIndex ( () => false );
    data.proxy.arr.forEach ( () => {} );
    data.proxy.arr.includes ( 1 );
    data.proxy.arr.indexOf ( 1 );
    data.proxy.arr.join ();
    data.proxy.arr.keys ();
    data.proxy.arr.lastIndexOf ( 1 );
    data.proxy.arr.map ( () => false );
    data.proxy.arr.reduce ( () => ({}) );
    data.proxy.arr.reduceRight ( () => ({}) );
    data.proxy.arr.slice ();
    data.proxy.arr.some ( () => false );
    data.proxy.arr.toLocaleString ();
    data.proxy.arr.toString ();
    data.proxy.arr.values ();

    t.is ( data.nr, 0 );

    data.proxy.arr.length = 10;

    t.is ( data.nr, 1 );
    t.deepEqual ( data.paths, ['arr.length'] );

    data.proxy.arr.copyWithin ( 0, 0, 0 );
    data.proxy.arr.push ();
    data.proxy.arr.splice ( 0, 0 );

    t.is ( data.nr, 1 );

    data.proxy.arr.copyWithin ( 0, 1, 2 );
    data.proxy.arr.fill ( 0 );
    data.proxy.arr.pop ();
    data.proxy.arr.push ( -1, -2, -3 );
    data.proxy.arr.reverse ();
    data.proxy.arr.shift ();
    data.proxy.arr.sort ();
    data.proxy.arr.splice ( 0, 1, 2 );
    data.proxy.arr.unshift ( 5 );

    t.is ( data.nr, 44 );
    t.deepEqual ( data.paths, ['arr.0', 'arr', 'arr.0', 'arr.1', 'arr.2', 'arr.3', 'arr.4', 'arr.5', 'arr.6', 'arr.7', 'arr.8', 'arr.9', 'arr', 'arr.9', 'arr.length', 'arr', 'arr.9', 'arr.10', 'arr.11', 'arr', 'arr.0', 'arr.11', 'arr.1', 'arr.10', 'arr.2', 'arr.9', 'arr', 'arr.0', 'arr.1', 'arr.2', 'arr.11', 'arr.length', 'arr', 'arr.0', 'arr.1', 'arr', 'arr.0', 'arr', 'arr.11', 'arr.2', 'arr.1', 'arr.0', 'arr'] );

  });

  it ( 'array buffer', t => {

    const data = makeData ({ arr: new ArrayBuffer ( 12 ) });

    data.proxy.arr.constructor;
    data.proxy.arr.byteLength;

    t.is ( data.nr, 0 );

    data.proxy.arr.slice ( 0, 8 );

    t.is ( data.nr, 0 );

  });

  it ( 'typed array', t => {

    const Constructors = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array];

    Constructors.map ( Constructor => {

      const data = makeData ({ arr: new Constructor ( new ArrayBuffer ( 24 ) ) });

      data.proxy.arr.constructor;
      data.proxy.arr.constructor.name;
      data.proxy.arr.BYTES_PER_ELEMENT;
      data.proxy.arr.byteLength;
      data.proxy.arr.byteOffset;
      data.proxy.arr.buffer;

      t.is ( data.nr, 0 );

      data.proxy.arr.entries ();
      data.proxy.arr.every ( () => false );
      data.proxy.arr.filter ( () => false );
      data.proxy.arr.find ( () => false );
      data.proxy.arr.findIndex ( () => false );
      data.proxy.arr.forEach ( () => {} );
      data.proxy.arr.includes ( 1 );
      data.proxy.arr.indexOf ( 1 );
      data.proxy.arr.join ();
      data.proxy.arr.keys ();
      data.proxy.arr.lastIndexOf ( 1 );
      data.proxy.arr.map ( () => false );
      data.proxy.arr.reduce ( () => ({}) );
      data.proxy.arr.reduceRight ( () => ({}) );
      data.proxy.arr.slice ();
      data.proxy.arr.some ( () => false );
      data.proxy.arr.subarray ();
      data.proxy.arr.toLocaleString ();
      data.proxy.arr.toString ();
      data.proxy.arr.values ();

      t.is ( data.nr, 0 );

      data.proxy.arr.copyWithin ( 0, 0, 0 );

      t.is ( data.nr, 0 );

      const sampleDigit = data.proxy.arr.constructor.name.startsWith ( 'Big' ) ? 1n : 1;

      data.proxy.arr.set ([ sampleDigit ]);
      data.proxy.arr.copyWithin ( 1, 0, 1 );
      data.proxy.arr.reverse ();
      data.proxy.arr.fill ( sampleDigit );

      t.is ( data.nr, 4 );
      t.deepEqual ( data.paths, ['arr', 'arr', 'arr', 'arr'] );

    });

  });

  it ( 'map', t => {

    const data = makeData ({ map: new Map ([ ['1', 1], ['2', 2] ]) });

    data.proxy.map.constructor;
    data.proxy.map.length;
    t.is ( data.proxy.map.size, 2 );

    t.is ( data.nr, 0 );

    data.proxy.map.entries ();
    data.proxy.map.forEach ( () => {} );
    data.proxy.map.has ( '1' );
    data.proxy.map.keys ();
    data.proxy.map.values ();
    data.proxy.map.get ( '1' );

    t.is ( data.nr, 0 );

    data.proxy.map.delete ( 'none' );
    data.proxy.map.set ( '1', 1 );

    t.is ( data.nr, 0 );

    data.proxy.map.delete ( '1' );
    data.proxy.map.clear ();
    data.proxy.map.set ( '4', 4 );

    t.is ( data.nr, 3 );
    t.deepEqual ( data.paths, ['map', 'map', 'map'] );

  });

  it ( 'set', t => {

    const data = makeData ({ set: new Set ([ 1, 2 ]) });

    data.proxy.set.constructor;
    t.is ( data.proxy.set.size, 2 );

    t.is ( data.nr, 0 );

    data.proxy.set.entries ();
    data.proxy.set.forEach ( () => {} );
    data.proxy.set.has ( 1 );
    data.proxy.set.keys ();
    data.proxy.set.values ();

    t.is ( data.nr, 0 );

    data.proxy.set.delete ( 'none' );
    data.proxy.set.add ( 1 );

    t.is ( data.nr, 0 );

    data.proxy.set.add ( 3 );
    data.proxy.set.delete ( 1 );
    data.proxy.set.clear ();

    t.is ( data.nr, 3 );
    t.deepEqual ( data.paths, ['set', 'set', 'set'] );

  });

});