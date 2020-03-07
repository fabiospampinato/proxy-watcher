
/* IMPORT */

import {$STOP} from './consts';
import Utils from './utils';

/* UNWATCH */

function unwatch<Object> ( object: Object ): Object {

  if ( object == null ) return object;

  const target = object[$STOP];

  if ( Utils.isUndefined ( target ) ) return object;

  return target;

}

/* EXPORT */

export default unwatch;
