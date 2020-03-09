
/* IMPORT */

import {PROXY_CACHE, $TARGET, $STOP, $GET_RECORD_START, $GET_RECORD_STOP} from './consts';
import makeProxy from './make_proxy';
import getTarget from './target';
import Utils from './utils';
import {Callback, Trap, Traps} from './types';

/* MAKE TRAPS */

function makeTraps ( callback: Callback, $PROXY: symbol ): Traps {

  /* VARIABLES */

  let stopped = false,
      changed = false,
      changedPaths: string[] = [],
      getPathsRecording = false,
      getPaths: string[] = [],
      paths = new WeakMap<object, string> ();

  /* HELPERS */

  function triggerChange<T> ( result: T, path: string ): T {

    changed = true;
    changedPaths.push ( path );

    return result;

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

    paths.set ( child, getChildPath ( parent, path ) );

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

      if ( property === $STOP ) {

        stopped = true;
        changedPaths = undefined as any; //TSC
        paths = undefined as any; //TSC

        delete PROXY_CACHE[$PROXY];

        return target;

      }

      if ( property === $GET_RECORD_START ) return getPathsRecording = true;

      if ( property === $GET_RECORD_STOP ) {

        const paths = getPaths;

        getPathsRecording = false;
        getPaths = [];

        return paths;

      }

      if ( Utils.isBuiltinWithMutableMethods ( receiver ) ) receiver = receiver[$TARGET];

      if ( getPathsRecording && !getParentPath ( target ) ) getPaths.push ( property ); // We are only recording root paths, because I don't see a use case for recording deeper paths too

      const value = Reflect.get ( target, property, receiver );

      if ( Utils.isBuiltinWithoutMutableMethods ( value ) ) return value;

      const descriptor = Reflect.getOwnPropertyDescriptor ( target, property );

      if ( descriptor && !descriptor.configurable && !descriptor.writable ) return value; // Preserving invariants

      if ( stopped || Utils.isSymbol ( property ) || Utils.isBuiltinUnsupported ( value ) ) return value;

      if ( Utils.isFunction ( value ) && Utils.isStrictlyImmutableMethod ( target, value ) ) return value.bind ( target ); //FIXME: Binding here prevents the function to be potentially re-bounded later

      setChildPath ( target, value, property );

      return makeProxy ( value, callback, $PROXY, traps );

    }),

    set: wrapTrap (( target, property, value, receiver ) => {

      if ( value && value[$TARGET] ) value = value[$TARGET];

      if ( Utils.isBuiltinWithMutableMethods ( receiver ) ) receiver = receiver[$TARGET];

      if ( stopped || Utils.isSymbol ( property ) ) return Reflect.set ( target, property, value );

      const isValueUndefined = ( value === undefined ),
            didPropertyExist = isValueUndefined && Reflect.has ( target, property ),
            prev = Reflect.get ( target, property, receiver ),
            result = Reflect.set ( target, property, value ),
            changed = result && ( ( isValueUndefined && !didPropertyExist ) || !Utils.isEqual ( prev, value ) );

      return changed ? triggerChange ( result, getChildPath ( target, property ) ) : result;

    }),

    defineProperty: wrapTrap (( target, property, descriptor ) => {

      if ( stopped || Utils.isSymbol ( property ) ) return Reflect.defineProperty ( target, property, descriptor );

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

      if ( stopped || Utils.isSymbol ( property ) ) return changed;

      return changed ? triggerChange ( changed, getChildPath ( target, property ) ) : changed;

    }),

    apply: wrapTrap (( target, thisArg, args ) => {

      if ( Utils.isBuiltinWithMutableMethods ( thisArg ) ) thisArg = thisArg[$TARGET];

      if ( stopped || Utils.isLooselyImmutableMethod ( thisArg, target ) ) return Reflect.apply ( target, thisArg, args );

      const clone = Utils.clone ( getTarget ( thisArg ) ),
            result = Reflect.apply ( target, thisArg, args ),
            changed = !Utils.isEqual ( clone, getTarget ( thisArg ) );

      return changed ? triggerChange ( result, getParentPath ( thisArg[$TARGET] || thisArg ) ) : result; //FIXME: Why do we need to retrieve the path this way (for arrays)?

    })

  };

  return traps;

}

/* EXPORT */

export default makeTraps;
