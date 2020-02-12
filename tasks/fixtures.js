
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

/* EXPORT */

module.exports = {NOOP, OBJ};
