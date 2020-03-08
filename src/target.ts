
/* IMPORT */

import {$TARGET} from './consts';

/* TARGET */

function target<Object> ( object: Object ): Object {

  if ( object == null ) return object;

  return object[$TARGET] || object;

}

/* EXPORT */

export default target;
