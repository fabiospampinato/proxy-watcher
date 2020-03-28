
/* IMPORT */

import {CONSTRUCTORS_UNSUPPORTED, CONSTRUCTORS_COMPARABLE} from '../consts';

/* IS EQUAL */

// This is basically a fork of "fast-deep-equal" but: "Object.is"-based, with support for uncomparable contructors, slightly faster

const {is, keys, prototype} = Object,
      {hasOwnProperty, toString, valueOf} = prototype;

const isEqual = ( a: any, b: any ): boolean => {

  if ( a && b && typeof a === 'object' && typeof b === 'object' ) {

    const {constructor} = a;

    if ( constructor !== b.constructor ) return false;

    let length, i, props;

    if ( CONSTRUCTORS_COMPARABLE.has ( constructor ) ) {

      if ( constructor === Array ) {

        length = a.length;

        if ( length !== b.length ) return false;

        for ( i = length; i-- !== 0; ) {

          if ( !isEqual ( a[i], b[i] ) ) return false;

        }

        return true;

      } else if ( constructor === Map ) {

        if ( a.size !== b.size ) return false;

        for ( i of a.entries () ) {

          if ( !b.has ( i[0] ) ) return false;

        }

        for ( i of a.entries () ) {

          if ( !isEqual ( i[1], b.get ( i[0] ) ) ) return false;

        }

        return true;

      } else if ( constructor === Set ) {

        if ( a.size !== b.size ) return false;

        for ( i of a.entries () ) {

          if ( !b.has ( i[0] ) ) return false;

        }

        return true;

      } else if ( constructor === RegExp ) {

        return a.flags === b.flags && a.source === b.source;

      } else {

        length = a['length'];

        if ( length !== b['length'] ) return false;

        for ( i = length; i-- !== 0; ) {

          if ( a[i] !== b[i] ) return false;

        }

        return true;

      }

    }

    if ( CONSTRUCTORS_UNSUPPORTED.has ( constructor ) ) return a === b;
    if ( a.valueOf !== valueOf ) return a.valueOf () === b.valueOf ();
    if ( a.toString !== toString ) return a.toString () === b.toString ();

    props = keys ( a );
    length = props.length;

    if ( length !== keys ( b ).length ) return false;

    for ( i = length; i-- !== 0; ) {

      if ( !hasOwnProperty.call ( b, props[i] ) ) return false;

    }

    for ( i = length; i-- !== 0; ) {

      const prop = props[i];

      if ( !isEqual ( a[prop], b[prop] ) ) return false;

    }

    return true;

  }

  return is ( a, b );

};

/* EXPORT */

export default isEqual;
