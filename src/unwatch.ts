
/* IMPORT */

import {$STOP} from './consts';

/* UNWATCH */

function unwatch<Object> ( object: Object ): Object {

  return object && ( object[$STOP] || object );

}

/* EXPORT */

export default unwatch;
