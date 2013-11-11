# AsciiPack

[![NPM version](https://badge.fury.io/js/asciipack.png)](http://badge.fury.io/js/asciipack)

AsciiPack is an object serialization inspired by MessagePack.

AsciiPack is use easy by Web. because all serialize object is only writed by ascii strings.

## Synopsis

```javascript
var demo = {"compact":true,"binary":0};
var ap = AsciiPack.pack(demo);
console.log(ap); //=> "r2NcompactYMbinary0"

var unpacked = AsciiPack.unpack(ap);
console.log(unpacked); //=> {"compact":true,"binary":0}
```

## Install

AsciiPack can use node and web.

```
npm install asciipack
```

```html
<script src="asciipack.js"></script>
```

demo site [http://ksss.github.io/AsciiPack/](http://ksss.github.io/AsciiPack/)

see also [https://github.com/ksss/AsciiPack/blob/master/README.md](https://github.com/ksss/AsciiPack/blob/master/README.md)
