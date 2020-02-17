
/* CONSTS */

const PROXY_CACHE: Record<symbol, WeakMap<object, object>> = {}; //FIXME: This looks like a potential memory leak source, symbols and associated maps are never garbage collected if the watched objects get garbage collected without being disposed of first

const $TARGET = Symbol ( 'Proxy -> Target' );

const $STOP = Symbol ( 'Stop proxying' );

const $GET_RECORD_START = Symbol ( 'Start recording get paths' );

const $GET_RECORD_STOP = Symbol ( 'Stop recording get paths' );

const SUPPORTS_BIGINT_TYPED_ARRAY = ( typeof BigInt64Array === 'function' );

// We are assuming the following immutable methods don't get messed up with, and custom methods with the same name that are mutating are not defined

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

export {PROXY_CACHE, $TARGET, $STOP, $GET_RECORD_START, $GET_RECORD_STOP, SUPPORTS_BIGINT_TYPED_ARRAY, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS};
