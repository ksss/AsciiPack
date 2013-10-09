# encoding: ascii-8bit

require 'spec_helper'

describe AsciiPack do
  it "intro" do
    expect(AsciiPack.pack({"compact"=>true,"binary"=>0})).to eq('r2NcompactYMbinary0')
  end
  it "int 4" do
    format -1, T.int4, 2
    format -8, T.int4, 2
  end

  it "int 8" do
    format -0x9,  T.int8, 3
    format -0x80, T.int8, 3
  end

  it "int 16" do
    format -0x81,   T.int16, 5
    format -0x8000, T.int16, 5
  end

  it "int 32" do
    format -0x8001,     T.int32, 9
    format -0x80000000, T.int32, 9
  end

  it "int 64" do
    format -0x80000001,         T.int64, 17
    format -0x8000000000000000, T.int64, 17
  end

  it "positive fixint" do
    format 0x0, T.positive_fixint_0, 1
    format 0x1, T.positive_fixint_1, 1
    format 0xe, T.positive_fixint_E, 1
    format 0xf, T.positive_fixint_F, 1
  end

  it "uint 8" do
    format 0x10, T.uint8, 3
    format 0xff, T.uint8, 3
  end

  it "uint 16" do
    format 0x100,  T.uint16, 5
    format 0xffff, T.uint16, 5
  end

  it "uint 32" do
    format 0x10000,    T.uint32, 9
    format 0xffffffff, T.uint32, 9
  end

  it "uint 64" do
    format 0x100000000,        T.uint64, 17
    format 0xffffffffffffffff, T.uint64, 17
  end

  it "float 64" do
    format 1/3.0, T.float64, 17
    format 1.0, T.float64, 17
    format 0.1, T.float64, 17
    format -0.1, T.float64, 17
    expect(AsciiPack.pack(-0.1)).to eq(T.float64 + 'bfb999999999999a')
    expect(AsciiPack.pack(1.0)).to eq(T.float64 + '3ff0000000000000')
    expect(AsciiPack.pack(1.0000000000000002)).to eq(T.float64 + '3ff0000000000001')
    expect(AsciiPack.pack(1.0000000000000004)).to eq(T.float64 + '3ff0000000000002')
    expect(AsciiPack.pack(1/3.0)).to eq(T.float64 + '3fd5555555555555')
    expect(AsciiPack.pack(Float::NAN)).to eq(T.float64 + '7fffffffffffffff')
    expect(AsciiPack.pack(1 / 0.0)).to eq(T.float64 + '7ff0000000000000')
    expect(AsciiPack.pack(-1 / 0.0)).to eq(T.float64 + 'fff0000000000000')
  end

  it "fixbin" do
    format "", T.fixbin_0, 1
    format " ", T.fixbin_1, 2
    format " " * 0xe, T.fixbin_E, 15
    format " " * 0xf, T.fixbin_F, 16
  end

  it "bin 8" do
    format "a" * 0x10, T.bin8, 3 + 0x10
    format "a" * 0xff, T.bin8, 3 + 0xff
  end

  it "bin 16" do
    format "a" * 0x100, T.bin16, 5 + 0x100
    format "a" * 0xffff, T.bin16, 5 + 0xffff
  end

  it "bin 32" do
    format "a" * 0x10000, T.bin32, 9 + 0x10000
    # FIXME too late
    # format "a" * 0xffffffff, T.bin32, 9 + 0xffffffff
  end

  it "map 4" do
    format_map 0, T.map4
    format_map 0xf, T.map4
  end

  it "map 8" do
    format_map 0x10, T.map8
    format_map 0xff, T.map8
  end

  it "map 16" do
    format_map 0x100, T.map16
    format_map 0xffff, T.map16
  end

  it "map 32" do
    format_map 0x10000, T.map32
    # FIXME too late
    # format_map 0xffffffff, T.map32
  end

  it "array 4" do
    format_array 0, T.array4
    format_array 0xf, T.array4
  end

  it "array 8" do
    format_array 0x10, T.array8
    format_array 0xff, T.array8
  end

  it "array 16" do
    format_array 0x100, T.array16
    format_array 0xffff, T.array16
  end

  it "array 32" do
    format_array 0x10000, T.array32
    # FIXME too late
    # format_array 0xffffffff, T.array32
  end

  it "nil" do
    format nil, T.nil, 1
  end

  it "false" do
    format false, T.false, 1
  end

  it "true" do
    format true, T.true, 1
  end
end

def format (object, first, length)
  ap = AsciiPack.pack(object)
  expect(ap[0]).to eq(first)
  expect(ap.length).to eq(length)
  expect(AsciiPack.unpack(ap)).to eq(object)
end

def format_map (count, first)
  map = {}
  count.times{ |i| map[i] = 0 }
  ap = AsciiPack.pack(map)
  expect(ap[0]).to eq(first)
  expect(AsciiPack.unpack(ap)).to eq(map)
end

def format_array (count, first)
  array = []
  count.times{ |i| array[i] = 0 }
  ap = AsciiPack.pack(array)
  expect(ap[0]).to eq(first)
  expect(AsciiPack.unpack(ap)).to eq(array)
end
