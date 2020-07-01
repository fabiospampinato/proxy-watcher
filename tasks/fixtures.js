
/* FIXTURES */

const NOOP = () => {};

const OBJ = () => ({
  str: 'string',
  null: null,
  undefined: undefined,
  nr: 123,
  bigint: 10n,
  symbol: Symbol (),
  re: /foo/g,
  fn: function () {},
  arr: [1, 2, 3, {}],
  arrBuf: new ArrayBuffer ( 12 ),
  arrTyped: new Int8Array ( new ArrayBuffer ( 24 ) ),
  obj: {
    deep: {
      deeper: true
    }
  },
  date: new Date (),
  map: new Map ([ ['1', 1], ['2', 2] ]),
  set: new Set ([ 1, 2, 3 ])
});

const CLS = new class {};

const DIFF_A = () => ({
  foo: {
    bar: {
      a: ['a', 'b'],
      b: 2,
      c: ['x', 'y'],
      e: 100
    }
  },
  primitive: 123,
  buzz: 'world',
  map: new Map ([[ 1, 1 ]]),
  map2: new Map ([[ 1, 1 ]]),
  cls: CLS,
  cls2: new class {}
});

const DIFF_B = () => ({
  foo: {
    bar: {
      a: ['a'],
      b: 2,
      c: ['x', 'y', 'z'],
      d: 'Hello, world!',
      f: 123
    }
  },
  primitive: null,
  buzz: 'fizz',
  map: new Map ([[ 1, 1 ]]),
  map2: new Map ([[ 2, 2 ]]),
  cls2: new class {}
});

const DIFF_RESULT = () => ({
  added: {
    'foo.bar.d': 'Hello, world!',
    'foo.bar.f': 123,
  },
  deleted: {
    'foo.bar.e': 100,
    'cls': CLS
  },
  updated: {
    'foo.bar.a': {
      before: ['a', 'b'],
      after: ['a']
    },
    'foo.bar.c': {
      before: ['x', 'y'],
      after: ['x', 'y', 'z']
    },
    'primitive': {
      before: 123,
      after: null
    },
    'buzz': {
      before: 'world',
      after: 'fizz'
    },
    'map2': {
      before: new Map ([[ 1, 1 ]]),
      after: new Map ([[ 2, 2 ]])
    }
  }
});

/* EXPORT */

module.exports = {NOOP, OBJ, DIFF_A, DIFF_B, DIFF_RESULT};
