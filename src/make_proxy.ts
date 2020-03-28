
/* IMPORT */

import makeTraps from './make_traps';
import {Callback, Traps} from './types';

/* MAKE PROXY */

//TODO: Maybe use revocable Proxies, will the target object remain usable?

function makeProxy<Object> ( object: Object, callback: Callback, traps?: Traps ): Object {

  traps = traps || makeTraps ( callback );

  return new Proxy ( object, traps );

}

/* EXPORT */

export default makeProxy;
