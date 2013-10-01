# AsciiPack

## Synopsis

```ruby
demo = {"compact"=>true,"binary"=>0}
ap = AsciiPack.pack demo
p ap //=> "q2m7compactum6binaryf0"

unpacked = AsciiPack.unpack ap
p unpacked //=> {"compact"=>true,"binary"=>0}
```

## Install

```
gem install asciipack
```

see also [https://github.com/ksss/AsciiPack/blob/master/README.md](https://github.com/ksss/AsciiPack/blob/master/README.md)
