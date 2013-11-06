/*
 * $Id$
 */
#ifndef PACKER_H
#  define PACKER_H

#include <stdlib.h>

/*
 * packer:
 * |      - memsize -      |
 * +-----------------------+
 * |     ||           |    |
 * +-----------------------+
 * ^mem  ^(tag)    ^mem_end
 *
 * main write strings memory.
 * realloc when will write over size string.
 * if will write too large stiring,
 * it is skip and continue write from mem_end.
 *
 *
 * tag:
 * +--------------------------+
 * | tag(too large string) |
 * +--------------------------+ ... 
 * ^begin                     ^end
 *
 * too large string tag to use Copy-on-Write.
 * tag->next look packer or an another tag.
 */

struct tag {
	char* begin;
	char* end;
	unsigned int is_reference:1;
	struct tag* next;
};
typedef struct tag tag_t;

struct packer {
	char* mem;
	char* mem_end;
	tag_t* tag;
	tag_t* start;
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

#define MEMSIZE_INIT (1024*128)

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

