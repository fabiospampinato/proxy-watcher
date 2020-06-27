
/* IMPORT */

import makeTraps from './make_traps';
import unwatch from './unwatch';
import Utils from './utils';
import {Callback, Disposer} from './types';

/* WATCH */

function watch<Object> ( object: Object, callback: Callback ): [Object, Disposer<Object>] {

  if ( Utils.isValueUnproxiable ( object ) ) return [object, () => object];

  const proxy = new Proxy ( object, makeTraps ( object, callback ) ),
        disposer: Disposer<Object> = () => unwatch ( proxy );

  return [proxy, disposer];

}

/* EXPORT */

export default watch;
