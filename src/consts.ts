
/* CACHES */

const PROXY_CACHE: Record<symbol, WeakMap<object, object>> = {}; //FIXME: This looks like a potential memory leak source, symbols and associated maps are never garbage collected if the watched objects get garbage collected without being disposed of first

/* SYMBOLS */

const $IS_PROXY = Symbol ( 'Is Proxy' );

const $TARGET = Symbol ( 'Proxy -> Target' );

const $STOP = Symbol ( 'Stop proxying' );

const $GET_RECORD_START = Symbol ( 'Start recording get paths' );

const $GET_RECORD_STOP = Symbol ( 'Stop recording get paths' );

/* CONSTRUCTORS */

const CONSTRUCTORS_IMMUTABLE = new Set<Function> ([
  ArrayBuffer,
  Boolean,
  Error,
  Number,
  RegExp,
  String,
  Symbol
]);

const CONSTRUCTORS_MUTABLE = new Set<Function> ([ // "Array" should be included here, but then some tests will fail
  Date,
  Map,
  Set,
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array
]);

const CONSTRUCTORS_TYPED_ARRAY = new Set<Function> ([
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array
]);

const CONSTRUCTORS_UNSUPPORTED = new Set<Function> ([
  Promise,
  WeakMap,
  WeakSet
]);

if ( typeof BigInt === 'function' ) {

  CONSTRUCTORS_IMMUTABLE.add ( BigInt );

  if ( typeof BigInt64Array === 'function' ) {
    CONSTRUCTORS_MUTABLE.add ( BigInt64Array );
    CONSTRUCTORS_TYPED_ARRAY.add ( BigInt64Array );
  }

  if ( typeof BigUint64Array === 'function' ) {
    CONSTRUCTORS_MUTABLE.add ( BigUint64Array );
    CONSTRUCTORS_TYPED_ARRAY.add ( BigUint64Array );
  }

}

/* METHODS */ // We are assuming the following methods don't get messed up with, and custom methods with the same name that are mutating are not defined

const STRICTLY_IMMUTABLE_METHODS = new Set ([ // These methods don't directly mutate the object and don't return something that may cause a mutation
  /* OBJECT */
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
  /* ARRAY */
  'includes',
  'indexOf',
  'join',
  'lastIndexOf',
  'toLocaleString',
  'toString',
  /* MAP & SET */
  'has',
  /* DATE */
  'getDate',
  'getDay',
  'getFullYear',
  'getHours',
  'getMilliseconds',
  'getMinutes',
  'getMonth',
  'getSeconds',
  'getTime',
  'getTime',
  'getTimezoneOffset',
  'getUTCDate',
  'getUTCDay',
  'getUTCFullYear',
  'getUTCHours',
  'getUTCMilliseconds',
  'getUTCMinutes',
  'getUTCMonth',
  'getUTCSeconds',
  'getYear',
  /* REGEX */
  'exec',
  'test',
  /* TYPED ARRAY */
  'subarray'
]);

const LOOSELY_IMMUTABLE_METHODS = { // These methods don't directly mutate the object but could return something that may cause a mutation
  array: new Set ([
    'concat',
    'entries',
    'every',
    'filter',
    'find',
    'findIndex',
    'forEach',
    'keys',
    'map',
    'reduce',
    'reduceRight',
    'slice',
    'some',
    'values'
  ]),
  others: new Set ([
    /* MAP & SET */
    'entries',
    'forEach',
    'get',
    'keys',
    'values'
  ])
};

/* EXPORT */

export {PROXY_CACHE, $IS_PROXY, $TARGET, $STOP, $GET_RECORD_START, $GET_RECORD_STOP, CONSTRUCTORS_IMMUTABLE, CONSTRUCTORS_MUTABLE, CONSTRUCTORS_TYPED_ARRAY, CONSTRUCTORS_UNSUPPORTED, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS};
