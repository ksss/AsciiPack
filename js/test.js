this.run = (function(){
  var t = AsciiPack.typemap;
  var test_case = {
    "intro": function(){
      var intro = {
        "compact": true,
        "schema": 0,
      };
      var ap = AsciiPack.pack(intro);

      assert.equal(JSON.stringify(intro).length, 27);
      assert.equal(ap.length, 19);
      assert.equal(ap, t.map4+'2' + t.fixbin_7+'compact' + t.true + t.fixbin_6+'schema' + t.positive_fixint_0);
      assert.deepEqual(AsciiPack.unpack(ap), intro);
    },
    "int4": function(){
      format(-1, t.int4, 2);
      format(-8, t.int4, 2);
    },
    "int8": function(){
      format(-0x9, t.int8, 3);
      format(-0x80, t.int8, 3);
    },
    "int16": function(){
      format(-0x81, t.int16, 5);
      format(-0x8000, t.int16, 5);
    },
    "int32": function(){
      format(-0x8001, t.int32, 9);
      format(-0x80000000, t.int32, 9);
    },
    "int64": function(){
      // FIXME Accuracy problem
      // format(-0x80000001, t.int64, 17);
      // format(-0x800000000000000000000, t.int64, 17);
    },
    "positive fixint": function(){
      format(0x0, t.positive_fixint_0, 1);
      format(0x1, t.positive_fixint_1, 1);
      format(0xe, t.positive_fixint_E, 1);
      format(0xf, t.positive_fixint_F, 1);
    },
    "uint8": function(){
      format(0x10, t.uint8, 3);
      format(0xff, t.uint8, 3);
    },
    "uint16": function(){
      format(0x100, t.uint16, 5);
      format(0xffff, t.uint16, 5);
    },
    "uint32": function(){
      format(0x10000, t.uint32, 9);
      format(0xffffffff, t.uint32, 9);
    },
    "uint64": function(){
      format(0x100000000, t.uint64, 17);
      // FIXME Accuracy problem
      // format(0xffffffffffffffff, t.uint64, 17);
    },
    "float64": function(){
      var rets = [
        [-0.1, 'bfb999999999999a'],
        [1.0000000000000002, '3ff0000000000001'],
        [1.0000000000000004, '3ff0000000000002'],
        [1/3, '3fd5555555555555'],
        [Number.POSITIVE_INFINITY, '7ff0000000000000'],
        [Number.NEGATIVE_INFINITY, 'fff0000000000000']
      ];
      for (var i = 0; i < rets.length; i++) {
        var ap = AsciiPack.pack(rets[i][0]);
        assert.equal(ap, t.float64+rets[i][1]);
        assert.equal(AsciiPack.unpack(ap), rets[i][0]);
      }
      var nan = AsciiPack.pack(Number.NaN);
      assert.equal(nan, t.float64 + '7fffffffffffffff');
      assert.equal(isNaN(AsciiPack.unpack(nan)), true);
    },
    "map4": function(){
      format_map(0, t.map4);
      format_map(0xf, t.map4);
    },
    "map8": function(){
      format_map(0x10, t.map8);
      format_map(0xff, t.map8);
    },
    "map16": function(){
      format_map(0x100, t.map16);
      format_map(0xffff, t.map16);
    },
    "map32": function(){
      format_map(0x10000, t.map32);
      // FIXME FATAL ERROR: CALL_AND_RETRY_0 Allocation failed - process out of memory
      // format_map(0xffffffff, t.map32, 9);
    },
    "array4": function(){
      format_array(0, t.array4);
    },
    "array8": function(){
      format_array(0x10, t.array8);
      format_array(0xff, t.array8);
    },
    "array16": function(){
      format_array(0x100, t.array16);
      format_array(0xffff, t.array16);
    },
    "array32": function(){
      format_array(0x10000, t.array32);
      // FIXME FATAL ERROR: CALL_AND_RETRY_0 Allocation failed - process out of memory
      // format_array(0xffffffff, t.array32, 9);
    },
    "fixbin":function(){
      format("", t.fixbin_0, 1);
      format("0", t.fixbin_1, 2);
      format("0123456789abcd", t.fixbin_E, 15);
      format("0123456789abcde", t.fixbin_F, 16);
    },
    "bin8":function(){
      format((new Array(0x11)).join('a'), t.bin8, 3 + 0x10);
      format((new Array(0x100)).join('a'), t.bin8, 3 + 0xff);
    },
    "bin16":function(){
      format((new Array(0x101)).join('a'), t.bin16, 5 + 0x100);
      format((new Array(0x10000)).join('a'), t.bin16, 5 + 0xffff);
    },
    "bin32":function(){
      format((new Array(0x10001)).join('a'), t.bin32, 9 + 0x10000);
      // FIXME Invalid array length
      // format((new Array(0x100000000)).join('a'), t.bin32, 9 + 0xffffffff);
    },
    "nil": function(){
      format(null, t.nil, 1);
    },
    "false": function(){
      format(false, t.false, 1);
    },
    "true": function(){
      format(true, t.true, 1);
    },
  };

  function format (object, first, length) {
    var ap = AsciiPack.pack(object);
    assert.equal(ap[0], first);
    assert.equal(ap.length, length);
    assert.equal(AsciiPack.unpack(ap), object);
  };
  function format_map (count, first) {
    var map = {};
    for (var i = 0; i < count; i++) {
      map[i] = 0;
    }
    var ap = AsciiPack.pack(map);
    assert.equal(ap[0], first);
    assert.deepEqual(AsciiPack.unpack(ap), map);
  };
  function format_array (count, first) {
    var array = [];
    for (var i = 0; i < count; i++) {
      array[i] = 0;
    }
    var ap = AsciiPack.pack(array);
    assert.equal(ap[0], first);
    assert.deepEqual(AsciiPack.unpack(ap), array);
  };

  return function (ok_callback, finish_callback) {
    var green = true;
    for (var it in test_case) {
      try {
        var ret = test_case[it]();
        if (ok_callback) ok_callback(it);
      } catch (ex) {
        green = false;
        console.log("\n[" + it + "]");
        console.error(ex.message);
        console.error(ex.stack);
      }
    }
    if (finish_callback && green) finish_callback();
  };

})();
