# encoding: utf-8

require 'spec_helper'

describe AsciiPack do
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

  it "uint 4" do
    format 0x0, T.uint4, 2
    format 0xf, T.uint4, 2
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

  it "str 4" do
    format "", T.str4, 2
    format " " * 0xf, T.str4, 17
  end

  it "str 8" do
    format "a" * 0x10, T.str8, 3 + 0x10
    format "a" * 0xff, T.str8, 3 + 0xff
  end

  it "str 16" do
    format "a" * 0x100, T.str16, 5 + 0x100
    format "a" * 0xffff, T.str16, 5 + 0xffff
  end

  it "str 32" do
    format "a" * 0x10000, T.str32, 9 + 0x10000
    # too late
    # format "a" * 0xffffffff, T.str32, 9 + 0xffffffff
  end

  it "map" do
    format({}, T.map, 2)
    format({"hash" => {}}, T.map, 10)
    expect(AsciiPack.pack({})).to eq('q0')
  end

  it "array" do
    format([], T.array, 2)
    format([1,2,3], T.array, 8)
    expect(AsciiPack.pack([])).to eq('r0')
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
