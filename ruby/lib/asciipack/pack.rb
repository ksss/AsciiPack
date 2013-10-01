require 'asciipack/typemap.rb'

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
                uint4 obj
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
            str4 obj
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
          TypeMap.nil
        when obj == false
          TypeMap.false
        when obj == true
          TypeMap.true
        end
      end

      private

      def int4 (obj)
        TypeMap.int4 + ((obj & 0xf).to_s(16))
      end

      def int8 (obj)
        TypeMap.int8 + ((obj & 0xff).to_s(16))
      end

      def int16 (obj)
        TypeMap.int16 + ((obj & 0xffff).to_s(16))
      end

      def int16 (obj)
        TypeMap.int16 + ((obj & 0xffff).to_s(16))
      end

      def int32 (obj)
        TypeMap.int32 + ((obj & 0xffffffff).to_s(16))
      end

      def int64 (obj)
        TypeMap.int64 + ((obj & 0xffffffffffffffff).to_s(16))
      end

      def uint4 (obj)
        format_uint(TypeMap.uint4, 1, obj)
      end

      def uint8 (obj)
        format_uint(TypeMap.uint8, 2, obj)
      end

      def uint16 (obj)
        format_uint(TypeMap.uint16, 4, obj)
      end

      def uint32 (obj)
        format_uint(TypeMap.uint32, 8, obj)
      end

      def uint64 (obj)
        format_uint(TypeMap.uint64, 16, obj)
      end

      def float64 (obj)
        unless obj.finite?
          case obj.infinite?
          when 1;  return TypeMap.float64 + '7ff0000000000000' # +∞
          when -1; return TypeMap.float64 + 'fff0000000000000' # -∞
          else;    return TypeMap.float64 + '7fffffffffffffff' # NAN
          end
        end

        sign = obj < 0
        obj *= -1 if sign
        exp = ((Math.log(obj) / Math.log(2, Math::E)) + 1023).to_i
        frac = obj * (2**(52 + 1023 - exp))
        low = frac.to_i & 0xffffffff
        exp |= 0x800 if sign
        high = ((frac / 0x100000000).to_i & 0xfffff) | (exp << 20)

        TypeMap.float64 + to_s16([
          (high >> 24) & 0xff, (high >> 16) & 0xff,
          (high >>  8) & 0xff, (high)       & 0xff,
          (low  >> 24) & 0xff, (low  >> 16) & 0xff,
          (low  >>  8) & 0xff, (low)        & 0xff
        ])
      end

      def str4 (obj)
        format_str TypeMap.str4, 1, obj
      end

      def str8 (obj)
        format_str TypeMap.str8, 2, obj
      end

      def str16 (obj)
        format_str TypeMap.str16, 4, obj
      end

      def str32 (obj)
        format_str TypeMap.str32, 8, obj
      end

      def map (obj)
        keys = [];
        obj.each { |key, value|
          keys.push(pack(key.to_s) + pack(value));
        }
        TypeMap.map + keys.length.to_s + keys.join('');
      end

      def array (obj)
        keys = [];
        obj.each { |value|
          keys.push(pack(value));
        }
        TypeMap.array + keys.length.to_s + keys.join('');
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
