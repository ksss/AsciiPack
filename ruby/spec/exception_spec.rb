# encoding: utf-8

require 'spec_helper'

describe AsciiPack do
  it "unpacker error" do
    expect{ AsciiPack.unpack(nil) }.to raise_error
  end
end
