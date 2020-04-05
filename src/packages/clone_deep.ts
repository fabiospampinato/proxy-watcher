
/* IMPORT */

import * as typeOf from 'kind-of';

/* HELPERS */

const {from} = Buffer,
      {create} = Object,
      {valueOf} = Symbol.prototype;

const cloneDeepArray = ( val: any[], circularMap: Map<any, any> ): any[] => {
  const {length} = val;
  const cloned = new Array ( length );
  circularMap.set ( val, cloned );
  for ( let i = 0; i < length; i++ ) {
    cloned[i] = cloneDeep ( val[i], circularMap );
  }
  return cloned;
};

const cloneDeepMap = ( val: Map<any, any>, circularMap: Map<any, any> ): Map<any, any> => {
  const cloned = new Map ();
  circularMap.set ( val, cloned );
  for ( const [key, value] of val ) {
    cloned.set ( cloneDeep ( key, circularMap ), cloneDeep ( value, circularMap ) );
  }
  return cloned;
};

const cloneDeepObject = ( val: object, circularMap: Map<any, any> ): object => {
  const cloned = {};
  circularMap.set ( val, cloned );
  for ( const key in val ) {
    cloned[key] = cloneDeep ( val[key], circularMap );
  }
  return cloned;
};

const cloneRegExp = ( val: RegExp ): RegExp => {
  const cloned = new RegExp ( val.source, val.flags );
  cloned.lastIndex = val.lastIndex;
  return cloned;
};

const cloneDeepSet = ( val: Set<any>, circularMap: Map<any, any> ): Set<any> => {
  const cloned = new Set ();
  circularMap.set ( val, cloned );
  for ( const value of val ) {
    cloned.add ( cloneDeep ( value, circularMap ) );
  }
  return cloned;
};

/* CLONE DEEP */

// This is just a deep version of "clone"

const cloneDeepNew = ( val: any, circularMap: Map<any, any> ): any => {

  switch ( typeOf ( val ) ) {
    case 'array':
      return cloneDeepArray ( val, circularMap );
    case 'object':
      return cloneDeepObject ( val, circularMap );
    case 'date':
      return new Date ( val.getTime () );
    case 'map':
      return cloneDeepMap ( val, circularMap );
    case 'set':
      return cloneDeepSet ( val, circularMap );
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

const cloneDeep = ( val: any, _circularMap?: Map<any, any> ): any => {

  const circularMap = _circularMap || new Map (), // Storing references to potentially circular objects
        circularClone = circularMap.get ( val );

  if ( circularClone ) return circularClone;

  return cloneDeepNew ( val, circularMap );

};

/* EXPORT */

export default cloneDeep;
