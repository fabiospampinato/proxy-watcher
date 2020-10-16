
/* HELPERS */

const {assign} = Object;

const CONSTRUCTORS_CLONABLE = new Set ([ Map, Set, Date, RegExp ]);

const cloneMap = ( val: Map<any, any> ): Map<any, any> => {
  const cloned = new Map ();
  for ( const [key, value] of val ) {
    cloned.set ( clone ( key ), clone ( value ) );
  }
  return cloned;
};

const cloneRegExp = ( val: RegExp ): RegExp => {
  const cloned = new RegExp ( val.source, val.flags );
  cloned.lastIndex = val.lastIndex;
  return cloned;
};

const cloneSet = ( val: Set<any> ): Set<any> => {
  const cloned = new Set ();
  for ( const value of val ) {
    cloned.add ( clone ( value ) );
  }
  return cloned;
};

/* CLONE */

const cloneNew = ( val: any ): any => {

  if ( typeof val !== 'object' || val === null ) return val;

  if ( typeof val.slice === 'function' ) return val.slice ();

  const {constructor} = val;

  if ( CONSTRUCTORS_CLONABLE.has ( constructor ) ) {

    if ( constructor === Map ) return cloneMap ( val );

    if ( constructor === Set ) return cloneSet ( val );

    if ( constructor === Date ) return new Date ( val.getTime () );

    if ( constructor === RegExp ) return cloneRegExp ( val );

  }

  return assign ( {}, val );

};

const clone = <T> ( val: T ): T => {

  return cloneNew ( val );

};

/* EXPORT */

export default clone;
