/*
 * $Id$
 */
#ifndef UNPACKER_H
#  define UNPACKER_H

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#if defined(_MSC_VER) && _MSC_VER < 1600
  typedef __int8 int8_t;
  typedef unsigned __int8 uint8_t;
  typedef __int16 int16_t;
  typedef unsigned __int16 uint16_t;
  typedef __int32 int32_t;
  typedef unsigned __int32 uint32_t;
  typedef __int64 int64_t;
  typedef unsigned __int64 uint64_t;
#elif defined(_MSC_VER)  // && _MSC_VER >= 1600
  #include <stdint.h>
#else
  #include <stdint.h>
#endif

#include "ruby.h"

#endif /* ifndef UNPACKER_H */

