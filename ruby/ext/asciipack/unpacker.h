#ifndef UNPACKER_H
#  define UNPACKER_H

#include <stdio.h>
#include <stdlib.h>
#include <math.h>

#if defined(_MSC_VER) && _MSC_VER < 1600
  typedef short int8_t;
  typedef unsigned short uint8_t;
  typedef int int16_t;
  typedef unsigned int uint16_t;
  typedef long int32_t;
  typedef unsigned long uint32_t;
  typedef long long int64_t;
  typedef unsigned long long uint64_t;
#else
  #include <stdint.h>
#endif

struct unpacker {
	char* buffer;
	char* ch;
};
typedef struct unpacker unpacker_t;

#define UNPACKER(from, name) \
	unpacker_t* name; \
	Data_Get_Struct(from, unpacker_t, name); \
	if (name == NULL) { \
		rb_raise(rb_eArgError, "NULL found for " # name " when shouldn't be.'"); \
	}

/* for convert unsigned long <-> float */
union udouble {
	unsigned long u;
	double f64;
};

#include "ruby.h"

#endif /* ifndef UNPACKER_H */

