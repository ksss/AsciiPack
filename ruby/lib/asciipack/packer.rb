module AsciiPack
  class Packer
    class << self
      def pack (obj)
        case
        when obj.kind_of?(Hash)
          map(obj);
        when obj.kind_of?(Array)
          array(obj);
        when obj.kind_of?(Numeric)
          if obj.kind_of?(Integer)
            if 0 <= obj
              if obj < 0x10
                positive_fixint obj
              elsif obj < 0x100
                uint8 obj
              elsif obj < 0x10000
                uint16 obj
              elsif obj < 0x100000000
                uint32 obj
              elsif obj < 0x10000000000000000
                uint64 obj
              end
            else
              if -0x8 <= obj
                int4 obj
              elsif -0x80 <= obj
                int8 obj
              elsif -0x8000 <= obj
                int16 obj
              elsif -0x80000000 <= obj
                int32 obj
              elsif -0x8000000000000000 <= obj
                int64 obj
              else
                raise "pack size limit over"
              end
            end
          else
            float64 obj
          end
        when obj.kind_of?(String)
          case obj.length
          when 0...0x10
            fixstr obj
          when 0x10...0x100
            str8 obj
          when 0x100...0x10000
            str16 obj
          when 0x10000...0x100000000
            str32 obj
          else
            raise "pack size limit over"
          end
        when obj.nil?
          "W"
        when obj == false
          "X"
        when obj == true
          "Y"
        end
      end

      private

      def int4 (obj)
        "a" + ((obj & 0xf).to_s(16))
      end

      def int8 (obj)
        "b" + ((obj & 0xff).to_s(16))
      end

      def int16 (obj)
        "c" + ((obj & 0xffff).to_s(16))
      end

      def int16 (obj)
        "c" + ((obj & 0xffff).to_s(16))
      end

      def int32 (obj)
        "d" + ((obj & 0xffffffff).to_s(16))
      end

      def int64 (obj)
        "e" + ((obj & 0xffffffffffffffff).to_s(16))
      end

      def positive_fixint (obj)
        obj.to_s(16).upcase
      end

      def uint8 (obj)
        format_uint("g", 2, obj)
      end

      def uint16 (obj)
        format_uint("h", 4, obj)
      end

      def uint32 (obj)
        format_uint("i", 8, obj)
      end

      def uint64 (obj)
        format_uint("j", 16, obj)
      end

      def float64 (obj)
        unless obj.finite?
          case obj.infinite?
          when 1;  return "l" + '7ff0000000000000' # +∞
          when -1; return "l" + 'fff0000000000000' # -∞
          else;    return "l" + '7fffffffffffffff' # NAN
          end
        end

        sign = obj < 0
        obj *= -1 if sign
        exp = ((Math.log(obj) / Math.log(2, Math::E)) + 1023).to_i
        frac = obj * (2**(52 + 1023 - exp))
        low = frac.to_i & 0xffffffff
        exp |= 0x800 if sign
        high = ((frac / 0x100000000).to_i & 0xfffff) | (exp << 20)

        "l" + to_s16([
          (high >> 24) & 0xff, (high >> 16) & 0xff,
          (high >>  8) & 0xff, (high)       & 0xff,
          (low  >> 24) & 0xff, (low  >> 16) & 0xff,
          (low  >>  8) & 0xff, (low)        & 0xff
        ])
      end

      def fixstr (obj)
        (obj.length + 71).chr + obj
      end

      def str8 (obj)
        format_str "n", 2, obj
      end

      def str16 (obj)
        format_str "o", 4, obj
      end

      def str32 (obj)
        format_str "p", 8, obj
      end

      def map (obj)
      keys = [];
      obj.each { |key, value|
        keys.push(pack(key) + pack(value))
      }
      if keys.length < 0x10
        f = ["r", 1]
      elsif keys.length < 0x100
        f = ["s", 2]
      elsif keys.length < 0x10000
        f = ["t", 4]
      elsif keys.length < 0x100000000
        f = ["u", 8]
      else
        raise "pack size limit over"
      end
      format_uint(f[0], f[1], keys.length) + keys.join('');
      end

      def array (obj)
        keys = [];
        obj.each { |value|
          keys.push(pack(value));
        }
      if keys.length < 0x10
        f = ["v", 1]
      elsif keys.length < 0x100
        f = ["w", 2]
      elsif keys.length < 0x10000
        f = ["x", 4]
      elsif keys.length < 0x100000000
        f = ["y", 8]
      else
        raise "pack size limit over"
      end
      format_uint(f[0], f[1], keys.length) + keys.join('');
      end

      def format_uint (type, length, num)
        hex = num.to_s(16);
        len = length - hex.length;
        zero = '0' * len;
        type + zero + hex;
      end

      def format_str (type, length, str)
        hex = str.length.to_s(16);
        len = length - hex.length;
        zero = '0' * len;
        type + zero + hex + str;
      end

      def to_s16 (a)
        a.map { |i|
          hex = i.to_s(16)
          len = hex.length
          i = 2 - len
          ('0' * i) + hex
        }.join('')
      end
    end
  end

  class << self
    def pack (obj)
      Packer.pack obj
    end
  end
end
