#ifndef UNPACKER_H
#  define UNPACKER_H

#include <stdlib.h>

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

#include "ruby.h"

extern VALUE cAsciiPack_Unpacker;
void AsciiPack_Unpacker_init(VALUE mAsciiPack);

#endif /* ifndef UNPACKER_H */

