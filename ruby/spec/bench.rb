#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'asciipack'
require 'json'
require 'msgpack'

def count
  1
end

def reports (obj)
  obj = [obj] * 100
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
    results << "%.1f" % ((Time.now - t) * 1000)
  }
  puts results.join("|") + "|"
end

puts("|object|" + reports(0).keys.join("|") + "|")
puts("|---|" + reports(0).keys.map{"---"}.join("|") + "|")

map16 = {}
0x100.times {|i| map16[i.to_s] = 0 }

tt = Time.now
{
  "positive fixint" => 0,
  "uint 64" => 0xffffffffffffffff,
  "int 4" => -1,
  "int 64" => -0x8000000000000000,
  "float 64" => 1/3,
  "fixstr" => "a",
  "str (1KB)" => 'a' * 1024,
  "str (1MB)" => 'a' * 1024*1024,
  "map 4" => {},
  "map 16" => map16,
  "array 4" => [],
  "array 16" => Array.new(0x100,0),
  "nil" => nil,
}.each { |key, value|
  json_asciipack key, value
}

puts "\n"
puts "count:#{count}"
puts "unit:/ms"
puts 'total:' + (Time.now - tt).to_s + 's'

