#! /usr/bin/env node

var global = (function(){ return this })();
var AsciiPack = require('./asciipack').AsciiPack;
var assert = require('./assert').assert;
var util = require('util');

global.AsciiPack = AsciiPack;
global.assert = assert;
require('./test').run(function(){
  util.print('.');
}, function(){
  util.print('\n');
  console.log('all test done.');
});
