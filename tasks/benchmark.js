
/* IMPORT */

const {default: watch} = require ( '../dist' ),
      {NOOP, OBJ} = require ( './fixtures' ),
      benchmark = require ( 'benchloop' );

/* BENCHMARK */

benchmark.defaultOptions = Object.assign ( benchmark.defaultOptions, {
  iterations: 500,
  log: 'compact'
});

benchmark.group ( 'watch', () => {

  benchmark ({
    name: 'primitive',
    fn: () => {
      watch ( 123, NOOP );
    }
  });

  benchmark ({
    name: 'object',
    fn: () => {
      watch ( {}, NOOP );
    }
  });

  benchmark ({
    name: 'array',
    fn: () => {
      watch ( [], NOOP );
    }
  });

  benchmark ({
    name: 'deep',
    fn: () => {
      watch ( OBJ (), NOOP );
    }
  });

});

benchmark.group ( 'dispose', () => {

  benchmark ({
    name: 'primitive',
    beforeEach: ctx => {
      ctx.dispose = watch ( 123, NOOP )[1];
    },
    fn: ctx => {
      ctx.dispose ();
    }
  });

  benchmark ({
    name: 'object',
    beforeEach: ctx => {
      ctx.dispose = watch ( {}, NOOP )[1];
    },
    fn: ctx => {
      ctx.dispose ();
    }
  });

  benchmark ({
    name: 'array',
    beforeEach: ctx => {
      ctx.dispose = watch ( [], NOOP )[1];
    },
    fn: ctx => {
      ctx.dispose ();
    }
  });

  benchmark ({
    name: 'deep',
    beforeEach: ctx => {
      ctx.dispose = watch ( OBJ (), NOOP )[1];
    },
    fn: ctx => {
      ctx.dispose ();
    }
  });

});

benchmark.group ( 'get', () => {

  benchmark ({
    name: 'primitive',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.str;
      ctx.proxy.nr;
      ctx.proxy.symbol;
    }
  });

  benchmark ({
    name: 'object:shallow',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr;
      ctx.proxy.obj;
    }
  });

  benchmark ({
    name: 'object:deep',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr[3].undefined;
      ctx.proxy.obj.deep.deeper;
    }
  });

  benchmark ({
    name: 'date',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.date.getTime ();
      ctx.proxy.date.getDate ();
      ctx.proxy.date.getDay ();
      ctx.proxy.date.getFullYear ();
      ctx.proxy.date.getHours ();
      ctx.proxy.date.getMilliseconds ();
      ctx.proxy.date.getMinutes ();
      ctx.proxy.date.getMonth ();
      ctx.proxy.date.getSeconds ();
      ctx.proxy.date.getTime ();
      ctx.proxy.date.getTimezoneOffset ();
      ctx.proxy.date.getUTCDate ();
      ctx.proxy.date.getUTCDay ();
      ctx.proxy.date.getUTCFullYear ();
      ctx.proxy.date.getUTCHours ();
      ctx.proxy.date.getUTCMilliseconds ();
      ctx.proxy.date.getUTCMinutes ();
      ctx.proxy.date.getUTCMonth ();
      ctx.proxy.date.getUTCSeconds ();
      ctx.proxy.date.getYear ();
    }
  });

  benchmark ({
    name: 'regex',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.re.source;
      ctx.proxy.re.lastIndex;
      ctx.proxy.re.exec ( 'foo' );
    }
  });

  benchmark ({
    name: 'function',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.fn.length;
      ctx.proxy.fn.name;
    }
  });

  benchmark ({
    name: 'array',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr.concat ( 4 );
      ctx.proxy.arr.entries ();
      ctx.proxy.arr.every ( NOOP );
      ctx.proxy.arr.filter ( NOOP );
      ctx.proxy.arr.find ( NOOP );
      ctx.proxy.arr.findIndex ( NOOP );
      ctx.proxy.arr.forEach ( () => {} );
      ctx.proxy.arr.includes ( 1 );
      ctx.proxy.arr.indexOf ( 1 );
      ctx.proxy.arr.join ();
      ctx.proxy.arr.keys ();
      ctx.proxy.arr.lastIndexOf ( 1 );
      ctx.proxy.arr.map ( NOOP );
      ctx.proxy.arr.reduce ( () => ({}) );
      ctx.proxy.arr.reduceRight ( () => ({}) );
      ctx.proxy.arr.slice ();
      ctx.proxy.arr.some ( NOOP );
      ctx.proxy.arr.toLocaleString ();
      ctx.proxy.arr.toString ();
      ctx.proxy.arr.values ();
    }
  });

  benchmark ({
    name: 'arrayBuffer',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arrBuf.byteLength;
      ctx.proxy.arrBuf.slice ( 0, 8 );
    }
  });

  benchmark ({
    name: 'arrayTyped',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arrTyped.subarray ();
    }
  });

  benchmark ({
    name: 'map',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.map.size;
      ctx.proxy.map.entries ();
      ctx.proxy.map.forEach ( NOOP );
      ctx.proxy.map.has ( '1' );
      ctx.proxy.map.keys ();
      ctx.proxy.map.values ();
      ctx.proxy.map.get ( '1' );
    }
  });

  benchmark ({
    name: 'set',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.set.size;
      ctx.proxy.set.entries ();
      ctx.proxy.set.forEach ( NOOP );
      ctx.proxy.set.has ( 1 );
      ctx.proxy.set.keys ();
      ctx.proxy.set.values ();
    }
  });

});

benchmark.group ( 'set:no', () => {

  benchmark ({
    name: 'object:shallow',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr[0] = 1;
    }
  });

  benchmark ({
    name: 'object:deep',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.obj.deep.deeper = true;
    }
  });

  benchmark ({
    name: 'date',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.date.setDate ( ctx.proxy.date.getDate () );
    }
  });

  benchmark ({
    name: 'regex',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.re.lastIndex = ctx.proxy.re.lastIndex;
    }
  });

  benchmark ({
    name: 'array',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr.copyWithin ( 0, 0, 0 );
      ctx.proxy.arr.push ();
      ctx.proxy.arr.splice ( 0, 0 );
    }
  });

  benchmark ({
    name: 'map',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.map.delete ( 'none' );
      ctx.proxy.map.set ( '1', 1 );
    }
  });

  benchmark ({
    name: 'set',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.set.delete ( 'none' );
      ctx.proxy.set.add ( 1 );
    }
  });

});

benchmark.group ( 'set:yes', () => {

  benchmark ({
    name: 'object:shallow',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr[0] = 10;
      ctx.proxy.obj.foo = 10;
    }
  });

  benchmark ({
    name: 'object:deep',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr[3].undefined = 10;
      ctx.proxy.obj.deep.deeper = 10;
    }
  });

  benchmark ({
    name: 'date',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.date.setDate ( ctx.proxy.date.getDate () % 2 + 1 );
    }
  });

  benchmark ({
    name: 'regex',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.re.lastIndex = -1;
    }
  });

  benchmark ({
    name: 'function',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.fn.displayName = 'Name';
    }
  });

  benchmark ({
    name: 'array',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.arr.copyWithin ( 0, 1, 2 );
      ctx.proxy.arr.fill ( 0 );
      ctx.proxy.arr.pop ();
      ctx.proxy.arr.push ( -1, -2, -3 );
      ctx.proxy.arr.reverse ();
      ctx.proxy.arr.shift ();
      ctx.proxy.arr.sort ();
      ctx.proxy.arr.splice ( 0, 1, 2 );
      ctx.proxy.arr.unshift ( 5 );
    }
  });

  benchmark ({
    name: 'map',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.map.delete ( '1' );
      ctx.proxy.map.clear ();
      ctx.proxy.map.set ( '4', 4 );
    }
  });

  benchmark ({
    name: 'set',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.set.add ( 3 );
      ctx.proxy.set.delete ( 1 );
      ctx.proxy.set.clear ();
    }
  });

});

benchmark.group ( 'delete', () => {

  benchmark ({
    name: 'object:shallow',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      delete ctx.proxy.arr;
    }
  });

  benchmark ({
    name: 'object:deep',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      delete ctx.proxy.obj.deep.deeper;
    }
  });

  benchmark ({
    name: 'map',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.map.delete ( '1' );
    }
  });

  benchmark ({
    name: 'set',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      ctx.proxy.set.delete ( 1 );
    }
  });

});

benchmark.summary ();
