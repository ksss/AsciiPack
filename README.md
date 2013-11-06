# AsciiPack

AsciiPack is an object serialization inspired by MessagePack.

AsciiPack is use easy by Web. because all serialize object is only writed by ascii strings.

    JSON is 27 chars:
    {"compact":true,"binary":0}

    AsciiPack is 19 chars:
    r2NcompactYMbinary0
        r2 => map of length 2.
        Ncompact => string of length 7 and value is "compact".
        Y => true.
        Mbinary => string of length 6 abd value is "binary".
        0 => fixint value is 0.

## Formats

### Overview

<table>
  <tr><th>format name</th><th>first char</th></tr>
  <tr><td>int 4</td><td>a</td></tr>
  <tr><td>int 8</td><td>b</td></tr>
  <tr><td>int 16</td><td>c</td></tr>
  <tr><td>int 32</td><td>d</td></tr>
  <tr><td>int 64</td><td>e</td></tr>
  <tr><td>(blank)</td><td>f</td></tr>
  <tr><td>uint 8</td><td>g</td></tr>
  <tr><td>uint 16</td><td>h</td></tr>
  <tr><td>uint 32</td><td>i</td></tr>
  <tr><td>uint 64</td><td>j</td></tr>
  <tr><td>float 32</td><td>k</td></tr>
  <tr><td>float 64</td><td>l</td></tr>
  <tr><td>(blank)</td><td>m</td></tr>
  <tr><td>str 8</td><td>n</td></tr>
  <tr><td>str 16</td><td>o</td></tr>
  <tr><td>str 32</td><td>p</td></tr>
  <tr><td>(blank)</td><td>q</td></tr>
  <tr><td>map 4</td><td>r</td></tr>
  <tr><td>map 8</td><td>s</td></tr>
  <tr><td>map 16</td><td>t</td></tr>
  <tr><td>map 32</td><td>u</td></tr>
  <tr><td>array 4</td><td>v</td></tr>
  <tr><td>array 8</td><td>w</td></tr>
  <tr><td>array 16</td><td>x</td></tr>
  <tr><td>array 32</td><td>y</td></tr>
  <tr><td>(blank)</td><td>z</td></tr>
  <tr><td>positive fixint</td><td>0-9A-F</td></tr>
  <tr><td>fixstr</td><td>G-V</td></tr>
  <tr><td>nil</td><td>W</td></tr>
  <tr><td>false</td><td>X</td></tr>
  <tr><td>true</td><td>Y</td></tr>
  <tr><td>(blank)</td><td>Z</td></tr>
</table>

### Notation in diagrams
    All object serialize format.
    key | [length] | [variable]

    `F` is Hexadecimal number by one char.
    `D` is Decimal number.

### int
    int 4:
    a | F

    int 8:
    b | FF

    int 16:
    c | FFFF

    int 32:
    d | FFFFFFFF

    int 64:
    e | FFFFFFFFFFFFFFFF

    positive fixint:
    0-9A-F

    uint 8:
    g | FF

    uint 16:
    h | FFFF

    uint 32:
    i | FFFFFFFF

    uint 64:
    j | FFFFFFFFFFFFFFFF

### float
Value abide IEEE 754 format.

    float 32:
    k | FFFFFFFF

    float 64:
    l | FFFFFFFFFFFFFFFF

### str
    fixstr:
    G-V | data

    str 8:
    n | FF | data

    str 16:
    o | FFFF | data

    str 32:
    p | FFFFFFFF | data

### map
    map 4:
    r | F | N * (key + value)

    map 8:
    s | FF | N * (key + value)

    map 16:
    t | FFFF | N * (key + value)

    map 32:
    u | FFFFFFFF | N * (key + value)

    * N is the size of map

### array
    array 4:
    v | F | N * value

    array 8:
    w | FF | N * value

    array 16:
    x | FFFF | N * value

    array 32:
    y | FFFFFFFF | N * value

    * N is the size of array

### nil
    nil:
    W

### boolean
    false:
    X

    true:
    Y

## Comparison

|Serializer|Length|Speed|Readability|Writability|
|---|---|---|---|---|
|JSON|×|△|○|○|
|MessagePack|○|○|×|×|
|AsciiPack|△|○|△|△|
