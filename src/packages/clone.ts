
/* IMPORT */

import * as typeOf from 'kind-of';

/* HELPERS */

const {from} = Buffer,
      {assign, create} = Object,
      {valueOf} = Symbol.prototype;

const cloneMap = ( val: Map<any, any> ): Map<any, any> => {
  const cloned = new Map ();
  for ( const [key, value] of val ) {
    cloned.set ( clone ( key ), clone ( value ) );
  }
  return cloned;
};

const cloneRegExp = ( val: RegExp ): RegExp => {
  const cloned = new RegExp ( val.source, val.flags );
  cloned.lastIndex = val.lastIndex;
  return cloned;
};

const cloneSet = ( val: Set<any> ): Set<any> => {
  const cloned = new Set ();
  for ( const value of val ) {
    cloned.add ( clone ( value ) );
  }
  return cloned;
};

/* CLONE */

// This is basically a fork of "shallow-clone" but it properly supports Maps, Sets and BigInt TypedArrays

const clone = ( val: any ): any => {

  switch ( typeOf ( val ) ) {
    case 'array':
      return val.slice ();
    case 'object':
      return assign ( {}, val );
    case 'date':
      return new Date ( val.getTime () );
    case 'map':
      return cloneMap ( val );
    case 'set':
      return cloneSet ( val );
    case 'buffer':
      return from ( val );
    case 'symbol':
      return Object ( valueOf.call ( val ) );
    case 'arraybuffer':
    case 'bigint64array':
    case 'biguint64array':
    case 'float32array':
    case 'float64array':
    case 'int16array':
    case 'int32array':
    case 'int8array':
    case 'uint16array':
    case 'uint32array':
    case 'uint8clampedarray':
    case 'uint8array':
      return val.slice ( 0 );
    case 'regexp':
      return cloneRegExp ( val );
    case 'error':
      return create ( val );
    default:
      return val;
  }

};

/* EXPORT */

export default clone;
