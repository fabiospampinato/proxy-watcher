
/* IMPORT */

import {Applicator} from '../types';
import Utils from '../utils';

/* DESTRUCTURING */

const {apply} = Reflect,
      {clone, isEqual} = Utils;

/* FALLBACK */

// This works with everything, but involves cloning and comparing objects, which can be really expensive

const fallback: Applicator<any> = ( method, thisArg, thisArgTarget, args ) => {

  const cloned = clone ( thisArgTarget ),
        result = apply ( method, thisArg, args ),
        changed = !isEqual ( cloned, thisArgTarget );

  return [result, changed];

};

/* EXPORT */

export default fallback;
