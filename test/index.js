
/* IMPORT */

import * as _ from 'lodash';
import {describe} from 'ava-spec';
import {watch, unwatch, record, target, isProxy} from '../dist';
import * as Consts from '../dist/consts';
import Utils from '../dist/utils';
import Fixtures from '../tasks/fixtures';

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

describe ( 'Proxy Watcher', () => {

  describe ( 'watch', it => {

    it ( 'get invariants are respected', t => {

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

    it ( 'watching mutations nested inside symbols aren\'t detected', t => {

      const symbol = Symbol (),
            data = makeData ({ [symbol]: { unreachable: true } });

      t.true ( data.proxy[symbol].unreachable );

      data.proxy[symbol].unreachable = false;;

      t.false ( data.proxy[symbol].unreachable );

      t.is ( data.nr, 0 );

    });

    it ( 'assignment are also checked for equality', t => {

      const obj = {
        deep: {
          deeper: true
        }
      };

      const data = makeData ( obj );

      data.proxy.deep = { deeper: true };
      data.proxy.deep = { deeper: true };
      Object.defineProperty ( data.proxy, 'deep', Object.getOwnPropertyDescriptor ( data.proxy, 'deep' ) );
      Object.defineProperty ( data.proxy, 'deep2', { configurable: true, value: { deeper: true } } );
      Object.defineProperty ( data.proxy, 'deep2', { configurable: true, value: { deeper: true } } );

      t.is ( data.nr, 1 );

    });

    it ( 'throws when duplicate structures are encountered', t => {

      Consts.IS_DEVELOPMENT = true;

      const obj = { bool: true, arr: [{}] },
            root = { foo: obj, bar: obj },
            data = makeData ( root );

      data.proxy.foo.bool = false;

      t.deepEqual ( data.paths, ['foo.bool'] );

      t.throws ( () => {

        data.proxy.bar.bool = true;

      }, /duplicate.*"foo".*"bar"/i );

      data.proxy.foo.arr[0];
      data.proxy.foo.arr.unshift ( true );
      data.proxy.foo.arr[1];

      t.throws ( () => {

        data.proxy.foo.arr[0] = data.proxy.foo.arr[1];
        data.proxy.foo.arr[0];

      }, /duplicate.*"foo\.arr\.1".*"foo\.arr\.0"/i );

      Consts.IS_DEVELOPMENT = false;

    });

    it ( 'doesn\'t count prototype values as duplicates', t => {

      Consts.IS_DEVELOPMENT = true;

      const cls = class Foo { method () {} };

      const makeObjs = () => [
        false,
        Boolean ( false ),
        new Boolean ( false ),
        3,
        Number ( 3 ),
        new Number ( 3 ),
        3n,
        BigInt ( 3n ),
        'foo',
        String ( 'foo' ),
        new String ( 'foo' ),
        Symbol (),
        function fn () {},
        new Date (),
        /foo/i,
        {},
        [],
        new ArrayBuffer ( 12 ),
        new Int8Array ( new ArrayBuffer ( 24 ) ),
        new Uint8Array ( new ArrayBuffer ( 24 ) ),
        new Uint8ClampedArray ( new ArrayBuffer ( 24 ) ),
        new Int16Array ( new ArrayBuffer ( 24 ) ),
        new Uint16Array ( new ArrayBuffer ( 24 ) ),
        new Int32Array ( new ArrayBuffer ( 24 ) ),
        new Uint32Array ( new ArrayBuffer ( 24 ) ),
        new Float32Array ( new ArrayBuffer ( 24 ) ),
        new Float64Array ( new ArrayBuffer ( 24 ) ),
        new BigInt64Array ( new ArrayBuffer ( 24 ) ),
        new BigUint64Array ( new ArrayBuffer ( 24 ) ),
        new Map (),
        new WeakMap (),
        new Set (),
        new WeakSet (),
        Promise.resolve ( 'foo' ),
        new cls ()
      ];

      const properties = [
        'toString',
        'toString',
        'toString',
        'toFixed',
        'toFixed',
        'toFixed',
        'toString',
        'toString',
        'toUpperCase',
        'toUpperCase',
        'toUpperCase',
        Symbol.toPrimitive,
        'call',
        'toDateString',
        'test',
        'hasOwnProperty',
        'forEach',
        'slice',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'reduce',
        'entries',
        'entries',
        'entries',
        'entries',
        'then',
        'method'
      ];

      const data = makeData ({
        one: makeObjs (),
        two: makeObjs ()
      });

      properties.forEach ( ( property, index ) => {

        data.proxy.one[index][property];
        data.proxy.two[index][property];

      });

      t.pass ();

      Consts.IS_DEVELOPMENT = false;

    });

    it ( 'throws when referencing the root object', t => {

      Consts.IS_DEVELOPMENT = true;

      const root = {};

      root.root = root;
      root.deep = { root };

      const data = makeData ( root );

      t.throws ( () => {

        data.proxy.root;

      }, /reference.*watched object/i );

      t.throws ( () => {

        data.proxy.deep.root;

      }, /reference.*watched object/i );

      Consts.IS_DEVELOPMENT = false;

    });

    it ( 'basic support for circular structures', t => {

      const makeCircular = () => { const root = {}; root.root = {root}; return root; },
            circular1 = makeCircular (),
            circular2 = makeCircular ();

      t.true ( Utils.isEqual ( circular1, circular2 ) );
      t.true ( Utils.isEqual ( circular1, Utils.clone ( circular1 ) ) );
      t.true ( Utils.isEqual ( circular1, Utils.cloneDeep ( circular1 ) ) );

    });

    it ( 'has a basic diff function', t => {

      const result = Utils.diff ( Fixtures.DIFF_A (), Fixtures.DIFF_B () );

      t.true ( Utils.isEqual ( result, Fixtures.DIFF_RESULT () ) );

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

    describe ( 'structures', it => {

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

        t.is ( data.nr, 3 );
        t.deepEqual ( data.paths, ['bar'] );

        data.proxy.bar.deep = undefined;
        data.proxy.baz = undefined;
        delete data.proxy.bar.deep;
        delete data.proxy.bar.deep;
        delete data.proxy.bar;

        t.is ( data.nr, 7 );
        t.deepEqual ( data.paths, ['bar.deep', 'baz', 'bar.deep', 'bar'] );

        Object.defineProperty ( data.proxy, 'bar', { value: 2 });
        Object.defineProperty ( data.proxy, 'bar', { value: 2 });

        t.is ( data.nr, 8 );
        t.deepEqual ( data.paths, ['bar'] );

        t.true ( data.proxy.hasOwnProperty ( 'foo' ) );
        t.true ( 'foo' in data.proxy );
        t.false ( data.proxy.hasOwnProperty ( 'qux' ) );
        t.false ( 'qux' in data.proxy );

        t.is ( data.nr, 8 );

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

        t.is ( data.nr, 4 );

        data.proxy.new.bool = true;
        data.proxy.new.str = 'string';
        data.proxy.new.nr = 123;

        t.is ( data.nr, 7 );
        t.deepEqual ( data.paths, ['new.bool', 'new.str', 'new.nr'] );

        delete data.proxy.fn.bool;
        delete data.proxy.fn.str;
        delete data.proxy.fn.nr;
        delete data.proxy.new.bool;
        delete data.proxy.new.str;
        delete data.proxy.new.nr;

        t.is ( data.nr, 13 );
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

        data.proxy.fn ();

        const {fn} = data.proxy;

        fn ();

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

        t.is ( data.nr, 10 );
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

      it ( 'weakmap', t => {

        const data = makeData ({ weakmap: new WeakMap () });

        t.is ( data.proxy.weakmap.constructor.name, 'WeakMap' );

        data.proxy.weakmap.has ( 'foo' );

        t.is ( data.nr, 0 );

        data.proxy.weakmap = data.proxy.weakmap;

        t.is ( data.nr, 0 );

        data.proxy.weakmap = new WeakMap ();

        t.is ( data.nr, 1 );

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

      it ( 'weakset', t => {

        const data = makeData ({ weakset: new WeakSet () });

        t.is ( data.proxy.weakset.constructor.name, 'WeakSet' );

        data.proxy.weakset.has ( 'foo' );

        t.is ( data.nr, 0 );

        data.proxy.weakset = data.proxy.weakset;

        t.is ( data.nr, 0 );

        data.proxy.weakset = new WeakSet ();

        t.is ( data.nr, 1 );

      });

      it ( 'promise', async t => {

        const data = makeData ({
          string: Promise.resolve ( 'string' ),
          number: Promise.resolve ( 123 ),
          arr: Promise.resolve ([ 1, 2, 3 ]),
          obj: Promise.resolve ({ foo: true }),
          set: Promise.resolve ( new Set ([ 1, 2, 3 ]) ),
          deep: Promise.resolve ( Promise.resolve ({ deep: true }) ),
        });

        t.is ( await data.proxy.string, 'string' );
        t.is ( await data.proxy.number, 123 );
        t.deepEqual ( await data.proxy.arr, [1, 2, 3] );
        t.deepEqual ( await data.proxy.obj, { foo: true } );
        t.deepEqual ( await data.proxy.set, new Set ([ 1, 2, 3 ]) );
        t.deepEqual ( await data.proxy.deep, { deep: true } );
        t.is ( data.nr, 0 );

        data.proxy.string = data.proxy.string;
        data.proxy.number = data.proxy.number;
        data.proxy.arr = data.proxy.arr;
        data.proxy.obj = data.proxy.obj;
        data.proxy.set = data.proxy.set;
        data.proxy.deep = data.proxy.deep;
        t.is ( data.nr, 0 );

        data.proxy.arr.then ( arr => arr[0] = 1 );
        data.proxy.obj.then ( obj => obj.foo = true );
        data.proxy.set.then ( set => set.delete ( 4 ) );
        data.proxy.set.then ( set => set.has ( 4 ) );
        data.proxy.deep.then ( obj => obj.deep = true );
        t.is ( data.nr, 0 );

        data.proxy.string = Promise.resolve ( 'string' );
        data.proxy.number = Promise.resolve ( 123 );
        data.proxy.arr = Promise.resolve ([ 1, 2, 3 ]);
        data.proxy.obj = Promise.resolve ({ foo: true });
        data.proxy.set = Promise.resolve ( new Set ([ 1, 2, 3 ]) );
        data.proxy.deep = Promise.resolve ( Promise.resolve ({ deep: true }) );
        t.is ( data.nr, 6 );

        // data.proxy.arr.then ( arr => arr[0] = 2 );
        // data.proxy.arr.then ( arr => arr.push ( 4 ) );
        // data.proxy.obj.then ( obj => obj.foo = false );
        // data.proxy.set.then ( set => set.delete ( 1 ) );
        // data.proxy.deep.then ( obj => obj.deep = false );
        // t.is ( data.nr, 11 ); //TODO: Detect changes happening inside promises

      });

      it ( 'custom class', t => {

        class Custom {
          map = new Map ([[ 'one', 1 ]]);
          foo () {}
        }

        const data = makeData ({ custom: new Custom () });

        t.is ( data.proxy.custom.constructor.name, 'Custom' );

        data.proxy.custom.map.has ( 'foo' );
        data.proxy.custom.map.set ( 'two', 2 );

        t.is ( data.nr, 0 );

        data.proxy.custom = data.proxy.custom;

        t.is ( data.nr, 0 );

        data.proxy.custom = new Custom ();

        t.is ( data.nr, 1 );

      });

    });

  });

  describe ( 'unwatch', it => {

    it ( 'stops watching', t => {

      const obj = {
        deep: {
          deeper: true
        }
      };

      const data = makeData ( obj );

      data.proxy.deep.deeper = false; // In order to deeply proxy

      t.is ( data.nr, 1 );

      const target = unwatch ( data.proxy );

      t.is ( target, obj );

      data.proxy.foo = true;
      data.proxy.deep.foo = true;
      data.proxy.deep.deeper = { foo: true };
      delete data.proxy.deep;

      t.is ( data.nr, 1 );

    });

    it ( 'unwatching immutable ~primitives doesn\'t throw an error', t => {

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

      values.forEach ( value => t.is ( value, unwatch ( value ) ) );

    });

  });

  describe ( 'record', it => {

    it ( 'can record get root paths of a single proxy', t => {

      const data = makeData ({
        deep: {
          arr: [1, 2, { foo: true }, { zzz: true }]
        }
      });

      const paths = record ( data.proxy, proxy => {

        t.is ( data.proxy, proxy );

        data.proxy.deep.arr[0] = 1;
        data.proxy.deep.arr[1] = 2;
        data.proxy.deep.arr[2].foo = true;
        data.proxy.deep.arr[2].bar;

      });

      t.deepEqual ( paths, ['deep', 'deep', 'deep', 'deep'] );

    });

    it ( 'can record get root paths of multiple proxies', t => {

      const data1 = makeData ({
        foo: 123
      });

      const data2 = makeData ({
        deep: {
          arr: [1, 2, { foo: true }, { zzz: true }]
        }
      });

      const data3 = makeData ({
        bar: true
      });

      const pathsMap = record ( [data1.proxy, data2.proxy, data3.proxy], ( proxy1, proxy2, proxy3 ) => {

        t.is ( data1.proxy, proxy1 );
        t.is ( data2.proxy, proxy2 );
        t.is ( data3.proxy, proxy3 );

        proxy1.foo;

        proxy2.deep.arr[0] = 1;
        proxy2.deep.arr[1] = 2;
        proxy2.deep.arr[2].foo = true;
        proxy2.deep.arr[2].bar;

      });

      t.is ( pathsMap.size, 3 );
      t.deepEqual ( pathsMap.get ( data1.proxy ), ['foo'] );
      t.deepEqual ( pathsMap.get ( data2.proxy ), ['deep', 'deep', 'deep', 'deep'] );
      t.deepEqual ( pathsMap.get ( data3.proxy ), [] );

    });

  });

  describe ( 'target', it => {

    it ( 'retrieves the row unproxied object', t => {

      const obj = { foo: true },
            data = makeData ( obj );

      t.not ( data.proxy, obj );
      t.is ( target ( data.proxy ), obj );

    });

  });

  describe ( 'isProxy', it => {

    it ( 'checks if the passed object is a proxy', t => {

      const obj = { foo: true },
            data = makeData ( obj );

      t.false ( isProxy ( obj ) );
      t.false ( isProxy ( target ( data.proxy ) ) );
      t.true ( isProxy ( data.proxy ) );

    });

    it ( 'using immutable ~primitives doesn\'t throw an error', t => {

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

      values.forEach ( value => t.false ( isProxy ( value ) ) );

    });

  });

});
