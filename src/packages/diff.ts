
/* IMPORT */

import {CONSTRUCTORS_SUPPORTED, CONSTRUCTORS_UNSUPPORTED} from '../consts';
import isEqual from './is_equal';
import isNative from './is_native';
import isPlainObject from './is_plain_object';

/* HELPERS */

const {assign} = Object;

/* DIFF */

const diff = ( a: any, b: any, prefix: string = '' ) => {

  const added: Record<string, any> = {},
        deleted: Record<string, any> = {},
        updated: Record<string, any> = {};

  if ( isPlainObject ( a ) && isPlainObject ( b ) ) {

    for ( const key in a ) {

      if ( !b.hasOwnProperty ( key ) ) {

        deleted[`${prefix}${prefix ? '.' : ''}${key}`] = a[key];

      } else {

        const result = diff ( a[key], b[key], `${prefix}${prefix ? '.' : ''}${key}` );

        assign ( added, result.added );
        assign ( deleted, result.deleted );
        assign ( updated, result.updated );

      }

    }

    for ( const key in b ) {

      if ( a.hasOwnProperty ( key ) ) continue;

      added[`${prefix}${prefix ? '.' : ''}${key}`] = b[key];

    }

  } else if ( prefix ) {

    const constructorA = a && a.constructor,
          constructorB = b && a.constructor;

    if ( !( constructorA && !CONSTRUCTORS_SUPPORTED.has ( constructorA ) && ( CONSTRUCTORS_UNSUPPORTED.has ( constructorA ) || !isNative ( constructorA ) ) ) && !( constructorB && !CONSTRUCTORS_SUPPORTED.has ( constructorB ) && ( CONSTRUCTORS_UNSUPPORTED.has ( constructorB ) || !isNative ( constructorB ) ) ) && !isEqual ( a, b ) ) {

      updated[prefix] = {
        before: a,
        after: b
      };

    }

  }

  return {added, deleted, updated};

};

/* EXPORT */

export default diff;
