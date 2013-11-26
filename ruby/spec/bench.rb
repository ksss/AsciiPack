#! /usr/bin/env ruby

lib = File.expand_path('../../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'asciipack'
require 'json'
require 'msgpack'

def memoryusage()
  status = `cat /proc/#{$$}/status 2> /dev/null`
  return 0 if status == ""
  lines = status.split("\n")
  lines.each do |line|
    if line =~ /^VmRSS:/
      line.gsub!(/.*:\s*(\d+).*/, '\1')
      return line.to_i / 1024.0
    end
  end
  0
end

def reports
  map32 = {}
  0x10000.times {|i| map32[i.to_s] = 0 }

  {
    "uint64" => [0xffffffffffffffff] * 10000,
    "float64" => [1.0/3.0] * 10000,
    "str(1KB)" => ['a' * 1024],
    "str(1MB)" => ['a' * 1024*1024],
    "str(100MB)" => ['a' * 100*1024*1024],
    "map32" => map32,
    "array32" => Array.new(0x10000,0),
  }
end
puts "results of [bench.rb](https://github.com/ksss/AsciiPack/blob/master/ruby/spec/bench.rb)"
puts ""
puts "|RUBY_VERSION:#{RUBY_VERSION}|" + reports.keys.join('|') + "|memory|"
puts "|---|" + reports.keys.map{"---:"}.join("|") + "|---:|"

tt = Time.now

[
  ["AsciiPack.pack", lambda{|obj| AsciiPack.pack obj}, lambda{|obj| obj}],
  ["AsciiPack.unpack", lambda{|obj| AsciiPack.unpack obj}, lambda{|obj| AsciiPack.pack(obj)}],
  ["MessagePack.pack", lambda{|obj| MessagePack.pack obj}, lambda{|obj| obj}],
  ["MessagePack.unpack", lambda{|obj| MessagePack.unpack obj}, lambda{|obj| MessagePack.pack(obj)}],
  ["JSON.dump", lambda{|obj| JSON.dump obj}, lambda{|obj| obj}],
  ["JSON.load", lambda{|obj| JSON.load obj}, lambda{|obj| JSON.dump(obj)}],
  ["Marshal.dump", lambda{|obj| Marshal.dump obj}, lambda{|obj| obj}],
  ["Marshal.load", lambda{|obj| Marshal.load obj}, lambda{|obj| Marshal.dump(obj)}],
].each do |title, fn, args|
  print "|#{title}|"
  GC.start
  mem = memoryusage
  reports.each do |name, value|
    arg = args.call(value)
    t = Time.now
    fn.call(arg)
    print "%.6f|" % (Time.now - t)
  end
  print "%.3fMB|" % (memoryusage - mem)
  puts ""
end
