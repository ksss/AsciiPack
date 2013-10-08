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
    bin8:              'n',
    bin16:             'o',
    bin32:             'p',
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
    fixbin_0:          'G',
    fixbin_1:          'H',
    fixbin_2:          'I',
    fixbin_3:          'J',
    fixbin_4:          'K',
    fixbin_5:          'L',
    fixbin_6:          'M',
    fixbin_7:          'N',
    fixbin_8:          'O',
    fixbin_9:          'P',
    fixbin_A:          'Q',
    fixbin_B:          'R',
    fixbin_C:          'S',
    fixbin_D:          'T',
    fixbin_E:          'U',
    fixbin_F:          'V',
    nil:               'W',
    false:             'X',
    true:              'Y',
//  (blank):           'Z',
  };
  AsciiPack.typemap = typemap;
  AsciiPack.pack = function(object){
    var toString16 = function(a){
      return a.map(function(i){
        var hex = i.toString(16);
        var len = hex.length;
        var i = 2 - len;
        while (i--) {
          hex = '0' + hex;
        }
        return hex;
      }).join('');
    };
    var format_uint = function(type, length, num){
      var hex = num.toString(16);
      var len = length - hex.length;
      var zero = '';
      while(len--) zero += '0';
      return type + zero + hex;
    };
    var format_bin = function(type, length, bin){
      var hex = bin.length.toString(16);
      var len = length - hex.length;
      var zero = '';
      while (len--) zero += '0';
      return type + zero + hex + bin;
    };
    var positive_fixint = function(obj){
      var t = obj.toString(16).toUpperCase();
      return typemap['positive_fixint_' + t];
    };
    var uint8 = function(obj){
      return format_uint(typemap.uint8, 2, obj);
    };
    var uint16 = function(obj){
      return format_uint(typemap.uint16, 4, obj);
    };
    var uint32 = function(obj){
      return format_uint(typemap.uint32, 8, obj);
    };
    var uint64 = function(obj){
      return format_uint(typemap.uint64, 16, obj);
    };
    var int4 = function(obj){
      return typemap.int4 + ((obj & 0xf).toString(16));
    };
    var int8 = function(obj){
      return typemap.int8 + ((obj & 0xff).toString(16));
    };
    var int16 = function(obj){
      return typemap.int16 + toString16([
        (obj >> 8) & 0xff, (obj) & 0xff
      ]);
    };
    var int32 = function(obj){
      return typemap.int32 + toString16([
        (obj >> 24) & 0xff, (obj >> 16) & 0xff,
        (obj >> 8)  & 0xff, (obj)       & 0xff
      ]);
    };
    var int64 = function(obj){
      var high = Math.floor(obj * Math.pow(2, -256));
      var low = obj & 0xffffffff;
      return typemap.int64 + toString16([
        (high >> 24) & 0xff, (high >> 16) & 0xff,
        (high >> 8)  & 0xff, (high)       & 0xff,
        (low >> 24)  & 0xff, (low >> 16)  & 0xff,
        (low >> 8)   & 0xff, (low)        & 0xff
      ]);
    };
    var float64 = function(obj){
      var sign = obj < 0;
      if (sign) obj *= -1;
      var exp = ((Math.log(obj) / Math.LN2) + 1023) | 0;
      var frac = obj * Math.pow(2, 52 + 1023 - exp);
      var low = frac & 0xffffffff;
      if (sign) exp |= 0x800;
      var high = ((frac / 0x100000000) & 0xfffff) | (exp << 20);

      return typemap.float64 + toString16([
        (high >> 24) & 0xff, (high >> 16) & 0xff,
        (high >>  8) & 0xff, (high)       & 0xff,
        (low  >> 24) & 0xff, (low  >> 16) & 0xff,
        (low  >>  8) & 0xff, (low)        & 0xff
      ]);
    };
    var map = function(obj){
      var keys = [];
      var f;
      for (var key in obj) if (obj.hasOwnProperty(key)) {
        keys.push(_pack(key) + _pack(obj[key]));
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
      return format_uint(f[0], f[1], keys.length) + keys.join('');
    };
    var array = function(obj){
      var keys = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        keys.push(_pack(obj[i]));
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
      return format_uint(f[0], f[1], keys.length) + keys.join('');
    };
    var bin4 = function(bin){
      var l = bin.length.toString(16);
      return typemap['fixbin_' + l.toUpperCase()] + bin;
    };
    var bin8 = function(bin){
      return typemap.bin8 + bin.length.toString(16) + bin;
    };
    var bin16 = function(bin){
      return format_bin(typemap.bin16, 4, bin);
    };
    var bin32 = function(bin){
      return format_bin(typemap.bin32, 8, bin);
    };
    var _pack = function(obj){
      switch ({}.toString.call(obj)) {

      case '[object Object]':
        return map(obj);

      case '[object Array]':
        return array(obj);

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
              return positive_fixint(obj);
            } else if (obj < 0x100) {
              return uint8(obj);
            } else if (obj < 0x10000) {
              return uint16(obj);
            } else if (obj < 0x100000000) {
              return uint32(obj);
            } else if (obj < 0x10000000000000000) {
              return uint64(obj);
            } else {
              throw new RangeError("pack size limit over");
            }
          } else {
            if (-0x8 <= obj) {
              return int4(obj);
            } else if (-0x80 <= obj) {
              return int8(obj);
            } else if (-0x8000 <= obj) {
              return int16(obj);
            } else if (-0x80000000 <= obj) {
              return int32(obj);
            } else if (-0x8000000000000000 <= obj){
              return int64(obj);
            } else {
              throw new RangeError("pack size limit over");
            }
          }
        } else {
          return float64(obj);
        }

      case '[object String]':
        if (obj.length < 0x10) {
          return bin4(obj);
        } else if (obj.length < 0x100) {
          return bin8(obj);
        } else if (obj.length < 0x10000) {
          return bin16(obj);
        } else if (obj.length < 0x100000000) {
          return bin32(obj);
        } else {
          throw new RangeError("pack size limit over");
        }
      };
    };
    return _pack(object);
  };
  AsciiPack.unpack = function(ap){
    var ret;
    var at = 0;
    var ch = ap[at];
    var next = function(){
      ch = ap[at];
      at += 1;
      return ch;
    };
    var back = function(){
      ch = ap[at];
      at -= 1;
      return ch;
    };
    var cut = function(len){
      var ret = ap.substr(at, len);
      at += len;
      ch = ap[at - 1];
      return ret;
    };
    var positive_fixint = function(){
      return parseInt(ch, 16);
    };
    var uint8 = function(){
      return parseInt(cut(2), 16);
    };
    var uint16 = function(){
      return parseInt(cut(4), 16);
    };
    var uint32 = function(){
      return parseInt(cut(8), 16);
    };
    var uint64 = function(){
      return parseInt(cut(16), 16);
    };
    var int4 = function(){
      next();
      var i = parseInt(ch, 16);
      return (ch[0] < 0x8) ? i : i - 0x10;
    };
    var int8 = function(){
      var c = cut(2);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x100;
    };
    var int16 = function(){
      var c = cut(4);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x10000;
    };
    var int32 = function(){
      var c = cut(8);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x100000000;
    };
    var int64 = function(){
      var c = cut(16);
      var i = parseInt(c, 16);
      return (c[0] < 0x8) ? i : i - 0x10000000000000000;
    };
    var float64 = function(){
      var hex = cut(3);
      var num = parseInt(hex, 16);
      var sign = num & 0x800;
      var exp = (num & 0x7ff) - 1023;
      var frac = parseInt(cut(13), 16) * Math.pow(2, -52);
      if (hex === '7ff' && frac !== 0) {
        return Number.NaN;
      } else if (hex === '7ff' && frac === 0) {
        return Number.POSITIVE_INFINITY;
      } else if (hex === 'fff' && frac === 0) {
        return Number.NEGATIVE_INFINITY;
      } else {
        return (sign ? -1 : 1) * (Math.pow(2, exp)) * (frac + 1);
      }
    };
    var create_func_map = function(length){
      return function(){
        var len = parseInt(cut(length), 16);
        var map = {};
        while (len--) {
          var key = _unpack();
          map[key] = _unpack();
        }
        return map;
      };
    };
    var create_func_array = function(length){
      return function(){
        var len = parseInt(cut(length), 16);
        var array = [];
        while (len--) {
          array.push(_unpack());
        }
        return array;
      };
    };
    var map4  = create_func_map(1);
    var map8  = create_func_map(2);
    var map16 = create_func_map(4);
    var map32 = create_func_map(8);
    var array4  = create_func_array(1);
    var array8  = create_func_array(2);
    var array16 = create_func_array(4);
    var array32 = create_func_array(8);
    var fixbin = function () {
      var len = parseInt(ch.charCodeAt(0) - 71, 16); // 71 = typemap.fixbin_0.charCodeAt(0)
      return cut(len);
    };
    var bin8 = function () {
      var len = parseInt(cut(2), 16);
      return cut(len);
    };
    var bin16 = function () {
      var len = parseInt(cut(4), 16);
      return cut(len);
    };
    var bin32 = function () {
      var len = parseInt(cut(8), 16);
      return cut(len);
    };

    var _unpack = function(){
      next();
      if (/[0-9A-F]/.test(ch)) {
        return positive_fixint();
      } else if (/[G-V]/.test(ch)) {
        return fixbin();
      }
      switch (ch) {
      case typemap.int4:    return int4();
      case typemap.int8:    return int8();
      case typemap.int16:   return int16();
      case typemap.int32:   return int32();
      case typemap.int64:   return int64();
      case typemap.uint8:   return uint8();
      case typemap.uint16:  return uint16();
      case typemap.uint32:  return uint32();
      case typemap.uint64:  return uint64();
      case typemap.float64: return float64();
      case typemap.bin8:    return bin8();
      case typemap.bin16:   return bin16();
      case typemap.bin32:   return bin32();
      case typemap.map4:    return map4();
      case typemap.map8:    return map8();
      case typemap.map16:   return map16();
      case typemap.map32:   return map32();
      case typemap.array4:  return array4();
      case typemap.array8:  return array8();
      case typemap.array16: return array16();
      case typemap.array32: return array32();
      case typemap.nil:     return null;
      case typemap.false:   return false;
      case typemap.true:    return true;
      default:              throw new Error("undefined type " + ch + ',ap:' + ap + ',at:' + at);
      }
    };
    return _unpack();
  };
  return AsciiPack;
})();
