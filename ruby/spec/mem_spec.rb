# encoding: utf-8

require 'spec_helper'

describe "AsciiPack:memory" do
  it "num" do
    packer = AsciiPack::Packer.new
    obj = ["a"*1000000]
    obj = obj * 1
    obj.each {|i|
      packer.write(i)
      s = packer.to_s
      expect(AsciiPack.unpack(s)).to eq(i)
      packer.clear
    }
    expect(AsciiPack.unpack(obj.to_asciipack)).to eq(obj)
  end
end

