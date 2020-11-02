
/* IMPORT */

import {Applicator} from '../types';

/* DESTRUCTURING */

const {apply} = Reflect;

/* APPLICATORS */

const add: Applicator<Set<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const prev = thisArgTarget.has ( args[0] );

  if ( prev ) return [thisArg, false];

  const result = apply ( method, thisArg, args );

  return [result, true];

};

const del: Applicator<Set<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const prev = thisArgTarget.has ( args[0] );

  if ( !prev ) return [false, false];

  const result = apply ( method, thisArg, args );

  return [result, true];

};

const clear: Applicator<Set<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {size} = thisArgTarget;

  if ( !size ) return [undefined, false];

  const result = apply ( method, thisArg, args );

  return [result, true];

};

/* SET */

const Set = { add, delete: del, clear };

/* EXPORT */

export default Set;
