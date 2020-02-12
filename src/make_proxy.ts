
/* IMPORT */

import {PROXY_CACHE} from './consts';
import makeTraps from './make_traps';
import {Callback, Traps} from './types';

/* MAKE PROXY */

//TODO: Maybe use revocable Proxies, will the target object remain usable?

function makeProxy<Object> ( object: Object, callback: Callback, $PROXY?: symbol, traps?: Traps ): Object {

  if ( $PROXY ) {

    const proxy = PROXY_CACHE[$PROXY].get ( object );

    if ( proxy ) return proxy;

  } else {

    $PROXY = Symbol ( 'Target -> Proxy' );

    PROXY_CACHE[$PROXY] = new WeakMap ();

  }

  traps = traps || makeTraps ( callback, $PROXY );

  const proxy = new Proxy ( object, traps );

  PROXY_CACHE[$PROXY].set ( object, proxy );

  return proxy;

}

/* EXPORT */

export default makeProxy;
