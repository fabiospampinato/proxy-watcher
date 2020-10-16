
/* HELPERS */

const {getPrototypeOf, prototype} = Object;

/* IS PLAIN OBJECT */

const isPlainObject = ( value: any ): value is Record<any, any> => {

  if ( typeof value !== 'object' || value === null ) return false;

  const proto = getPrototypeOf ( value );

  return proto === null || proto === prototype;

};

/* EXPORT */

export default isPlainObject;
