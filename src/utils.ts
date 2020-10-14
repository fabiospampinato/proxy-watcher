
/* IMPORT */

import {CONSTRUCTORS_IMMUTABLE, CONSTRUCTORS_SUPPORTED, CONSTRUCTORS_UNSUPPORTED, STRICTLY_IMMUTABLE_METHODS, LOOSELY_IMMUTABLE_METHODS} from './consts';
import clone from './packages/clone';
import cloneDeep from './packages/clone_deep';
import diff from './packages/diff';
import isEqual from './packages/is_equal';
import isNative from './packages/is_native';
import isPlainObject from './packages/is_plain_object';

/* UTILS */

const Utils = {

  clone,

  cloneDeep,

  diff,

  isEqual,

  isNative,

  isPlainObject,

  isValueUnproxiable: ( x: any ): boolean => {

    if ( x === null ) return true;

    const type = typeof x;

    if ( type !== 'object' && type !== 'function' ) return true;

    const {constructor} = x;

    return CONSTRUCTORS_IMMUTABLE.has ( constructor ) || ( !CONSTRUCTORS_SUPPORTED.has ( constructor ) && ( CONSTRUCTORS_UNSUPPORTED.has ( constructor ) || !isNative ( constructor ) ) );

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
