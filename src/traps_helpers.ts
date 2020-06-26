
/* IMPORT */

import pp from 'path-prop';
import {IS_DEVELOPMENT} from './consts';
import TrapsRaw from './traps';
import {Callback, Trap, Traps} from './types';

/* TRAPS HELPERS */

class TrapsHelpers<Object> {

  /* VARIABLES */

  object: Object;
  callback: Callback;
  traps: Traps;

  stopped: boolean = false;
  changed: boolean = false;
  changedPaths: string[] = [];
  getPathsRecording: boolean = false;
  getPaths: string[] = [];
  paths: WeakMap<object, string> = new WeakMap<object, string> ();
  proxies: WeakMap<object, object> = new WeakMap<object, object> ();
  trapDepth: number = 0;

  /* CONSTRUCTOR */

  constructor ( object: Object, callback: Callback ) {

    this.object = object;
    this.callback = callback;
    this.traps = this.wrapTraps ( TrapsRaw );

  }

  /* HELPERS */

  checkChildIsRoot ( child: any ): void {

    if ( child !== this.object ) return;

    throw new Error ( `A reference to the whole watched object has been found at path "${this.paths.get ( child )}", this is not supported.` );

  }

  checkChildPathDuplicate ( child: object, childPath: string ): void {

    const childPathPrev = this.paths.get ( child );

    if ( childPath === childPathPrev ) return;

    if ( !childPathPrev || !Object.is ( child, pp.get ( this.object, childPathPrev ) ) ) return;

    throw new Error ( `Duplicate object encountered, the same object is being referenced both at path "${childPathPrev}" and at path "${childPath}". Duplicate objects in a watched object are not supported.` );

  }

  getChildPath ( parent: object, path: string | number ): string {

    const parentPath = this.getParentPath ( parent ),
          childPath = parentPath ? `${parentPath}.${path}` : `${path}`;

    return childPath;

  }

  getParentPath ( parent: object ): string {

    return this.paths.get ( parent ) || '';

  }

  setChildPath ( parent: object, child: object, path: string | number ): void {

    const childPath = this.getChildPath ( parent, path );

    if ( IS_DEVELOPMENT && Object.getPrototypeOf ( parent )[path] !== child ) this.checkChildPathDuplicate ( child, childPath );

    this.paths.set ( child, childPath );

  }

  triggerChange<T> ( result: T, path: string ): T {

    this.changed = true;
    this.changedPaths.push ( path );

    return result;

  }

  wrapTrap ( trap: Trap ): any { //TSC

    const self = this;

    return function trapWrapper () {

      self.trapDepth++;

      const result = trap.apply ( self, arguments );

      self.trapDepth--;

      if ( !self.trapDepth && self.changed && !self.stopped ) {

        const paths = self.changedPaths;

        self.changed = false;
        self.changedPaths = [];

        self.callback ( paths );

      }

      return result;

    };

  }

  wrapTraps ( traps: Traps ): Traps {

    return {
      get: this.wrapTrap ( traps.get ),
      set: this.wrapTrap ( traps.set ),
      defineProperty: this.wrapTrap ( traps.defineProperty ),
      deleteProperty: this.wrapTrap ( traps.deleteProperty ),
      apply: this.wrapTrap ( traps.apply )
    };

  }

}

/* EXPORT */

export default TrapsHelpers;
