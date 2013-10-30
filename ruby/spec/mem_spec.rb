# encoding: utf-8

require 'spec_helper'

here = File.dirname(File.expand_path(__FILE__))

describe "AsciiPack:memory" do
  it "num" do
    obj = [0,0xf,0xff,0xffff,0xffffffff,0xffffffffffffffff,-1,-0x80,-0x8000,-0x80000000,-0x8000000000000000,0.1,1.0000000000000002,-0.1,0.0,1/3,Float::INFINITY]
    obj = obj * 1000
    ap = obj.to_asciipack
    expect(AsciiPack.unpack(ap)).to eq(obj)
  end
end

