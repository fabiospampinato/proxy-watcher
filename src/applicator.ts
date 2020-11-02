
/* IMPORT */

import Applicators from './applicators';
import {Applicator} from './types';

/* APPLICATOR */

// Optimized "apply" trap executor, with custom comparators for expensive mutating method

const Applicator = {

  get ( constructor: Function, method: Function ): Applicator<any> {

    const applicators = Applicators[constructor.name];

    return applicators ? applicators[method.name] || Applicators.fallback : Applicators.fallback;

  },

  execute ( method: Function, thisArg: any, thisArgTarget: any, args: any[] ): [any, boolean] {

    const applicator = Applicator.get ( thisArgTarget.constructor, method );

    return applicator ( method, thisArg, thisArgTarget, args );

  }

};

/* EXPORT */

export default Applicator;
