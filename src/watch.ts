
/* IMPORT */

import makeProxy from './make_proxy';
import unwatch from './unwatch';
import Utils from './utils';
import {Callback, Disposer} from './types';

/* WATCH */

function watch<Object> ( object: Object, callback: Callback ): [Object, Disposer<Object>] {

  if ( Utils.isBuiltinWithoutMutableMethods ( object ) ) return [object, () => object];

  const proxy = makeProxy ( object, callback ),
        disposer: Disposer<Object> = () => unwatch ( proxy );

  return [proxy, disposer];

}

/* EXPORT */

export default watch;
