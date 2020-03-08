
/* IMPORT */

import {$STOP} from './consts';

/* UNWATCH */

function unwatch<Object> ( object: Object ): Object {

  if ( object == null ) return object;

  return object[$STOP] || object;

}

/* EXPORT */

export default unwatch;
