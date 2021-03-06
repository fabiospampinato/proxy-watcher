
/* IMPORT */

const {watch, unwatch, record, target, isProxy} = require ( '../dist' ),
      {default: Utils} = require ( '../dist/utils' ),
      {NOOP, OBJ, OBJ_HUGE, DIFF_A, DIFF_B} = require ( './fixtures' ),
      benchmark = require ( 'benchloop' );

/* BENCHMARK */

benchmark.defaultOptions = Object.assign ( benchmark.defaultOptions, {
  iterations: 1000,
  log: 'compact'
});

benchmark.group ( 'record', () => {

  benchmark ({
    name: 'single',
    beforeEach: ctx => {
      ctx.proxy = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      record ( ctx.proxy, () => {
        ctx.proxy.obj.deep.deeper;
      });
    }
  });

  benchmark ({
    name: 'multiple',
    beforeEach: ctx => {
      ctx.proxy1 = watch ( OBJ (), NOOP )[0];
      ctx.proxy2 = watch ( OBJ (), NOOP )[0];
    },
    fn: ctx => {
      record ( [ctx.proxy1, ctx.proxy2], () => {
        ctx.proxy1.obj.deep.deeper;
      });
    }
  });

});

benchmark ({
  name: 'target',
  beforeEach: ctx => {
    ctx.proxy = watch ( OBJ (), NOOP )[0];
  },
  fn: ctx => {
    target ( ctx.proxy );
  }
});

benchmark ({
  name: 'unwatch',
  beforeEach: ctx => {
    ctx.proxy = watch ( OBJ (), NOOP )[0];
  },
  fn: ctx => {
    unwatch ( ctx.proxy );
  }
});

benchmark.group ( 'isProxy', () => {

  benchmark ({
    name: 'raw',
    fn: () => {
      isProxy ( OBJ );
    }
  });

  benchmark ({
    name: 'proxy',
    fn: ctx => {
      isProxy ( ctx.proxy );
    }
  });

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
    beforeEach: ctx => {
      ctx.obj = OBJ ();
    },
    fn: ctx => {
      watch ( ctx.obj, NOOP );
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

benchmark.group ( 'set', () => {

  benchmark.group ( 'no', () => {

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

  benchmark.group ( 'yes', () => {

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

  benchmark.group.skip ( 'huge', () => {

    benchmark ({
      name: 'date:setDate',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.date.setDate ( 123 );
      }
    });

    benchmark ({
      name: 'array:copyWithin',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.copyWithin ( 0, 1, 2 );
      }
    });

    benchmark ({
      name: 'array:fill',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.fill ( 0 );
      }
    });

    benchmark ({
      name: 'array:pop',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.pop ();
      }
    });

    benchmark ({
      name: 'array:push',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.push ( -1 );
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:reverse',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.reverse ();
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:shift',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.shift ();
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:sort',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.sort ();
      }
    });

    benchmark ({
      name: 'array:splice',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.splice ( 0, 1, 2 );
      }
    });

    benchmark ({
      iterations: 1,
      name: 'array:unshift',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.arr.unshift ( 5 );
      }
    });

    benchmark ({
      name: 'map:set',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.map.set ( 1, 'foo' );
      }
    });

    benchmark ({
      name: 'map:delete',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.map.delete ( 1 );
      }
    });

    benchmark ({
      name: 'map:clear',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.map.clear ();
      }
    });

    benchmark ({
      name: 'set:add',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.set.add ( 3 );
      }
    });

    benchmark ({
      name: 'set:delete',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.set.delete ( 1 );
      }
    });

    benchmark ({
      name: 'set:clear',
      before: ctx => {
        ctx.proxy = watch ( OBJ_HUGE (), NOOP )[0];
      },
      fn: ctx => {
        ctx.proxy.set.clear ();
      }
    });

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

benchmark.group ( 'Utils', () => {

  benchmark ({
    name: 'clone',
    fn: () => {
      Utils.clone ( OBJ () );
    }
  });

  benchmark ({
    name: 'cloneDeep',
    fn: () => {
      Utils.cloneDeep ( OBJ () );
    }
  });

  benchmark ({
    name: 'diff',
    fn: () => {
      Utils.diff ( DIFF_A, DIFF_B );
    }
  });

  benchmark ({
    name: 'isEqual',
    fn: () => {
      Utils.isEqual ( DIFF_A, DIFF_B );
    }
  });

});

benchmark.summary ();
