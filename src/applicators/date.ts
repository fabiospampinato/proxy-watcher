
/* IMPORT */

import {Applicator} from '../types';

/* DESTRUCTURING */

const {apply} = Reflect;

/* APPLICATORS */

const setDate: Applicator<Date> = ( method, thisArg, thisArgTarget, args ) => {

  const prev = thisArgTarget.getTime (),
        result = apply ( method, thisArg, args ),
        next = thisArgTarget.getTime (),
        changed = ( prev !== next );

  return [result, changed];

};

/* DATE */

const Date = { setDate };

/* EXPORT */

export default Date;

