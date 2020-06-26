
/* IMPORT */

import TrapsHelpers from './traps_helpers';
import {Callback, Traps} from './types';

/* MAKE TRAPS */

function makeTraps<Object> ( object: Object, callback: Callback ): Traps {

  return new TrapsHelpers ( object, callback ).traps;

}

/* EXPORT */

export default makeTraps;
