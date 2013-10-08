#! /usr/bin/env node

var AsciiPack = require('./asciipack').AsciiPack;

function json_stringpack(obj){
  var lens = {}, ap, json;

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

json_stringpack(hash);
