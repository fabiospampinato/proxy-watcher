
/* IMPORT */

import {IS_DEVELOPMENT, $IS_PROXY, $TARGET, $STOP, $GET_RECORD_START, $GET_RECORD_STOP} from './consts';
import isProxy from './is_proxy';
import makeProxy from './make_proxy';
import getTarget from './target';
import Utils from './utils';
import {Traps} from './types';

/* DESTRUCTURING */

const {isArray} = Array,
      {apply, defineProperty, deleteProperty, get, getOwnPropertyDescriptor, has, set} = Reflect,
      {clone, isBuiltinWithoutMutableMethods, isEqual, isLooselyImmutableArrayMethod, isObjectUnsupported, isStrictlyImmutableMethod} = Utils;

/* TRAPS HELPERS */

const Traps: Traps = {

  get ( target, property, receiver ) {

    if ( property === 'constructor' ) return target.constructor;

    if ( typeof property === 'symbol' ) {

      if ( property === $TARGET ) return target;

      if ( property === $GET_RECORD_START ) return this.getPathsRecording = true;

      if ( property === $GET_RECORD_STOP ) {

        const paths = this.getPaths;

        this.getPathsRecording = false;
        this.getPaths = [];

        return paths;

      }

      if ( property === $IS_PROXY ) return true;

      if ( property === $STOP ) {

        this.stopped = true;
        this.changedPaths = undefined as any; //TSC
        this.paths = undefined as any; //TSC

        return target;

      }

      return get ( target, property, receiver );

    }

    receiver = receiver[$TARGET] || receiver;

    if ( this.getPathsRecording && !this.getParentPath ( target ) ) this.getPaths.push ( property as string ); // We are only recording root paths, because I don't see a use case for recording deeper paths too //TSC

    const value = get ( target, property, receiver );

    if ( isBuiltinWithoutMutableMethods ( value ) ) return value;

    const descriptor = getOwnPropertyDescriptor ( target, property );

    if ( descriptor && !descriptor.configurable && !descriptor.writable ) return value; // Preserving invariants

    if ( this.stopped || isObjectUnsupported ( value ) ) return value;

    if ( typeof value === 'function' && isStrictlyImmutableMethod ( value ) ) return value.bind ( target ); //FIXME: Binding here prevents the function to be potentially re-bounded later

    this.setChildPath ( target, value, property );

    if ( IS_DEVELOPMENT ) this.checkChildIsRoot ( value );

    const proxyCached = this.proxies.get ( value );

    if ( proxyCached ) return proxyCached;

    const proxy = makeProxy ( value, this.callback, this.traps );

    this.proxies.set ( value, proxy );

    return proxy;

  },

  set ( target, property, value, receiver ) {

    value = getTarget ( value );

    if ( this.stopped || typeof property === 'symbol' ) return set ( target, property, value );

    receiver = receiver[$TARGET] || receiver;

    const isValueUndefined = ( value === undefined ),
          didPropertyExist = isValueUndefined && has ( target, property ),
          prev = get ( target, property, receiver ),
          result = set ( target, property, value ),
          changed = result && ( ( isValueUndefined && !didPropertyExist ) || !isEqual ( getTarget ( prev ), value ) );

    return changed ? this.triggerChange ( result, this.getChildPath ( target, property ) ) : result;

  },

  defineProperty ( target, property, descriptor ) {

    if ( this.stopped || typeof property === 'symbol' ) return defineProperty ( target, property, descriptor );

    const prev = getOwnPropertyDescriptor ( target, property ),
          changed = defineProperty ( target, property, descriptor );

    if ( changed ) {

      const next = { configurable: false, enumerable: false, writable: false, ...descriptor }; // Accounting for defaults

      if ( isEqual ( prev, next ) ) return true;

    }

    return changed ? this.triggerChange ( changed, this.getChildPath ( target, property ) ) : changed;

  },

  deleteProperty ( target, property ) {

    if ( !has ( target, property ) ) return true;

    const changed = deleteProperty ( target, property );

    if ( this.stopped || typeof property === 'symbol' ) return changed;

    return changed ? this.triggerChange ( changed, this.getChildPath ( target, property ) ) : changed;

  },

  apply ( target, thisArg, args ) {

    if ( !isProxy ( thisArg ) ) return apply ( target, thisArg, args );

    const isArrayThis = isArray ( thisArg );

    if ( this.stopped || ( isArrayThis && isLooselyImmutableArrayMethod ( target ) ) ) return apply ( target, thisArg, args );

    const thisArgTarget = ( isArrayThis ? thisArg[$TARGET] : getTarget ( thisArg ) );

    if ( !isArrayThis ) thisArg = thisArgTarget;

    const cloned = clone ( thisArgTarget ),
          result = apply ( target, thisArg, args ),
          changed = !isEqual ( cloned, thisArgTarget );

    return changed ? this.triggerChange ( result, this.getParentPath ( thisArgTarget ) ) : result;

  }

};

/* EXPORT */

export default Traps;
