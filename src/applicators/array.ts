
/* IMPORT */

import {Applicator} from '../types';

/* DESTRUCTURING */

const {apply} = Reflect;

/* HELPERS */

const clamp = ( nr: number, min: number, max: number ): number => Math.max ( min, Math.min ( max, nr ) ),
      normalizeIndex = ( index: number, length: number ): number => ( index < 0 ) ? clamp ( length + index, 0, length ) : clamp ( index, 0, length );

/* APPLICATORS */

const copyWithin: Applicator<Array<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {length} = thisArgTarget,
        target = normalizeIndex ( args[0], length ),
        start = ( args.length >= 2 ) ? normalizeIndex ( args[1], length ) : 0,
        end = ( args.length >= 3 ) ? normalizeIndex ( args[2], length ) : length,
        copyNr = ( end - start );

  for ( let i = 0, l = copyNr; i < l; i++ ) {

    if ( ( target + i ) >= length ) break;

    if ( thisArgTarget[start + i] !== thisArgTarget[target + i] ) {

      const result = apply ( method, thisArg, args );

      return [result, true];

    }

  }

  return [thisArg, false];

};

const fill: Applicator<Array<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {length} = thisArgTarget,
        value = args[0],
        start = ( args.length >= 2 ) ? normalizeIndex ( args[1], length ) : 0,
        end = ( args.length >= 3 ) ? normalizeIndex ( args[2], length ) : length;

  for ( let i = start, l = end; i < l; i++ ) {

    if ( thisArgTarget[i] !== value ) {

      const result = apply ( method, thisArg, args );

      return [result, true];

    }

  }

  return [thisArg, false];

};

const pop: Applicator<Array<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {length} = thisArgTarget;

  if ( !length ) return [undefined, false];

  const result = apply ( method, thisArg, args );

  return [result, true];

};

const push: Applicator<Array<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {length} = args;

  if ( !length ) return [thisArgTarget.length, false];

  const result = apply ( method, thisArg, args );

  return [result, true];

};

const reverse: Applicator<Array<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {length} = thisArgTarget,
        midpoint = Math.floor ( length / 2 );

  for ( let i = 0; i <= midpoint; i++ ) {

    if ( thisArgTarget[i] !== thisArgTarget[length - i] ) {

      const result = apply ( method, thisArg, args );

      return [result, true];

    }

  }

  return [thisArg, false];

};

const shift = pop;

const sort = undefined; // Might not be worth checking if the array is already sorted

const splice: Applicator<Array<any>> = ( method, thisArg, thisArgTarget, args ) => {

  const {length} = thisArgTarget,
        start = normalizeIndex ( args[0], length ),
        deleteNr = ( args.length >= 2 ) ? Math.max ( 0, args[1] ) : length - start,
        addNr = Math.max ( 0, args.length - 2 );

  if ( addNr === deleteNr ) {

    if ( !deleteNr ) return [[], false];

    for ( let i = 0, l = deleteNr; i < l; i++ ) {

      if ( thisArgTarget[start + i] !== args[2 + i] ) {

        const result = apply ( method, thisArg, args );

        return [result, true];

      }

    }

    return [args.slice ( 2 ), false];

  }

  const result = apply ( method, thisArg, args );

  return [result, true];

};

const unshift = push;

/* ARRAY */

const Array = { copyWithin, fill, pop, push, reverse, shift, sort, splice, unshift };

/* EXPORT */

export default Array;
