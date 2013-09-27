#! /usr/bin/env node

var AsciiPack = require('./asciipack').AsciiPack;
var assert = require('assert');
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
    for (var i = 1; i < 4; i++) {
      var n = -Math.pow(2,i) + 1;
      var ap = AsciiPack.pack(n);
      assert.equal(ap, t.int4 + (n & 0xf).toString(16));
      assert.equal(AsciiPack.unpack(ap), n);
    }
  },
  "int8": function(){
    for (var i = 4; i < 8; i++) {
      var n = -Math.pow(2,i) + 1;
      var ap = AsciiPack.pack(n);
      assert.equal(ap, t.int8 + (n & 0xff).toString(16));
      assert.equal(AsciiPack.unpack(ap), n);
    }
  },
  "int16": function(){
    for (var i = 8; i < 16; i++) {
      var n = -Math.pow(2,i) + 1;
      var ap = AsciiPack.pack(n);
      assert.equal(ap, t.int16 + (n & 0xffff).toString(16));
      assert.equal(AsciiPack.unpack(ap), n);
    }
  },
  "int32": function(){
    for (var i = 16; i < 32; i++) {
      var n = -Math.pow(2,i) + 1;
      var ap = AsciiPack.pack(n);
      // FIXME Accuracy problem
      // assert.equal(ap, t.int32 + (n & 0xffffffff).toString(16));
      assert.equal(AsciiPack.unpack(ap), n);
    }
  },
  // FIXME Accuracy problem
  // "int64": function(){
  //   for (var i = 32; i < 64; i++) {
  //     var n = -Math.pow(2,i) + 1;
  //     var ap = AsciiPack.pack(n);
  //     assert.equal(ap, t.int64 + (n & 0xffffffffffffffff).toString(16));
  //     assert.equal(AsciiPack.unpack(ap), n);
  //   }
  // },
  "uint4": function(){
    check_uint(t.uint4, [0, 4]);
  },
  "uint8": function(){
    check_uint(t.uint8, [4, 8]);
  },
  "uint16": function(){
    check_uint(t.uint16 + '0', [8, 12]);
    check_uint(t.uint16, [12, 16]);
  },
  "uint32": function(){
    check_uint(t.uint32 + '000', [16, 20]);
    check_uint(t.uint32 + '00',  [20, 24]);
    check_uint(t.uint32 + '0',   [24, 28]);
    check_uint(t.uint32,         [28, 32]);
  },
  "uint64": function(){
    check_uint(t.uint64 + '0000000', [32, 36]);
    check_uint(t.uint64 + '000000',  [36, 40]);
    check_uint(t.uint64 + '00000',   [40, 44]);
    check_uint(t.uint64 + '0000',    [44, 48]);
    check_uint(t.uint64 + '000',     [48, 52]);
    check_uint(t.uint64 + '00',      [52, 56]);
    check_uint(t.uint64 + '0',       [56, 60]);
    check_uint(t.uint64,             [60, 64]);
  },
  "float64": function(){
    var rets = [
      [-0.1, 'bfb999999999999a'],
      [1.0000000000000002, '3ff0000000000001'],
      [1.0000000000000004, '3ff0000000000002'],
      [1/3, '3fd5555555555555'],
      [Number.POSITIVE_INFINITY,'7ff0000000000000'],
      [Number.NEGATIVE_INFINITY,'fff0000000000000']
    ];
    for (var i = 0; i < rets.length; i++) {
      var ap = AsciiPack.pack(rets[i][0]);
      assert.equal(ap, t.float64+rets[i][1]);
      assert.equal(AsciiPack.unpack(ap), rets[i][0]);
    }
  },
  "map": function(){
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
    var array = [1,2,3,[4,5,[6]]];
    var ap = AsciiPack.pack(array);

    assert.equal(ap, t.array+4 + t.uint4+1 + t.uint4+2 + t.uint4+3 + t.array+3 + t.uint4+4 + t.uint4+5 + t.array+1 + t.uint4+6);
    assert.deepEqual(AsciiPack.unpack(ap), array);
  },
  "str4":function(){
    check_str(t.str4, 0xf);
  },
  "str8":function(){
    check_str(t.str8, 0xff);
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
//    check_str(t.str32,         0xffffffff);
  },
  "nil": function(){
    var nil = null;
    var ap = AsciiPack.pack(nil);
    assert.equal(ap, t.nil);
    assert.equal(AsciiPack.unpack(ap), null);
  },
  "mix": function(){
    var hash = {};
    var str8 = (new Array(0x100)).join('a');
    var str16 = (new Array(0x1000)).join('a');
    for (var i = 0; i < 50; i++) {
      var rand = i % 9;
      hash[i] = {
        0: [0,1,2,3,4,5,6,7,8,9],
        1: Math.random() + (Math.random() - 0.5) * 100000000,
        2: {hash:JSON.parse(JSON.stringify(hash))},
        3: '123abc',
        4: str8,
        5: str16,
        6: null,
        7: false,
        8: true,
      }[rand];
    }
    json_stringpack(hash);
  }
};

for (var it in test_case) {
  try {
    test_case[it]();
  } catch (ex) {
    console.error(ex.message);
    console.error(ex.stack);
  }
}

function json_stringpack(obj){
  var lens = {}, ap, json;
  bench("AsciiPack.pack", function(){
    ap = AsciiPack.pack(obj);
  });
  bench("AsciiPack.unpack", function(){
    AsciiPack.unpack(ap);
  });
  lens.aplen = ap.length;

  bench("JSON.stringify", function(){
    json = JSON.stringify(obj);
  });
  bench("JSON.parse", function(){
    JSON.parse(json);
  });
  lens.jsonlen = json.length;
  console.log(lens);
};
function bench(name, fn){
  var t = new Date();
  for(var i = 0; i < 100; i++) {
    fn();
  }
  console.log(name + ': ' + (new Date - t) + 'ms');
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
