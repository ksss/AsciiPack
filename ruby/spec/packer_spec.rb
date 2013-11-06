require 'spec_helper'

describe AsciiPack::Packer do
  let :packer do
    AsciiPack::Packer.new
  end

  it "pack:to_s:clear" do
    packer.write nil
    expect(packer.to_s).to eq(T.nil)

    packer.write 0
    expect(packer.to_s).to eq(T.nil + T.positive_fixint_0)

    packer.write "a"
    expect(packer.to_s).to eq(T.nil + T.positive_fixint_0 + T.fixstr_1 + "a")

    packer.clear
    expect(packer.to_s).to eq("")

    packer.write nil
    expect(packer.to_s).to eq(T.nil)
  end
end
