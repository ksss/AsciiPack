#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'asciipack'
require 'json'
require 'msgpack'
require 'benchmark'

value = {}
30.times { |i|
  value[i] = case i % 5
             when 0; 0xffffffff
             when 1; " " * 0xffff
             when 2; [1.1, -1.1, 1/3, 5]
             when 3; JSON.parse(value.to_json)
             when 4; nil
             end
}
json = JSON.generate value
ap = AsciiPack.pack value
ms = Marshal.dump value
msg = MessagePack.pack value
n = 10

Benchmark.bm do |x|
  x.report("JSON.generate") {n.times{ JSON.generate value }}
  x.report("JSON.parse") {n.times{ JSON.parse json }}
  x.report("AsciiPack.pack") {n.times{ AsciiPack.pack value }}
  x.report("AsciiPack.unpack") {n.times{ AsciiPack.unpack ap }}
  x.report("Marshal.dump") {n.times{ Marshal.dump value }}
  x.report("Marshal.load") {n.times{ Marshal.load ms }}
  x.report("MessagePack.pack") {n.times{ MessagePack.pack value }}
  x.report("MessagePack.unpack") {n.times{ MessagePack.unpack msg }}
end

