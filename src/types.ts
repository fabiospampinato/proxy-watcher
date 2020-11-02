
/* TYPES */

type Applicator<T> = ( method: Function, thisArg: T, thisArgTarget: T, args: any[] ) => [any, boolean];

type Callback = ( paths: string[] ) => any;

type Disposer<T> = () => T;

type TrapsHelpers = import ( './traps_helpers' ).default<any>;

type TrapGet = ( this: TrapsHelpers, target: any, property: PropertyKey, receiver: any ) => any;
type TrapSet = ( this: TrapsHelpers, target: any, property: PropertyKey, value: any, receiver: any ) => boolean;
type TrapDefineProperty = ( this: TrapsHelpers, target: any, property: PropertyKey, descriptor: PropertyDescriptor ) => boolean;
type TrapDeleteProperty = ( this: TrapsHelpers, target: any, property: PropertyKey ) => boolean;
type TrapApply = ( this: TrapsHelpers, target: any, thisArg: any, args?: any ) => any;
type Trap = TrapGet | TrapSet | TrapDefineProperty | TrapDeleteProperty | TrapApply;

type Traps = {
  get: TrapGet,
  set: TrapSet,
  defineProperty: TrapDefineProperty,
  deleteProperty: TrapDeleteProperty,
  apply: TrapApply
};

/* EXPORT */

export {Applicator, Callback, Disposer, Trap, Traps};
