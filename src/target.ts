
/* IMPORT */

import {$TARGET} from './consts';

/* TARGET */

function target<Object> ( object: Object ): Object {

  return object && ( object[$TARGET] || object );

}

/* EXPORT */

export default target;
