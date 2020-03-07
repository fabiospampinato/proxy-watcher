
/* IMPORT */

import {$GET_RECORD_START, $GET_RECORD_STOP} from './consts';

/* RECORD */

function record<Object> ( proxy: Object, fn: () => void ): string[] {

  proxy[$GET_RECORD_START];

  fn ();

  return proxy[$GET_RECORD_STOP];

}

/* EXPORT */

export default record;
