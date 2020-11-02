
/* IMPORT */

import {Applicator} from '../types';
import Set from './set';

/* DESTRUCTURING */

const {apply} = Reflect;

/* APPLICATORS */

const set: Applicator<Map<any, any>> = ( method, thisArg, thisArgTarget, args ) => {

  const [key, value] = args,
        prev = thisArgTarget.get ( key );

  if ( prev === value && ( prev !== undefined || thisArgTarget.has ( key ) ) ) return [thisArg, false];

  const result = apply ( method, thisArg, args );

  return [result, true];

};

const del = Set.delete;

const clear = Set.clear;

/* MAP */

const Map = { set, delete: del, clear };

/* EXPORT */

export default Map;
