/*
 * $Id$
 */
#ifndef PACKER_H
#  define PACKER_H

#include <stdlib.h>

struct packer {
	char* buffer;
	char* ch;
	size_t memsize;
};
typedef struct packer packer_t;

union unegative_int {
	unsigned long ul;
	char i4;
	int8_t i8;
	int16_t i16;
	int32_t i32;
	int64_t i64;
};

#define MEMSIZE_INIT 128

#define PACKER(from, name) \
	packer_t* name; \
	Data_Get_Struct(from, packer_t, name); \
	if (name == NULL) { \
		rb_raise(rb_eArgError, "NULL found for " # name " when shouldn't be.'"); \
	}

#include "ruby.h"

extern VALUE cAsciiPack_Packer;
void AsciiPack_Packer_init(VALUE mAsciiPack);

#endif /* ifndef PACKER_H */

