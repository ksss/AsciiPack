# encoding: utf-8

require 'spec_helper'

describe "AsciiPack:exception" do
  it "unpacker raise error" do
    expect{ AsciiPack.unpack(nil) }.to raise_error
  end
end
