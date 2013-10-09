#! /usr/bin/env node

var AsciiPack = require('./asciipack').AsciiPack;

function json_stringpack(name, obj){
  var lens = {}, ap, json;

  console.log('[' + name + ']');

  bench("AsciiPack.pack", function(){
    ap = AsciiPack.pack(obj);
  });
  bench("AsciiPack.unpack", function(){
    AsciiPack.unpack(ap);
  });

  bench("JSON.stringify", function(){
    json = JSON.stringify(obj);
  });
  bench("JSON.parse", function(){
    JSON.parse(json);
  });
  console.log({
    ap: ap,
    json: json
  });
};

function bench(name, fn){
  var t = new Date();
  for(var i = 0; i < 100000; i++) {
    fn();
  }
  console.log(name + ': ' + (new Date - t) + 'ms');
};

var str16 = (new Array(0x1000)).join('a');
var cases = {
  "positive fixint": 0,
  "uint 4": 16,
  "fixbin": "",
  "bin 8": '0123456789abcdef',
  "float 64": 1/3,
  "map 4": {},
  "array 4": [],
  "nil": null,
};

for (var key in cases) {
  json_stringpack(key, cases[key]);
}
