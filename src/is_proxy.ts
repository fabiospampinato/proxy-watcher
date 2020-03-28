

/* IMPORT */

import {$IS_PROXY} from './consts';

/* IS PROXY */

function isProxy<Object> ( object: Object ): boolean {

  return !!object && ( object[$IS_PROXY] === true );

}

/* EXPORT */

export default isProxy;
