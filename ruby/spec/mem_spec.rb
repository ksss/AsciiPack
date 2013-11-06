# encoding: utf-8

require 'spec_helper'

describe "AsciiPack:memory" do
  it "packer:num" do
    check([1,1.1,-1.1,1/3,0xffffffffffffffff,-0x8000000000000000,0,Float::INFINITY] * 10)
  end

  it "packer:str" do
    check(["a"*100*1024*1024,"b"*1024*1024,"c"*1024] * 10)
  end

  def check (obj)
    packer = AsciiPack::Packer.new
    obj.each {|i|
      packer.write i
      GC.start
      expect(AsciiPack.unpack(packer.to_s)).to eq(i)
      GC.start
      packer.clear
      expect(packer.to_s).to eq("")
    }
    ap = obj.to_asciipack
    expect(AsciiPack.unpack(ap)).to eq(obj)
  end
end

