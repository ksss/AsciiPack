require 'spec_helper'

describe AsciiPack::Unpacker do
  let :unpacker do
    AsciiPack::Unpacker.new
  end

  it "read:to_s:clear" do
    unpacker.feed "W"
    expect(unpacker.read).to eq(nil)

    unpacker.feed "X"
    expect(unpacker.read).to eq(false)

    unpacker.feed "Y"
    expect(unpacker.read).to eq(true)
  end
end
