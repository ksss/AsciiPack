this.AsciiPack = this.AsciiPack || (function(){
  var AsciiPack = function(){};
  var typemap = {
    int4:    'a',
    int8:    'b',
    int16:   'c',
    int32:   'd',
    int64:   'e',
    uint4:   'f',
    uint8:   'g',
    uint16:  'h',
    uint32:  'i',
    uint64:  'j',
    float32: 'k',
    float64: 'l',
    str4:    'm',
    str8:    'n',
    str16:   'o',
    str32:   'p',
    map:     'q',
    array:   'r',
    nil:     's',
    false:   't',
    true:    'u',
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
    var format_str = function(type, length, str){
      var hex = str.length.toString(16);
      var len = length - hex.length;
      var zero = '';
      while (len--) zero += '0';
      return type + zero + hex + str;
    };
    var uint4 = function(obj){
      return format_uint(typemap.uint4, 1, obj);
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
      for (var key in obj) if (obj.hasOwnProperty(key)) {
        keys.push(_pack(key) + _pack(obj[key]));
      }
      return typemap.map + keys.length + keys.join('');
    };
    var array = function(obj){
      var keys = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        keys.push(_pack(obj[i]));
      }
      return typemap.array + keys.length + keys.join('');
    };
    var str4 = function(str){
      return typemap.str4 + str.length.toString(16) + str;
    };
    var str8 = function(str){
      return typemap.str8 + str.length.toString(16) + str;
    };
    var str16 = function(str){
      return format_str(typemap.str16, 4, str);
    };
    var str32 = function(str){
      return format_str(typemap.str32, 8, str);
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
              return uint4(obj);
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
          return str4(obj);
        } else if (obj.length < 0x100) {
          return str8(obj);
        } else if (obj.length < 0x10000) {
          return str16(obj);
        } else if (obj.length < 0x100000000) {
          return str32(obj);
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
    var length = function(){
      var ret = [];
      while (/\d/.test(ch)) {
        ret.push(ch);
        next();
      }
      back();
      return +ret.join('');
    };
    var uint4 = function(){
      return parseInt(next(), 16);
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
    var map = function(){
      next();
      var hash = {};
      var len = length();
      while (len--) {
        var key = _unpack();
        hash[key] = _unpack();
      }
      return hash;
    };
    var array = function(){
      next();
      var array = [];
      var len = length();
      while (len--) {
        array.push(_unpack());
      }
      return array;
    };
    var str4 = function () {
      var len = parseInt(cut(1), 16);
      return cut(len);
    };
    var str8 = function () {
      var len = parseInt(cut(2), 16);
      return cut(len);
    };
    var str16 = function () {
      var len = parseInt(cut(4), 16);
      return cut(len);
    };
    var str32 = function () {
      var len = parseInt(cut(8), 16);
      return cut(len);
    };

    var _unpack = function(){
      next();
      switch (ch) {
      case typemap.int4:    return int4();
      case typemap.int8:    return int8();
      case typemap.int16:   return int16();
      case typemap.int32:   return int32();
      case typemap.int64:   return int64();
      case typemap.uint4:   return uint4();
      case typemap.uint8:   return uint8();
      case typemap.uint16:  return uint16();
      case typemap.uint32:  return uint32();
      case typemap.uint64:  return uint64();
      case typemap.float64: return float64();
      case typemap.map:     return map();
      case typemap.array:   return array();
      case typemap.str4:    return str4();
      case typemap.str8:    return str8();
      case typemap.str16:   return str16();
      case typemap.str32:   return str32();
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
