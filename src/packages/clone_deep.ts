
/* HELPERS */

const {isArray} = Array;

const CONSTRUCTORS_CLONABLE = new Set ([ Map, Set, Date, RegExp ]);

const cloneDeepArray = ( val: any[], circularMap: Map<any, any> ): any[] => {
  const {length} = val;
  const cloned = new Array ( length );
  circularMap.set ( val, cloned );
  for ( let i = 0; i < length; i++ ) {
    cloned[i] = cloneDeep ( val[i], circularMap );
  }
  return cloned;
};

const cloneDeepMap = ( val: Map<any, any>, circularMap: Map<any, any> ): Map<any, any> => {
  const cloned = new Map ();
  circularMap.set ( val, cloned );
  for ( const [key, value] of val ) {
    cloned.set ( cloneDeep ( key, circularMap ), cloneDeep ( value, circularMap ) );
  }
  return cloned;
};

const cloneDeepObject = ( val: object, circularMap: Map<any, any> ): object => {
  const cloned = {};
  circularMap.set ( val, cloned );
  for ( const key in val ) {
    cloned[key] = cloneDeep ( val[key], circularMap );
  }
  return cloned;
};

const cloneRegExp = ( val: RegExp ): RegExp => {
  const cloned = new RegExp ( val.source, val.flags );
  cloned.lastIndex = val.lastIndex;
  return cloned;
};

const cloneDeepSet = ( val: Set<any>, circularMap: Map<any, any> ): Set<any> => {
  const cloned = new Set ();
  circularMap.set ( val, cloned );
  for ( const value of val ) {
    cloned.add ( cloneDeep ( value, circularMap ) );
  }
  return cloned;
};

/* CLONE DEEP */

// This is just a deep version of "clone"

const cloneDeepNew = ( val: any, circularMap: Map<any, any> ): any => {

  if ( typeof val !== 'object' || val === null ) return val;

  if ( isArray ( val ) ) return cloneDeepArray ( val, circularMap );

  if ( typeof val.slice === 'function' ) return val.slice ();

  const {constructor} = val;

  if ( CONSTRUCTORS_CLONABLE.has ( constructor ) ) {

    if ( constructor === Map ) return cloneDeepMap ( val, circularMap );

    if ( constructor === Set ) return cloneDeepSet ( val, circularMap );

    if ( constructor === Date ) return new Date ( val.getTime () );

    if ( constructor === RegExp ) return cloneRegExp ( val );

  }

  return cloneDeepObject ( val, circularMap );

};

const cloneDeep = ( val: any, _circularMap?: Map<any, any> ): any => {

  const circularMap = _circularMap || new Map (), // Storing references to potentially circular objects
        circularClone = circularMap.get ( val );

  if ( circularClone ) return circularClone;

  return cloneDeepNew ( val, circularMap );

};

/* EXPORT */

export default cloneDeep;
