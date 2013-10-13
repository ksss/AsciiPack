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
      when /[0-9A-F]/; positive_fixint
      when /[G-V]/; fixstr
      when TypeMap.int4; int4
      when TypeMap.int8; int8
      when TypeMap.int16; int16
      when TypeMap.int32; int32
      when TypeMap.int64; int64
      when TypeMap.uint8; uint8
      when TypeMap.uint16; uint16
      when TypeMap.uint32; uint32
      when TypeMap.uint64; uint64
      when TypeMap.float64; float64
      when TypeMap.map4; map4
      when TypeMap.map8; map8
      when TypeMap.map16; map16
      when TypeMap.map32; map32
      when TypeMap.array4; array4
      when TypeMap.array8; array8
      when TypeMap.array16; array16
      when TypeMap.array32; array32
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
      @at += 1
      @ch
    end

    def cut (len)
      @ret = @ap[@at...(@at + len)]
      @at += len
      @ch = @ap[@at]
      @ret
    end

    def int4
      move
      i = @ch.to_i(16)
      (@ch[0].to_i(16) < 0x8) ? i : i - 0x10;
    end

    def int8
      c = cut(2)
      i = c.to_i(16)
      (c[0].to_i(16) < 0x8) ? i : i - 0x100;
    end

    def int16
      c = cut(4)
      i = c.to_i(16)
      (c[0].to_i(16) < 0x8) ? i : i - 0x10000;
    end

    def int32
      c = cut(8)
      i = c.to_i(16)
      (c[0].to_i(16) < 0x8) ? i : i - 0x100000000;
    end

    def int64
      c = cut(16)
      i = c.to_i(16)
      (c[0].to_i(16) < 0x8) ? i : i - 0x10000000000000000;
    end

    def positive_fixint
      @ch.to_i(16)
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

    def map (length)
      len = cut(length).to_i(16)
      hash = {}
      len.times {
        key = unpack
        hash[key] = unpack
      }
      hash
    end

    def map4; map(1) end
    def map8; map(2) end
    def map16; map(4) end
    def map32; map(8) end

    def array (length)
      len = cut(length).to_i(16)
      array = []
      len.times {
        array << unpack
      }
      array
    end

    def array4; array(1) end
    def array8; array(2) end
    def array16; array(4) end
    def array32; array(8) end

    def fixstr
      len = @ch.ord - 71 # 71 = TypeMap.fixstr_0.ord
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
