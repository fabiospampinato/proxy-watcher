
/* IMPORT */

import * as _ from 'lodash'; //TODO: Replace lodash with something lighter
import * as isEqual from 'fast-deep-equal/es6';
import * as isPrimitive from 'is-primitive';
import {$TARGET, CONSTRUCTORS_IMMUTABLE, CONSTRUCTORS_MUTABLE, CONSTRUCTORS_TYPED_ARRAY, CONSTRUCTORS_UNSUPPORTED, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS} from './consts';

/* UTILS */

const Utils = {

  isEqual: ( x: any, y: any ): boolean => {

    return ( isPrimitive ( x ) || isPrimitive ( y ) || CONSTRUCTORS_UNSUPPORTED.has ( x.constructor ) || CONSTRUCTORS_UNSUPPORTED.has ( y.constructor ) ) ? Object.is ( x, y ) : isEqual ( x ,y );

  },

  clone: <T> ( x: T ): T => _.cloneWith ( x, Utils.cloneCustomizer ),

  cloneDeep: <T> ( x: T ): T => _.cloneDeepWith ( x, Utils.cloneCustomizer ),

  cloneCustomizer: <T> ( value: T ): T | undefined => {

    if ( Utils.isTypedArray ( value ) ) return ( value[$TARGET] || value ).slice (); //FIXME: https://github.com/lodash/lodash/issues/4646

  },

  isArray: ( x: any ): x is Array<any> => {

    return Array.isArray ( x );

  },

  isFunction: ( x: any ): x is Function => {

    return typeof x === 'function';

  },

  isSymbol: ( x: any ): x is symbol => {

    return typeof x === 'symbol';

  },

  isTypedArray: ( x: any ): boolean => {

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

  isStrictlyImmutableMethod: ( target: any, method: Function ): boolean => { //TODO: Maybe perform "instanceof" checks, for correctness

    const {name} = method;

    if ( !name ) return false;

    return STRICTLY_IMMUTABLE_METHODS.has ( name );

  },

  isLooselyImmutableMethod: ( target: any, method: Function ): boolean => {

    const {name} = method;

    if ( !name ) return false;

    if ( Utils.isArray ( target ) ) return LOOSELY_IMMUTABLE_METHODS.array.has ( name );

    // return LOOSELY_IMMUTABLE_METHODS.others.has ( name ); // For some reason mutations generated via these methods from Map or Set objects don't get detected

    return false;

  }

};

/* EXPORT */

export default Utils;
