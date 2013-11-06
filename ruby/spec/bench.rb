#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
here = File.dirname(File.expand_path(__FILE__))
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'asciipack'
require 'json'
require 'msgpack'

def count
  1
end

def reports (obj)
  obj =[obj] * 10
  json = obj.to_json
  ap = AsciiPack.pack obj
  ms = Marshal.dump obj
  msg = MessagePack.pack obj

  {
    "AsciiPack.pack" => lambda { AsciiPack.pack obj },
    "AsciiPack.unpack" => lambda { AsciiPack.unpack ap },
    "MessagePack.pack" => lambda { MessagePack.pack obj },
    "MessagePack.unpack" => lambda { MessagePack.unpack msg },
    "JSON.generate" => lambda { obj.to_json },
    "JSON.parse" => lambda { JSON.parse json },
    "Marshal.dump" => lambda { Marshal.dump obj },
    "Marshal.load" => lambda { Marshal.load ms },
  }
end

def json_asciipack(name, obj)
  print("|" + name + "|")

  results = []
  reports(obj).each { |_, func|
    t = Time.now
    count.times {
      func.call
    }
    results << "%.6f" % ((Time.now - t) * 1000)
  }
  puts results.join("|") + "|"
end

puts("|object|" + reports(0).keys.join("|") + "|")
puts("|---|" + reports(0).keys.map{"---"}.join("|") + "|")

map16 = {}
0x10000.times {|i| map16[i.to_s] = 0 }

tt = Time.now
{
  "float 64" => [1/3] * 100,
  "str (1KB)" => ['a' * 1024],
  "str (1MB)" => ['a' * 1024*1024],
  "str (100MB)" => ['a' * 100*1024*1024],
  "map 32" => map16,
  "array 32" => Array.new(0x10000,0),
}.each { |key, value|
  json_asciipack key, value
}

puts "\n"
puts "count:#{count}"
puts "unit:/ms"
puts 'total:' + (Time.now - tt).to_s + 's'

