# encoding: utf-8

require 'spec_helper'

describe "AsciiPack:memory" do
  it "packer:num" do
    check([1,1.1,-1.1,1.0/3.0,0xffffffffffffffff,-0x8000000000000000,0,Float::INFINITY] * 3)
  end

  it "packer:str" do
    check(["a"*100*1024*1024,"b"*1024*1024,"c"*1024] * 3)
  end

  def check (obj)
    packer = AsciiPack::Packer.new
    unpacker = AsciiPack::Unpacker.new

    obj.each {|i|
      packer.write i
      GC.start
      ap = packer.to_s
      GC.start
      unpacker.feed ap
      GC.start
      expect(unpacker.read).to eq(i)
      GC.start
      packer.clear
      GC.start
      unpacker.clear
      GC.start
      expect(packer.to_s).to eq("")
    }
    expect(AsciiPack.unpack(obj.to_asciipack)).to eq(obj)
  end
end

