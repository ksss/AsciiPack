module AsciiPack
  class Unpacker
    @@fixmap = {
      "0" => 0x0,
      "1" => 0x1,
      "2" => 0x2,
      "3" => 0x3,
      "4" => 0x4,
      "5" => 0x5,
      "6" => 0x6,
      "7" => 0x7,
      "8" => 0x8,
      "9" => 0x9,
      "A" => 0xa,
      "B" => 0xb,
      "C" => 0xc,
      "D" => 0xd,
      "E" => 0xe,
      "F" => 0xf,
      "W" => nil,
      "X" => false,
      "Y" => true,
    }.freeze

    def initialize (ap)
      @ap = ap
      @at = 0
      @ch = @ap[0]
    end

    def unpack
      move

      if @@fixmap.key?(@ch)
        return @@fixmap[@ch]
      end

      case @ch
      when "a"; int4
      when "b"; int8
      when "c"; int16
      when "d"; int32
      when "e"; int64
      when "g"; uint8
      when "h"; uint16
      when "i"; uint32
      when "j"; uint64
      when "l"; float64
      when "n"; str8
      when "o"; str16
      when "p"; str32
      when "r"; map4
      when "s"; map8
      when "t"; map16
      when "u"; map32
      when "v"; array4
      when "w"; array8
      when "x"; array16
      when "y"; array32
      when /[G-V]/; fixstr
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
      ret = @ap[@at...(@at + len)]
      @at += len
      @ch = @ap[@at]
      ret
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
      len = @ch.ord - 71 # 71 = "G".ord
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
