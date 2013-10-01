require 'asciipack/typemap.rb'

module AsciiPack
  class Unpacker
    def initialize (ap)
      @ap = ap
      @ret = nil
      @at = 0
      @ch = @ap[0]
    end

    def unpack
      move
      case @ch
      when TypeMap.int4; int4
      when TypeMap.int8; int8
      when TypeMap.int16; int16
      when TypeMap.int32; int32
      when TypeMap.int64; int64
      when TypeMap.uint4; uint4
      when TypeMap.uint8; uint8
      when TypeMap.uint16; uint16
      when TypeMap.uint32; uint32
      when TypeMap.uint64; uint64
      when TypeMap.float64; float64
      when TypeMap.map; map
      when TypeMap.array; array
      when TypeMap.str4; str4
      when TypeMap.str8; str8
      when TypeMap.str16; str16
      when TypeMap.str32; str32
      when TypeMap.nil; nil
      when TypeMap.false; false
      when TypeMap.true; true
      else raise "undefined type " + @ch.to_s
      end
    end

private

    def move
      @ch = @ap[@at]
      @at = @at + 1
      @ch
    end

    def back
      @ch = @ap[@at]
      @at -= 1
      @ch
    end

    def cut (len)
      @ret = @ap[@at...(@at + len)]
      @at += len
      @ch = @ap[@at]
      @ret
    end

    def length
      ret = []
      while (/\d/ =~ @ch)
        ret << @ch
        move()
      end
      back()
      ret.join('').to_i
    end

    def int4
      move
      i = @ch.to_i(16)
      return (@ch[0].to_i(16) < 0x8) ? i : i - 0x10;
    end

    def int8
      c = cut(2)
      i = c.to_i(16)
      return (c[0].to_i(16) < 0x8) ? i : i - 0x100;
    end

    def int16
      c = cut(4)
      i = c.to_i(16)
      return (c[0].to_i(16) < 0x8) ? i : i - 0x10000;
    end

    def int32
      c = cut(8)
      i = c.to_i(16)
      return (c[0].to_i(16) < 0x8) ? i : i - 0x100000000;
    end

    def int64
      c = cut(16)
      i = c.to_i(16)
      return (c[0].to_i(16) < 0x8) ? i : i - 0x10000000000000000;
    end

    def uint4
      move.to_i(16)
    end

    def uint8
      cut(2).to_i(16)
    end

    def uint16
      cut(4).to_i(16)
    end

    def uint32
      cut(8).to_i(16)
    end

    def uint64
      cut(16).to_i(16)
    end

    def float64
      # IEEE 752 format
      hex = cut(3)
      num = hex.to_i(16)
      sign = num & 0x800
      exp = (num & 0x7ff) - 1023
      frac = ('1' + cut(13)).to_i(16)

      if hex == '7ff' && frac != 0
        return Float.NAN
      elsif hex == '7ff' && frac == 0
        return Float.INFINITY
      elsif hex == 'fff' && frac == 0
        return -1 / 0.0
      end

      ((sign == 0 ? 1 : -1) * frac * (2**(exp - 52))).to_f
    end

    def map
      move
      hash = {}
      len = length()
      len.times {
        key = unpack
        hash[key] = unpack
      }
      hash
    end

    def array
      move
      array = []
      len = length()
      len.times {
        array << unpack
      }
      array
    end

    def str4
      len = cut(1).to_i(16)
      cut(len)
    end

    def str8
      len = cut(2).to_i(16)
      cut(len)
    end

    def str16
      len = cut(4).to_i(16)
      cut(len)
    end

    def str32
      len = cut(8).to_i(16)
      cut(len)
    end
  end

  class << self
    def unpack (obj)
      unpacker = Unpacker.new obj
      unpacker.unpack
    end
  end
end
