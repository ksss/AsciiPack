# AsciiPack

## Synopsis

```javascript
var demo = {"compact":true,"binary":0};
var ap = AsciiPack.pack(demo);
console.log(ap); //=> "q2m7compactum6binaryf0"

var unpacked = AsciiPack.unpack(ap);
console.log(unpacked); //=> {"compact":true,"binary":0}
```

## Install

```
<script src="https://raw.github.com/ksss/AsciiPack/master/js/asciipack.js"></script>
```

```
npm install asciipack
```

see also [https://github.com/ksss/AsciiPack/blob/master/README.md](https://github.com/ksss/AsciiPack/blob/master/README.md)
