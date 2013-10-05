module AsciiPack
  class TypeMap
    @@typemap = {
      :int4 =>    'a',
      :int8 =>    'b',
      :int16 =>   'c',
      :int32 =>   'd',
      :int64 =>   'e',
      :uint4 =>   'f',
      :uint8 =>   'g',
      :uint16 =>  'h',
      :uint32 =>  'i',
      :uint64 =>  'j',
      :float32 => 'k',
      :float64 => 'l',
      :str4 =>    'm',
      :str8 =>    'n',
      :str16 =>   'o',
      :str32 =>   'p',
      :map =>     'q',
      :array =>   'r',
      :nil =>     's',
      :false =>   't',
      :true =>    'u',
    }
    class << self
      def typemap
        @@typemap
      end

      @@typemap.each do |name, char|
        module_eval %{
          def #{name}
            "#{char}"
          end
        }
      end

    end
  end
end
