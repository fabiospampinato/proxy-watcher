
/* IMPORT */

import {IS_DEVELOPMENT, $IS_PROXY, $TARGET, $STOP, $GET_RECORD_START, $GET_RECORD_STOP} from './consts';
import makeProxy from './make_proxy';
import getTarget from './target';
import Utils from './utils';
import {Callback, Trap, Traps} from './types';

/* MAKE TRAPS */

function makeTraps<Object> ( object: Object, callback: Callback ): Traps {

  /* VARIABLES */

  let stopped = false,
      changed = false,
      changedPaths: string[] = [],
      getPathsRecording = false,
      getPaths: string[] = [],
      paths = new WeakMap<object, string> (),
      proxies = new WeakMap<object, object> ();

  /* HELPERS */

  function triggerChange<T> ( result: T, path: string ): T {

    changed = true;
    changedPaths.push ( path );

    return result;

  }

  function checkChildPathDuplicate ( child: object, childPath: string ) {

    const childPathPrev = paths.get ( child );

    if ( childPath === childPathPrev ) return;

    if ( !childPathPrev ) return;

    throw new Error ( `Duplicate object encountered, previously at path "${childPathPrev}" and now at path "${childPath}", you either have multiple references to it or are moving it around. Duplicate objects in a watched object are not supported as this library would need to eagerly traverse the entire watched object in order to discover these duplicates so that it can properly infer all the paths that changed, this is too expensive so this library throws an error when duplicated sturctures are encountered.` );

  }

  function checkChildIsRoot ( child: any ) {

    if ( child !== object ) return;

    throw new Error ( `A reference to the whole watched object has been found at path "${paths.get ( child )}", this is unsupported.` );

  }

  function getParentPath ( parent: object ): string {

    return paths.get ( parent ) || '';

  }

  function getChildPath ( parent: object, path: string | number ): string {

    const parentPath = getParentPath ( parent ),
          childPath = parentPath ? `${parentPath}.${path}` : `${path}`;

    return childPath;

  }

  function setChildPath ( parent: object, child: object, path: string | number ): void {

    const childPath = getChildPath ( parent, path );

    if ( IS_DEVELOPMENT ) checkChildPathDuplicate ( child, childPath );

    paths.set ( child, childPath );

  }

  function wrapTrap ( trap: Trap ) { //TSC

    let depth = 0;

    return function trapWrapper () {

      depth++;

      const result = trap.apply ( undefined, arguments );

      depth--;

      if ( changed && !depth && !stopped ) {

        const paths = changedPaths;

        changed = false;
        changedPaths = [];

        callback ( paths );

      }

      return result;

    };

  }

  /* TRAPS */

  const traps: Traps = {

    get: wrapTrap (( target, property, receiver ) => {

      if ( property === 'constructor' ) return target.constructor;

      if ( property === $TARGET ) return target;

      if ( property === $GET_RECORD_START ) return getPathsRecording = true;

      if ( property === $GET_RECORD_STOP ) {

        const paths = getPaths;

        getPathsRecording = false;
        getPaths = [];

        return paths;

      }

      if ( property === $IS_PROXY ) return true;

      if ( property === $STOP ) {

        stopped = true;
        changedPaths = undefined as any; //TSC
        paths = undefined as any; //TSC

        return target;

      }

      if ( Utils.isBuiltinWithMutableMethods ( receiver ) ) receiver = receiver[$TARGET];

      if ( getPathsRecording && !getParentPath ( target ) ) getPaths.push ( property ); // We are only recording root paths, because I don't see a use case for recording deeper paths too

      const value = Reflect.get ( target, property, receiver );

      if ( Utils.isBuiltinWithoutMutableMethods ( value ) ) return value;

      const descriptor = Reflect.getOwnPropertyDescriptor ( target, property );

      if ( descriptor && !descriptor.configurable && !descriptor.writable ) return value; // Preserving invariants

      if ( stopped || typeof property === 'symbol' || Utils.isObjectUnsupported ( value ) ) return value;

      if ( typeof value === 'function' && Utils.isStrictlyImmutableMethod ( value ) ) return value.bind ( target ); //FIXME: Binding here prevents the function to be potentially re-bounded later

      setChildPath ( target, value, property );

      if ( IS_DEVELOPMENT ) checkChildIsRoot ( value );

      const proxyCached = proxies.get ( value );

      if ( proxyCached ) return proxyCached;

      const proxy = makeProxy ( value, callback, traps );

      proxies.set ( value, proxy );

      return proxy;

    }),

    set: wrapTrap (( target, property, value, receiver ) => {

      value = getTarget ( value );

      if ( stopped || typeof property === 'symbol' ) return Reflect.set ( target, property, value );

      if ( Utils.isBuiltinWithMutableMethods ( receiver ) ) receiver = receiver[$TARGET];

      const isValueUndefined = ( value === undefined ),
            didPropertyExist = isValueUndefined && Reflect.has ( target, property ),
            prev = Reflect.get ( target, property, receiver ),
            result = Reflect.set ( target, property, value ),
            changed = result && ( ( isValueUndefined && !didPropertyExist ) || !Utils.isEqual ( getTarget ( prev ), value ) );

      return changed ? triggerChange ( result, getChildPath ( target, property ) ) : result;

    }),

    defineProperty: wrapTrap (( target, property, descriptor ) => {

      if ( stopped || typeof property === 'symbol' ) return Reflect.defineProperty ( target, property, descriptor );

      const prev = Reflect.getOwnPropertyDescriptor ( target, property ),
            changed = Reflect.defineProperty ( target, property, descriptor );

      if ( changed ) {

        const next = { configurable: false, enumerable: false, writable: false, ...descriptor }; // Accounting for defaults

        if ( Utils.isEqual ( prev, next ) ) return true;

      }

      return changed ? triggerChange ( changed, getChildPath ( target, property ) ) : changed;

    }),

    deleteProperty: wrapTrap (( target, property ) => {

      if ( !Reflect.has ( target, property ) ) return true;

      const changed = Reflect.deleteProperty ( target, property );

      if ( stopped || typeof property === 'symbol' ) return changed;

      return changed ? triggerChange ( changed, getChildPath ( target, property ) ) : changed;

    }),

    apply: wrapTrap (( target, thisArg, args ) => {

      const isArray = Array.isArray ( thisArg );

      if ( !isArray ) thisArg = thisArg[$TARGET];

      if ( stopped || ( isArray && Utils.isLooselyImmutableArrayMethod ( target ) ) ) return Reflect.apply ( target, thisArg, args );

      const thisArgTarget = ( isArray ? thisArg[$TARGET] : thisArg ),
            clone = Utils.clone ( thisArgTarget ),
            result = Reflect.apply ( target, thisArg, args ),
            changed = !Utils.isEqual ( clone, thisArgTarget );

      return changed ? triggerChange ( result, getParentPath ( thisArgTarget ) ) : result;

    })

  };

  return traps;

}

/* EXPORT */

export default makeTraps;
