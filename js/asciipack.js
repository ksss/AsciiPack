this.AsciiPack = this.AsciiPack || (function(){
  var AsciiPack = function(){};
  var typemap = {
    int4:              'a',
    int8:              'b',
    int16:             'c',
    int32:             'd',
    int64:             'e',
//  (blank):           'f',
    uint8:             'g',
    uint16:            'h',
    uint32:            'i',
    uint64:            'j',
    float32:           'k',
    float64:           'l',
//  (blank):           'm',
    str8:              'n',
    str16:             'o',
    str32:             'p',
//  (blank):           'q',
    map4:              'r',
    map8:              's',
    map16:             't',
    map32:             'u',
    array4:            'v',
    array8:            'w',
    array16:           'x',
    array32:           'y',
//  (blank):           'z',
    positive_fixint_0: '0',
    positive_fixint_1: '1',
    positive_fixint_2: '2',
    positive_fixint_3: '3',
    positive_fixint_4: '4',
    positive_fixint_5: '5',
    positive_fixint_6: '6',
    positive_fixint_7: '7',
    positive_fixint_8: '8',
    positive_fixint_9: '9',
    positive_fixint_A: 'A',
    positive_fixint_B: 'B',
    positive_fixint_C: 'C',
    positive_fixint_D: 'D',
    positive_fixint_E: 'E',
    positive_fixint_F: 'F',
    fixstr_0:          'G',
    fixstr_1:          'H',
    fixstr_2:          'I',
    fixstr_3:          'J',
    fixstr_4:          'K',
    fixstr_5:          'L',
    fixstr_6:          'M',
    fixstr_7:          'N',
    fixstr_8:          'O',
    fixstr_9:          'P',
    fixstr_A:          'Q',
    fixstr_B:          'R',
    fixstr_C:          'S',
    fixstr_D:          'T',
    fixstr_E:          'U',
    fixstr_F:          'V',
    nil:               'W',
    false:             'X',
    true:              'Y',
//  (blank):           'Z',
  };
  AsciiPack.typemap = typemap;
  AsciiPack.pack = function(object){
    var packer = new AsciiPack.Packer();
    return packer.pack(object);
  };
  AsciiPack.Packer = function(obj){
    this.obj = obj;
  };
  AsciiPack.Packer.prototype = {
    toString16: function(a){
      return a.map(function(i){
        var hex = i.toString(16);
        var len = hex.length;
        var i = 2 - len;
        while (i--) {
          hex = '0' + hex;
        }
        return hex;
      }).join('');
    },
    format_uint: function(type, length, num){
      var hex = num.toString(16);
      var len = length - hex.length;
      var zero = '';
      while(len--) zero += '0';
      return type + zero + hex;
    },
    positive_fixint: function(obj){
      return obj.toString(16).toUpperCase();
    },
    uint8: function(obj){
      return this.format_uint(typemap.uint8, 2, obj);
    },
    uint16: function(obj){
      return this.format_uint(typemap.uint16, 4, obj);
    },
    uint32: function(obj){
      return this.format_uint(typemap.uint32, 8, obj);
    },
    uint64: function(obj){
      return this.format_uint(typemap.uint64, 16, obj);
    },
    int4: function(obj){
      return typemap.int4 + ((obj & 0xf).toString(16));
    },
    int8: function(obj){
      return typemap.int8 + ((obj & 0xff).toString(16));
    },
    int16: function(obj){
      return typemap.int16 + this.toString16([
        (obj >> 8) & 0xff, (obj) & 0xff
      ]);
    },
    int32: function(obj){
      return typemap.int32 + this.toString16([
        (obj >> 24) & 0xff, (obj >> 16) & 0xff,
        (obj >> 8)  & 0xff, (obj)       & 0xff
      ]);
    },
    int64: function(obj){
      var high = Math.floor(obj / 0x100000000);
      var low = obj & 0xffffffff;
      return typemap.int64 + this.toString16([
        (high >> 24) & 0xff, (high >> 16) & 0xff,
        (high >> 8)  & 0xff, (high)       & 0xff,
        (low >> 24)  & 0xff, (low >> 16)  & 0xff,
        (low >> 8)   & 0xff, (low)        & 0xff
      ]);
    },
    float64: function(obj){
      var sign = obj < 0;
      if (sign) obj *= -1;
      var exp = ((Math.log(obj) / Math.LN2) + 1023) | 0;
      var frac = obj * Math.pow(2, 52 + 1023 - exp);
      var low = frac & 0xffffffff;
      if (sign) exp |= 0x800;
      var high = ((frac / 0x100000000) & 0xfffff) | (exp << 20);

      return typemap.float64 + this.toString16([
        (high >> 24) & 0xff, (high >> 16) & 0xff,
        (high >>  8) & 0xff, (high)       & 0xff,
        (low  >> 24) & 0xff, (low  >> 16) & 0xff,
        (low  >>  8) & 0xff, (low)        & 0xff
      ]);
    },
    map: function(obj){
      var keys = [];
      var f;
      for (var key in obj) if (obj.hasOwnProperty(key)) {
        keys.push(this.pack(key) + this.pack(obj[key]));
      }
      if (keys.length < 0x10) {
        f = [typemap.map4, 1];
      } else if (keys.length < 0x100) {
        f = [typemap.map8, 2];
      } else if (keys.length < 0x10000) {
        f = [typemap.map16, 4];
      } else if (keys.length < 0x100000000) {
        f = [typemap.map32, 8];
      } else {
        throw new RangeError("pack size limit over");
      }
      return this.format_uint(f[0], f[1], keys.length) + keys.join('');
    },
    array: function(obj){
      var keys = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        keys.push(this.pack(obj[i]));
      }
      if (keys.length < 0x10) {
        f = [typemap.array4, 1];
      } else if (keys.length < 0x100) {
        f = [typemap.array8, 2];
      } else if (keys.length < 0x10000) {
        f = [typemap.array16, 4];
      } else if (keys.length < 0x100000000) {
        f = [typemap.array32, 8];
      } else {
        throw new RangeError("pack size limit over");
      }
      return this.format_uint(f[0], f[1], keys.length) + keys.join('');
    },
    format_str: function(type, length, str){
      var hex = str.length.toString(16);
      var len = length - hex.length;
      var zero = '';
      while (len--) zero += '0';
      return type + zero + hex + str;
    },
    fixstr: function(str){
      return String.fromCharCode(str.length + 71) + str;
    },
    str8: function(str){
      return typemap.str8 + str.length.toString(16) + str;
    },
    str16: function(str){
      return this.format_str(typemap.str16, 4, str);
    },
    str32: function(str){
      return this.format_str(typemap.str32, 8, str);
    },
    pack: function(obj){
      switch ({}.toString.call(obj)) {

      case '[object Object]':
        return this.map(obj);

      case '[object Array]':
        return this.array(obj);

      case '[object Null]':
      case '[object Undefined]':
        return typemap.nil;

      case '[object Boolean]':
        if (obj === true) {
          return typemap.true;
        } else {
          return typemap.false;
        }

      case '[object Number]':
        if (obj !== obj) { // NaN
          return typemap.float64 + '7fffffffffffffff';
        } else if (obj === Number.POSITIVE_INFINITY) {
          return typemap.float64 + '7ff0000000000000';
        } else if (obj === Number.NEGATIVE_INFINITY) {
          return typemap.float64 + 'fff0000000000000';
        } else if (Math.floor(obj) === obj) {
          if (0 <= obj) {
            if (obj < 0x10) {
              return this.positive_fixint(obj);
            } else if (obj < 0x100) {
              return this.uint8(obj);
            } else if (obj < 0x10000) {
              return this.uint16(obj);
            } else if (obj < 0x100000000) {
              return this.uint32(obj);
            } else if (obj < 0x10000000000000000) {
              return this.uint64(obj);
            } else {
              throw new RangeError("pack size limit over");
            }
          } else {
            if (-0x8 <= obj) {
              return this.int4(obj);
            } else if (-0x80 <= obj) {
              return this.int8(obj);
            } else if (-0x8000 <= obj) {
              return this.int16(obj);
            } else if (-0x80000000 <= obj) {
              return this.int32(obj);
            } else if (-0x8000000000000000 <= obj){
              return this.int64(obj);
            } else {
              throw new RangeError("pack size limit over");
            }
          }
        } else {
          return this.float64(obj);
        }

      case '[object String]':
        if (obj.length < 0x10) {
          return this.fixstr(obj);
        } else if (obj.length < 0x100) {
          return this.str8(obj);
        } else if (obj.length < 0x10000) {
          return this.str16(obj);
        } else if (obj.length < 0x100000000) {
          return this.str32(obj);
        } else {
          throw new RangeError("pack size limit over");
        }
      };
    }
  };

  AsciiPack.unpack = function(ap){
    var unpacker = new AsciiPack.Unpacker(ap);
    return unpacker.unpack();
  };
  AsciiPack.Unpacker = function(ap){
    this.ap = ap;
    this.at = 0;
    this.ch = ap[0];
    return this;
  };
  AsciiPack.Unpacker.prototype = {
    next: function(){
      this.ch = this.ap[this.at];
      this.at += 1;
      return this.ch;
    },
    cut: function(len){
      var ret = this.ap.substr(this.at, len);
      this.at += len;
      this.ch = this.ap[this.at - 1];
      return ret;
    },
    positive_fixint: function(){
      return parseInt(this.ch, 16);
    },
    uint8: function(){
      return parseInt(this.cut(2), 16);
    },
    uint16: function(){
      return parseInt(this.cut(4), 16);
    },
    uint32: function(){
      return parseInt(this.cut(8), 16);
    },
    uint64: function(){
      return parseInt(this.cut(16), 16);
    },
    int4: function(){
      this.next();
      var i = parseInt(this.ch, 16);
      return (this.ch[0] < 0x8) ? i : i - 0x10;
    },
    int8: function(){
      var c = this.cut(2);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x100;
    },
    int16: function(){
      var c = this.cut(4);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x10000;
    },
    int32: function(){
      var c = this.cut(8);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x100000000;
    },
    int64: function(){
      var c = this.cut(16);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x10000000000000000;
    },
    float64: function(){
      var hex = this.cut(3);
      var num = parseInt(hex, 16);
      var sign = num & 0x800;
      var exp = (num & 0x7ff) - 1023;
      var frac = parseInt(this.cut(13), 16) * Math.pow(2, -52);
      if (hex === '7ff' && frac !== 0) {
        return Number.NaN;
      } else if (hex === '7ff' && frac === 0) {
        return Number.POSITIVE_INFINITY;
      } else if (hex === 'fff' && frac === 0) {
        return Number.NEGATIVE_INFINITY;
      } else {
        return (sign ? -1 : 1) * (Math.pow(2, exp)) * (frac + 1);
      }
    },
    map: function(length){
      var len = parseInt(this.cut(length), 16);
      var _map = {};
      while (len--) {
        _map[this.unpack()] = this.unpack();
      }
      return _map;
    },
    array: function(length){
      var len = parseInt(this.cut(length), 16);
      var _array = [];
      while (len--) {
        _array.push(this.unpack());
      }
      return _array;
    },
    map4: function(){ return this.map(1); },
    map8: function(){ return this.map(2); },
    map16: function(){ return this.map(4); },
    map32: function(){ return this.map(8); },
    array4: function(){ return this.array(1); },
    array8: function(){ return this.array(2); },
    array16: function(){ return this.array(4); },
    array32: function(){ return this.array(8); },
    fixstr: function () {
      var len = parseInt(this.ch.charCodeAt(0) - 71, 16); // 71 = typemap.fixstr_0.charCodeAt(0)
      return this.cut(len);
    },
    str8: function () {
      var len = parseInt(this.cut(2), 16);
      return this.cut(len);
    },
    str16: function () {
      var len = parseInt(this.cut(4), 16);
      return this.cut(len);
    },
    str32: function () {
      var len = parseInt(this.cut(8), 16);
      return this.cut(len);
    },

    unpack: function(){
      this.next();
      switch (this.ch) {
      case typemap.int4:    return this.int4();
      case typemap.int8:    return this.int8();
      case typemap.int16:   return this.int16();
      case typemap.int32:   return this.int32();
      case typemap.int64:   return this.int64();
      case typemap.uint8:   return this.uint8();
      case typemap.uint16:  return this.uint16();
      case typemap.uint32:  return this.uint32();
      case typemap.uint64:  return this.uint64();
      case typemap.float64: return this.float64();
      case typemap.str8:    return this.str8();
      case typemap.str16:   return this.str16();
      case typemap.str32:   return this.str32();
      case typemap.map4:    return this.map4();
      case typemap.map8:    return this.map8();
      case typemap.map16:   return this.map16();
      case typemap.map32:   return this.map32();
      case typemap.array4:  return this.array4();
      case typemap.array8:  return this.array8();
      case typemap.array16: return this.array16();
      case typemap.array32: return this.array32();
      case typemap.nil:     return null;
      case typemap.false:   return false;
      case typemap.true:    return true;
      case typemap.positive_fixint_0: return 0;
      case typemap.positive_fixint_1: return 1;
      case typemap.positive_fixint_2: return 2;
      case typemap.positive_fixint_3: return 3;
      case typemap.positive_fixint_4: return 4;
      case typemap.positive_fixint_5: return 5;
      case typemap.positive_fixint_6: return 6;
      case typemap.positive_fixint_7: return 7;
      case typemap.positive_fixint_8: return 8;
      case typemap.positive_fixint_9: return 9;
      case typemap.positive_fixint_A: return 10;
      case typemap.positive_fixint_B: return 11;
      case typemap.positive_fixint_C: return 12;
      case typemap.positive_fixint_D: return 13;
      case typemap.positive_fixint_E: return 14;
      case typemap.positive_fixint_F: return 15;
      case typemap.fixstr_0: return this.fixstr();
      case typemap.fixstr_1: return this.fixstr();
      case typemap.fixstr_2: return this.fixstr();
      case typemap.fixstr_3: return this.fixstr();
      case typemap.fixstr_4: return this.fixstr();
      case typemap.fixstr_5: return this.fixstr();
      case typemap.fixstr_6: return this.fixstr();
      case typemap.fixstr_7: return this.fixstr();
      case typemap.fixstr_8: return this.fixstr();
      case typemap.fixstr_9: return this.fixstr();
      case typemap.fixstr_A: return this.fixstr();
      case typemap.fixstr_B: return this.fixstr();
      case typemap.fixstr_C: return this.fixstr();
      case typemap.fixstr_D: return this.fixstr();
      case typemap.fixstr_E: return this.fixstr();
      case typemap.fixstr_F: return this.fixstr();
      default:
        throw new Error("undefined type " + this.ch + ',ap:' + this.ap + ',at:' + this.at);
      }
    }
  };
  return AsciiPack;
})();
