#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'asciipack'
require 'json'
require 'msgpack'

def json_asciipack(name, obj)
  obj = [obj]
  json = obj.to_json
  ap = AsciiPack.pack obj
  ms = Marshal.dump obj
  msg = MessagePack.pack obj

  p '[' + name + ']'
  bench "AsciiPack.pack" do AsciiPack.pack obj end
  bench "AsciiPack.unpack" do AsciiPack.unpack ap end
  bench "JSON.generate" do obj.to_json end
  bench "JSON.parse" do JSON.parse json end
  bench "Marshal.dump" do Marshal.dump obj end
  bench "Marshal.load" do Marshal.load ms end
  bench "MessagePack.pack" do MessagePack.pack obj end
  bench "MessagePack.unpack" do MessagePack.unpack msg end
  p({
    :ap => ap.length,
    :json => json.length,
    :marshal => ms.length,
    :msgpack => msg.length
  })
end

def bench(name)
  t = Time.now
  100000.times {
    yield
  }
  p name + ': ' + (Time.now - t).to_s + 'ms'
end

{
  "positive fixint" => 0,
  "uint 4" => 16,
  "fixbin" => "",
  "bin 8" => '0123456789abcdef',
  "float 64" => 1/3,
  "map 4" => {},
  "array 4" => [],
  "nil" => nil,
}.each { |key, value|
  json_asciipack key, value
}

