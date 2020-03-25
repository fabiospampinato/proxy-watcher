
/* IMPORT */

import {$GET_RECORD_START, $GET_RECORD_STOP} from './consts';
import isProxy from './is_proxy';

/* RECORD */

function record<P1, P2, P3, P4, P5, P6, P7, P8, P9> ( proxies: [P1, P2, P3, P4, P5, P6, P7, P8, P9], fn: ( ...proxies: [P1, P2, P3, P4, P5, P6, P7, P8, P9] ) => any ): Map<P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9, string[]>;
function record<P1, P2, P3, P4, P5, P6, P7, P8> ( proxies: [P1, P2, P3, P4, P5, P6, P7, P8], fn: ( ...proxies: [P1, P2, P3, P4, P5, P6, P7, P8] ) => any ): Map<P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8, string[]>;
function record<P1, P2, P3, P4, P5, P6, P7> ( proxies: [P1, P2, P3, P4, P5, P6, P7], fn: ( ...proxies: [P1, P2, P3, P4, P5, P6, P7] ) => any ): Map<P1 | P2 | P3 | P4 | P5 | P6 | P7, string[]>;
function record<P1, P2, P3, P4, P5, P6> ( proxies: [P1, P2, P3, P4, P5, P6], fn: ( ...proxies: [P1, P2, P3, P4, P5, P6] ) => any ): Map<P1 | P2 | P3 | P4 | P5 | P6, string[]>;
function record<P1, P2, P3, P4, P5> ( proxies: [P1, P2, P3, P4, P5], fn: ( ...proxies: [P1, P2, P3, P4, P5] ) => any ): Map<P1 | P2 | P3 | P4 | P5, string[]>;
function record<P1, P2, P3, P4> ( proxies: [P1, P2, P3, P4], fn: ( ...proxies: [P1, P2, P3, P4] ) => any ): Map<P1 | P2 | P3 | P4, string[]>;
function record<P1, P2, P3> ( proxies: [P1, P2, P3], fn: ( ...proxies: [P1, P2, P3] ) => any ): Map<P1 | P2 | P3, string[]>;
function record<P1, P2> ( proxies: [P1, P2], fn: ( ...proxies: [P1, P2] ) => any ): Map<P1 | P2, string[]>;
function record<Object> ( proxy: Object, fn: ( proxy: Object ) => void ): string[];
function record<Object> ( proxy: Object | Object[], fn: (( proxy: Object ) => void) | (( ...proxies: Object[] ) => void) ) {

  if ( Array.isArray ( proxy ) && !isProxy ( proxy ) ) {

    const paths = new Map (),
          {length} = proxy;

    for ( let i = 0; i < length; i++ ) {

      proxy[i][$GET_RECORD_START];

    }

    fn.apply ( undefined, proxy );

    for ( let i = 0; i < length; i++ ) {

      paths.set ( proxy[i], proxy[i][$GET_RECORD_STOP] );

    }

    return paths;

  } else {

    proxy[$GET_RECORD_START];

    fn ( proxy as Object ); //TSC

    return proxy[$GET_RECORD_STOP];

  }

}

/* EXPORT */

export default record;
