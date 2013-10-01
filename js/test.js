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
      check_str(t.str16 + '0', 0xfff);
      check_str(t.str16,       0xffff);
    },
    "str32":function(){
      check_str(t.str32 + '000', 0xfffff);
      check_str(t.str32 + '00',  0xffffff);
      check_str(t.str32 + '0',   0xfffffff);
      // FIXME Invalid array length
      // check_str(t.str32,         0xffffffff);
    },
    "nil": function(){
      var nil = null;
      var ap = AsciiPack.pack(nil);
      assert.equal(ap, t.nil);
      assert.equal(AsciiPack.unpack(ap), null);
    },
    "mix": function(){
      var hash = {};
      var str16 = (new Array(0x1000)).join('a');
      for (var i = 0; i < 50; i++) {
        var rand = i % 8;
        hash[i] = {
          0: [0,1,2,3,4,5,6,7,8,9],
          1: Math.random() + (Math.random() - 0.5) * 100000000,
          2: {hash:JSON.parse(JSON.stringify(hash))},
          3: '123abc',
          4: str16,
          5: null,
          6: false,
          7: true,
        }[rand];
      }
      console.log("benchmark of mix object...");
      json_stringpack(hash);
    }
  };

  function json_stringpack(obj){
    var lens = {}, ap, json;

    assert.deepEqual(AsciiPack.unpack(AsciiPack.pack(obj)), obj);

    bench("AsciiPack.pack", function(){
      ap = AsciiPack.pack(obj);
    });
    bench("AsciiPack.unpack", function(){
      AsciiPack.unpack(ap);
    });
    lens.asciipack_length = ap.length;

    bench("JSON.stringify", function(){
      json = JSON.stringify(obj);
    });
    bench("JSON.parse", function(){
      JSON.parse(json);
    });
    lens.json_length = json.length;
    console.log(lens);
  };
  function bench(name, fn){
    var t = new Date();
    for(var i = 0; i < 100; i++) {
      fn();
    }
    console.log(name + ': ' + (new Date - t) + 'ms');
  };
  function format (object, first, length) {
    var ap = AsciiPack.pack(object);
    assert.equal(ap[0], first);
    assert.equal(ap.length, length);
  };
  function check_uint (type, from_to) {
    for (var i = from_to[0]; i < from_to[1]; i++) {
      var n = Math.pow(2,i);
      var ap = AsciiPack.pack(n);
      assert.equal(ap, type + n.toString(16));
      assert.equal(AsciiPack.unpack(ap), n);
    }
  };
  function check_str(type, to){
    var strs = new Array(to + 1);
    var str = strs.join('a');
    var ap = AsciiPack.pack(str);
    assert.equal(ap, type + str.length.toString(16) + str);
    assert.equal(AsciiPack.unpack(ap), str);
  };

  return function () {
    for (var it in test_case) {
      try {
        test_case[it]();
      } catch (ex) {
        console.error(ex.message);
        console.error(ex.stack);
      }
    }
  };

})();
