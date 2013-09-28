#! /usr/bin/env node

var global = (function(){ return this })();
var AsciiPack = require('./asciipack').AsciiPack;
var assert = require('./assert').assert;

global.AsciiPack = AsciiPack;
global.assert = assert;
require('./test').run();
