/*
 * $Id$
 */
#ifndef PACKER_H
#  define PACKER_H

#include <stdlib.h>

struct buffer {
	char* begin;
	char* end;
	struct buffer* next;
};
typedef struct buffer buffer_t;

struct packer {
	char* mem;
	char* seek;
	buffer_t buffer;
	buffer_t* start;
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

#define PACKER_BUFFER(p) (&(p)->buffer)

#include "ruby.h"

extern VALUE cAsciiPack_Packer;
void AsciiPack_Packer_init(VALUE mAsciiPack);

#endif /* ifndef PACKER_H */

