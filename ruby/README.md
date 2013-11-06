# AsciiPack

[![Gem Version](https://badge.fury.io/rb/asciipack.png)](http://badge.fury.io/rb/asciipack)

AsciiPack is an object serialization inspired by MessagePack.

AsciiPack is use easy by Web. because all serialize object is only writed by ascii strings.

## Synopsis

```ruby
demo = {"compact"=>true,"binary"=>0}
ap = AsciiPack.pack demo
p ap #=> "r2NcompactYMbinary0"

unpacked = AsciiPack.unpack ap
p unpacked #=> {"compact"=>true,"binary"=>0}
```

## Install

```
gem install asciipack
```

see also [https://github.com/ksss/AsciiPack/blob/master/README.md](https://github.com/ksss/AsciiPack/blob/master/README.md)

bench mark [https://gist.github.com/ksss/7336517](https://gist.github.com/ksss/7336517)
