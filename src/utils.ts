
/* IMPORT */

import * as _ from 'lodash'; //TODO: Replace lodash with something lighter
import * as isPrimitive from 'is-primitive';
import {$TARGET, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS} from './consts';

/* UTILS */

const Utils = {

  isEqual: _.isEqual,

  clone: <T> ( x: T ): T => {

    return _.cloneWith ( x, value => {
      if ( !isPrimitive ( value ) && Utils.isTypedArray ( value ) ) return ( value[$TARGET] || value ).slice (); //FIXME: https://github.com/lodash/lodash/issues/4646
    });

  },

  isFunction: ( x: any ): x is Function => {

    return typeof x === 'function';

  },

  isSymbol: ( x: any ): x is symbol => {

    return typeof x === 'symbol'

  },

  isTypedArray: ( x: any ): boolean => {

    return x instanceof Int8Array || x instanceof Uint8Array || x instanceof Uint8ClampedArray || x instanceof Int16Array || x instanceof Uint16Array || x instanceof Int32Array || x instanceof Uint32Array || x instanceof Float32Array || x instanceof Float64Array || x instanceof BigInt64Array || x instanceof BigUint64Array;

  },

  isBuiltinWithoutMutableMethods: ( x: any ): boolean => {

    return isPrimitive ( x ) || x instanceof RegExp || x instanceof ArrayBuffer || x instanceof Number || x instanceof Boolean || x instanceof String;

  },

  isBuiltinWithMutableMethods: ( x: any ): boolean => {

    return !isPrimitive ( x ) && ( x instanceof Date || x instanceof Map || x instanceof Set || Utils.isTypedArray ( x ) ); // "Array" should be included this, but then some tests will fail

  },

  isStrictlyImmutableMethod: ( target: any, method: Function ): boolean => { //TODO: Maybe perform "instanceof" checks, for correctness

    const {name} = method;

    if ( !name ) return false;

    return STRICTLY_IMMUTABLE_METHODS.has ( name );

  },

  isLooselyImmutableMethod: ( target: any, method: Function ): boolean => {

    const {name} = method;

    if ( !name ) return false;

    if ( Array.isArray ( target ) ) return LOOSELY_IMMUTABLE_METHODS.array.has ( name );

    // return LOOSELY_IMMUTABLE_METHODS.others.has ( name ); // For some reason mutations generated via these methods from Map or Set objects don't get detected

    return false;

  }

};

/* EXPORT */

export default Utils;
