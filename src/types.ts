
/* TYPES */

type Callback = ( paths: string[] ) => any;

type Disposer<T> = () => T;

type ProxyHandlers = Required<ProxyHandler<any>>;

type Trap = ProxyHandlers['get'] | ProxyHandlers['set'] | ProxyHandlers['defineProperty'] | ProxyHandlers['deleteProperty'] | ProxyHandlers['apply'];

type Traps = {
  get: ProxyHandlers['get'],
  set: ProxyHandlers['set'],
  defineProperty: ProxyHandlers['defineProperty'],
  deleteProperty: ProxyHandlers['deleteProperty'],
  apply: ProxyHandlers['apply']
};

/* EXPORT */

export {Callback, Disposer, ProxyHandlers, Trap, Traps};
