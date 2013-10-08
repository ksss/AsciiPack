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
      assert.equal(ap.length, 22);
      assert.equal(ap, t.map+'2' + t.str4+'7compact' + t.true + t.str4+'6schema' + t.uint4+'0');
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
      format(-0x80000001, t.int64, 17);
      // FIXME Accuracy problem
      // format(-0x800000000000000000000, t.int64, 17);
    },
    "uint4": function(){
      format(0, t.uint4, 2);
      format(0xf, t.uint4, 2);
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
      assert.equal(Number.isNaN(AsciiPack.unpack(nan)), true);
    },
    "map": function(){
      format({}, t.map, 2);

      var hash = {
        "foo": {
          "bar": {
            "baz": 0
          }
        }
      };
      var ap = AsciiPack.pack(hash);

      assert.equal(ap, t.map+'1' + t.str4+'3foo' + t.map+'1' + t.str4+'3bar' + t.map+'1' + t.str4+'3baz' + t.uint4+'0');
      assert.deepEqual(AsciiPack.unpack(ap), hash);
    },
    "array": function(){
      format([], t.array, 2);

      var array = [1,2,3,[4,5,[6]]];
      var ap = AsciiPack.pack(array);

      assert.equal(ap, t.array+4 + t.uint4+1 + t.uint4+2 + t.uint4+3 + t.array+3 + t.uint4+4 + t.uint4+5 + t.array+1 + t.uint4+6);
      assert.deepEqual(AsciiPack.unpack(ap), array);
    },
    "str4":function(){
      format("", t.str4, 2);
      format((new Array(0x10)).join('a'), t.str4, 17);
    },
    "str8":function(){
      format((new Array(0x11)).join('a'), t.str8, 3 + 0x10);
      format((new Array(0x100)).join('a'), t.str8, 3 + 0xff);
    },
    "str16":function(){
      format((new Array(0x101)).join('a'), t.str16, 5 + 0x100);
      format((new Array(0x10000)).join('a'), t.str16, 5 + 0xffff);
    },
    "str32":function(){
      format((new Array(0x10001)).join('a'), t.str32, 9 + 0x10000);
      // FIXME Invalid array length
      // format((new Array(0x100000000)).join('a'), t.str32, 9 + 0xffffffff);
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
  };

  return function (ok_callback, finish_callback) {
    for (var it in test_case) {
      try {
        var ret = test_case[it]();
        if (ok_callback) ok_callback(it);
      } catch (ex) {
        console.error(ex.message);
        console.error(ex.stack);
      }
    }
    if (finish_callback) finish_callback();
  };

})();
