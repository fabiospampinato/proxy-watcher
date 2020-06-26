
/* IMPORT */

import * as isPrimitive from 'is-primitive';
import {CONSTRUCTORS_IMMUTABLE, CONSTRUCTORS_MUTABLE, CONSTRUCTORS_SUPPORTED, CONSTRUCTORS_UNSUPPORTED, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS} from './consts';
import clone from './packages/clone';
import cloneDeep from './packages/clone_deep';
import isEqual from './packages/is_equal';
import isNative from './packages/is_native';

/* UTILS */

const Utils = {

  clone,

  cloneDeep,

  isEqual,

  isNative,

  isObjectUnsupported: ( x: any ): boolean => { // It assumes `x` is an object

    const {constructor} = x;

    return !CONSTRUCTORS_SUPPORTED.has ( constructor ) && ( CONSTRUCTORS_UNSUPPORTED.has ( constructor ) || !isNative ( constructor ) );

  },

  isBuiltinWithoutMutableMethods: ( x: any ): boolean => {

    return isPrimitive ( x ) || CONSTRUCTORS_IMMUTABLE.has ( x.constructor );

  },

  isBuiltinWithMutableMethods: ( x: any ): boolean => {

    return x != null && CONSTRUCTORS_MUTABLE.has ( x.constructor );

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
