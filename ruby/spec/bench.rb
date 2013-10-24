#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'asciipack'
require 'json'
require 'msgpack'

def count
  100000
end

puts "count:#{count}"
def json_asciipack(name, obj)
#  obj = [obj]
#  json = obj.to_json
  ap = AsciiPack.pack obj
#  ms = Marshal.dump obj
  msg = MessagePack.pack obj

  puts '[' + name + ']'
  bench "AsciiPack.pack" do AsciiPack.pack obj end
  bench "AsciiPack.unpack" do AsciiPack.unpack ap end
#  bench "JSON.generate" do obj.to_json end
#  bench "JSON.parse" do JSON.parse json end
#  bench "Marshal.dump" do Marshal.dump obj end
#  bench "Marshal.load" do Marshal.load ms end
  bench "MessagePack.pack" do MessagePack.pack obj end
  bench "MessagePack.unpack" do MessagePack.unpack msg end
#  p({
#    :ap => ap.length,
#    :json => json.length,
#    :marshal => ms.length,
#    :msgpack => msg.length
#  })
end

def bench(name)
  t = Time.now
  count.times {
    yield
  }
  puts name + ': ' + (Time.now - t).to_s + 's'
end

tt = Time.now
{
  "positive fixint" => 0,
  "uint 4" => 16,
  "uint 64" => 0xffffffffffffffff,
  "int 4" => -1,
  "int 64" => -0x8000000000000000,
#  "fixstr" => "",
#  "str 8" => '0123456789abcdef',
  "float 64" => 1/3,
  "map 4" => {},
  "array 4" => [],
  "array 8" => Array.new(16,0),
  "nil" => nil,
}.each { |key, value|
  json_asciipack key, value
}

p 'total: ' + (Time.now - tt).to_s + 's'
