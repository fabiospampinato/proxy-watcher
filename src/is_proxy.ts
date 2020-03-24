

/* IMPORT */

import {$IS_PROXY} from './consts';

/* IS PROXY */

function isProxy<Object> ( object: Object ): boolean {

  if ( object == null ) return false;

  return object[$IS_PROXY] === true;

}

/* EXPORT */

export default isProxy;
