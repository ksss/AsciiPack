# AsciiPack

AsciiPack is an object serialization inspired by MessagePack.

AsciiPack is use easy by Web. because all serialize object is only writed ascii strings.

    JSON is 27 chars:
    {"compact":true,"binary":0}

    AsciiPack is 22 chars:
    q2m7compactum6binaryf0
        q2 => map of length 2.
        m7compact => str of length 7 and value is "compact". and map key.
        u => true. and map value.
        m6binary => str of length 6 abd value is "binary". and map key.
        f0 => int value is 0.

## Formats

### Overview

<table>
  <tr><th>format name</th><th>first char</th><th>base decimal</th></tr>
  <tr><td>int 4</td><td>a</td><td>16</td></tr>
  <tr><td>int 8</td><td>b</td><td>16</td></tr>
  <tr><td>int 16</td><td>c</td><td>16</td></tr>
  <tr><td>int 32</td><td>d</td><td>16</td></tr>
  <tr><td>int 64</td><td>e</td><td>16</td></tr>
  <tr><td>uint 4</td><td>f</td><td>16</td></tr>
  <tr><td>uint 8</td><td>g</td><td>16</td></tr>
  <tr><td>uint 16</td><td>h</td><td>16</td></tr>
  <tr><td>uint 32</td><td>i</td><td>16</td></tr>
  <tr><td>uint 64</td><td>j</td><td>16</td></tr>
  <tr><td>float 32</td><td>k</td><td>16</td></tr>
  <tr><td>float 64</td><td>l</td><td>16</td></tr>
  <tr><td>str 4</td><td>m</td><td>16</td></tr>
  <tr><td>str 8</td><td>n</td><td>16</td></tr>
  <tr><td>str 16</td><td>o</td><td>16</td></tr>
  <tr><td>str 32</td><td>p</td><td>16</td></tr>
  <tr><td>map</td><td>q</td><td>10</td></tr>
  <tr><td>array</td><td>r</td><td>10</td></tr>
  <tr><td>nil</td><td>s</td><td></td></tr>
  <tr><td>false</td><td>t</td><td></td></tr>
  <tr><td>true</td><td>u</td><td></td></tr>
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

    uint 4:
    f | F

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
    str4:
    m | F | data

    str8:
    n | FF | data

    str16:
    o | FFFF | data

    str32:
    p | FFFFFFFF | data

### map
    map:
    q | D | D * (key + value)

### array
    array:
    r | D | D * (value)

### nil
    nil:
    n

### boolean
    false:
    t

    true:
    u

## Comparison

<table>
  <tr><th>Serializer</th><th>Length</th><th>Speed</th><th>Readability</th></tr>
  <tr><td>JSON</td><td>×</td><td>△</td><td>○</td></tr>
  <tr><td>MessagePack</td><td>○</td><td>○</td><td>×</td></tr>
  <tr><td>AsciiPack</td><td>△</td><td>×</td><td>△</td></tr>
</table>
