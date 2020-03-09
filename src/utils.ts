
/* IMPORT */

import * as clone from 'shallow-clone';
import * as isEqual from 'fast-deep-equal/es6';
import * as isPrimitive from 'is-primitive';
import {CONSTRUCTORS_IMMUTABLE, CONSTRUCTORS_MUTABLE, CONSTRUCTORS_TYPED_ARRAY, CONSTRUCTORS_UNSUPPORTED, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS} from './consts';

/* UTILS */

const Utils = {

  isEqual: ( x: any, y: any ): boolean => {

    return ( isPrimitive ( x ) || isPrimitive ( y ) || CONSTRUCTORS_UNSUPPORTED.has ( x.constructor ) || CONSTRUCTORS_UNSUPPORTED.has ( y.constructor ) ) ? Object.is ( x, y ) : isEqual ( x ,y ); //FIXME: https://github.com/epoberezkin/fast-deep-equal/issues/53

  },

  clone: <T> ( x: T ): T => {

    if ( isPrimitive ( x ) ) return x;

    if ( x instanceof Map ) {

      const y = new Map ();

      for ( const [key, value] of x ) y.set ( clone ( key ), clone ( value ) );

      return y as typeof x; //TSC

    }

    if ( x instanceof Set ) {

      const y = new Set ();

      for ( const value of x ) y.add ( clone ( value ) );

      return y as typeof x; //TSC

    }

    if ( Utils.isTypedArray ( x ) ) return x.slice () as typeof x; //TSC

    return clone ( x );

  },

  isFunction: ( x: any ): x is Function => {

    return typeof x === 'function';

  },

  isSymbol: ( x: any ): x is symbol => {

    return typeof x === 'symbol';

  },

  isTypedArray: ( x: any ): x is Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array => {

    return !isPrimitive ( x ) && CONSTRUCTORS_TYPED_ARRAY.has ( x.constructor );

  },

  isBuiltinUnsupported: ( x: any ): boolean => {

    return !isPrimitive ( x ) && CONSTRUCTORS_UNSUPPORTED.has ( x.constructor );

  },

  isBuiltinWithoutMutableMethods: ( x: any ): boolean => {

    return isPrimitive ( x ) || CONSTRUCTORS_IMMUTABLE.has ( x.constructor );

  },

  isBuiltinWithMutableMethods: ( x: any ): boolean => {

    return !isPrimitive ( x ) && CONSTRUCTORS_MUTABLE.has ( x.constructor );

  },

  isStrictlyImmutableMethod: ( method: Function ): boolean => { //TODO: Maybe perform "instanceof" checks, for correctness

    return STRICTLY_IMMUTABLE_METHODS.has ( method.name );

  },

  isLooselyImmutableArrayMethod: ( method: Function ): boolean => { // It assumes `target` is an array

    return LOOSELY_IMMUTABLE_METHODS.array.has ( method.name );

  }

};

/* EXPORT */

export default Utils;
