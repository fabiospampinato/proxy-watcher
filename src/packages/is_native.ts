
/* VARIABLES */

const escapeRe = /[\\^$.*+?()[\]{}|]/g;
const isNativeRe = new RegExp ( `^${Function.prototype.toString.call ( Object.prototype.hasOwnProperty ).replace ( escapeRe, '\\$&' ).replace ( /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?' )}$` );

/* IS NATIVE */

const isNative = ( x: any ): boolean => {

  return isNativeRe.test ( x.toString () );

};

/* EXPORT */

export default isNative;
