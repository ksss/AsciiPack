#include <stdio.h>
#include "packer.h"

VALUE cAsciiPack_Packer;

static void Packer_write(packer_t* ptr, VALUE obj);

static void
packer_mark(packer_t* ptr)
{
}

static VALUE
Packer_alloc(VALUE klass)
{
	packer_t *ptr = ALLOC(packer_t);
	return Data_Wrap_Struct(klass, packer_mark, -1, ptr);
}

static VALUE
Packer_initialize(int argc, VALUE *argv, VALUE self)
{
	PACKER(self, ptr);

	if (!ptr) {
		rb_raise(rb_eArgError, "unallocated packer");
	}

	// TODO fix memory control
	ptr->buffer = (char*) malloc(sizeof(char) * 1024);
	memset(ptr->buffer, 0, sizeof(char) * 1024);
	ptr->ch = ptr->buffer;

	return self;
}

static void
Packer_write_buffer_1 (packer_t* ptr, char ch)
{
	*ptr->ch = ch;
	ptr->ch++;
}

static void
Packer_write_positive_num_1 (packer_t* ptr, unsigned int word)
{
	if (word < 10) {
		Packer_write_buffer_1(ptr, word + '0');
	} else {
		Packer_write_buffer_1(ptr, word + 'a' - 10);
	}
}

static void
Packer_write_ubignum(packer_t* ptr, VALUE ubignum)
{

	uint64_t n = rb_big2ull(ubignum);
	Packer_write_buffer_1(ptr, 'j');
	Packer_write_positive_num_1(ptr, (n & 0xf000000000000000LL) >> 60);
	Packer_write_positive_num_1(ptr, (n & 0x0f00000000000000LL) >> 56);
	Packer_write_positive_num_1(ptr, (n & 0x00f0000000000000LL) >> 52);
	Packer_write_positive_num_1(ptr, (n & 0x000f000000000000LL) >> 48);
	Packer_write_positive_num_1(ptr, (n & 0x0000f00000000000LL) >> 44);
	Packer_write_positive_num_1(ptr, (n & 0x00000f0000000000LL) >> 40);
	Packer_write_positive_num_1(ptr, (n & 0x000000f000000000LL) >> 36);
	Packer_write_positive_num_1(ptr, (n & 0x0000000f00000000LL) >> 32);
	Packer_write_positive_num_1(ptr, (n & 0x00000000f0000000LL) >> 28);
	Packer_write_positive_num_1(ptr, (n & 0x000000000f000000LL) >> 24);
	Packer_write_positive_num_1(ptr, (n & 0x0000000000f00000LL) >> 20);
	Packer_write_positive_num_1(ptr, (n & 0x00000000000f0000LL) >> 16);
	Packer_write_positive_num_1(ptr, (n & 0x000000000000f000LL) >> 12);
	Packer_write_positive_num_1(ptr, (n & 0x0000000000000f00LL) >> 8);
	Packer_write_positive_num_1(ptr, (n & 0x00000000000000f0LL) >> 4);
	Packer_write_positive_num_1(ptr, (n & 0x000000000000000fLL));
}

static void
Packer_write_positive_num (packer_t* ptr, uint64_t n, unsigned int bytesize)
{
	if (n == 0) {
		return Packer_write_buffer_1(ptr, '0');
	}

	switch (bytesize) {
	case 1:
		Packer_write_positive_num_1(ptr, n & 0x0f);
		break;

	case 2:
		Packer_write_positive_num_1(ptr, (n & 0xf0) >> 4);
		Packer_write_positive_num_1(ptr, n & 0x0f);
		break;

	case 4:
		Packer_write_positive_num_1(ptr, (n & 0xf000) >> 12);
		Packer_write_positive_num_1(ptr, (n & 0x0f00) >> 8);
		Packer_write_positive_num_1(ptr, (n & 0x00f0) >> 4);
		Packer_write_positive_num_1(ptr, n & 0x000f);
		break;

	case 8:
		Packer_write_positive_num_1(ptr, (n & 0xf0000000) >> 28);
		Packer_write_positive_num_1(ptr, (n & 0x0f000000) >> 24);
		Packer_write_positive_num_1(ptr, (n & 0x00f00000) >> 20);
		Packer_write_positive_num_1(ptr, (n & 0x000f0000) >> 16);
		Packer_write_positive_num_1(ptr, (n & 0x0000f000) >> 12);
		Packer_write_positive_num_1(ptr, (n & 0x00000f00) >> 8);
		Packer_write_positive_num_1(ptr, (n & 0x000000f0) >> 4);
		Packer_write_positive_num_1(ptr, (n & 0x0000000f));
		break;

	case 16:
		Packer_write_positive_num_1(ptr, (n & 0xf000000000000000LL) >> 60);
		Packer_write_positive_num_1(ptr, (n & 0x0f00000000000000LL) >> 56);
		Packer_write_positive_num_1(ptr, (n & 0x00f0000000000000LL) >> 52);
		Packer_write_positive_num_1(ptr, (n & 0x000f000000000000LL) >> 48);
		Packer_write_positive_num_1(ptr, (n & 0x0000f00000000000LL) >> 44);
		Packer_write_positive_num_1(ptr, (n & 0x00000f0000000000LL) >> 40);
		Packer_write_positive_num_1(ptr, (n & 0x000000f000000000LL) >> 36);
		Packer_write_positive_num_1(ptr, (n & 0x0000000f00000000LL) >> 32);
		Packer_write_positive_num_1(ptr, (n & 0x00000000f0000000LL) >> 28);
		Packer_write_positive_num_1(ptr, (n & 0x000000000f000000LL) >> 24);
		Packer_write_positive_num_1(ptr, (n & 0x0000000000f00000LL) >> 20);
		Packer_write_positive_num_1(ptr, (n & 0x00000000000f0000LL) >> 16);
		Packer_write_positive_num_1(ptr, (n & 0x000000000000f000LL) >> 12);
		Packer_write_positive_num_1(ptr, (n & 0x0000000000000f00LL) >> 8);
		Packer_write_positive_num_1(ptr, (n & 0x00000000000000f0LL) >> 4);
		Packer_write_positive_num_1(ptr, (n & 0x000000000000000fLL));
		break;
	}
}

static void
Packer_write_bignum(packer_t* ptr, VALUE bignum)
{
	int64_t v = rb_big2ll(bignum);
	union unegative_int cb;

	Packer_write_buffer_1(ptr, 'e');
	cb.i64 = v;
	Packer_write_positive_num(ptr, cb.ul, 16);
}

static void
Packer_bignum (packer_t* ptr, VALUE bignum)
{
	if (RBIGNUM_POSITIVE_P(bignum)) {
		Packer_write_ubignum(ptr, bignum);
	} else {
		Packer_write_bignum(ptr, bignum);
	}
}

static void
Packer_fixnum (packer_t* ptr, VALUE fixnum)
{
	int64_t v = FIX2LONG(fixnum);
	union unegative_int cb;

	if (v < 0) {
		if (-0x8 <= v) {
			Packer_write_buffer_1(ptr, 'a');
			cb.i4 = v;
			Packer_write_positive_num(ptr, cb.ul, 1);
		} else if (-0x80 <= v) {
			Packer_write_buffer_1(ptr, 'b');
			cb.i8 = v;
			Packer_write_positive_num(ptr, cb.ul, 2);
		} else if (-0x8000L <= v) {
			Packer_write_buffer_1(ptr, 'c');
			cb.i16 = v;
			Packer_write_positive_num(ptr, cb.ul, 4);
		} else if (-0x80000000LL <= v) {
			Packer_write_buffer_1(ptr, 'd');
			cb.i32 = v;
			Packer_write_positive_num(ptr, cb.ul, 8);
		} else {
			Packer_write_buffer_1(ptr, 'e');
			cb.i64 = v;
			Packer_write_positive_num(ptr, cb.ul, 16);
		}

	} else {
		if (v < 0x10) {
			if (v < 0x0a) {
				Packer_write_buffer_1(ptr, v + '0');
			} else {
				Packer_write_buffer_1(ptr, v + 'A' - 10);
			}
			return;

		} else if (v < 0x100) {
			Packer_write_buffer_1(ptr, 'g');
			Packer_write_positive_num(ptr, v, 2);

		} else if (v < 0x10000LL) {
			Packer_write_buffer_1(ptr, 'h');
			Packer_write_positive_num(ptr, v, 4);

		} else if (v < 0x100000000LL) {
			Packer_write_buffer_1(ptr, 'i');
			Packer_write_positive_num(ptr, v, 8);
		} else {
			Packer_write_buffer_1(ptr, 'j');
			Packer_write_positive_num(ptr, v, 16);
		}
	}
}

static void
Packer_array (packer_t* ptr, VALUE array)
{
	uint32_t len = RARRAY_LEN(array);
	uint32_t i = 0;

	if (len < 0x10) {
		Packer_write_buffer_1(ptr, 'v');
		Packer_write_positive_num(ptr, len, 1);
	} else if (len < 0x100) {
		Packer_write_buffer_1(ptr, 'w');
		Packer_write_positive_num(ptr, len, 2);
	} else if (len < 0x10000) {
		Packer_write_buffer_1(ptr, 'x');
		Packer_write_positive_num(ptr, len, 4);
	} else {
		Packer_write_buffer_1(ptr, 'y');
		Packer_write_positive_num(ptr, len, 8);
	}

	for (i = 0; i < len; i++) {
		VALUE e = rb_ary_entry(array, i);
		Packer_write(ptr, e);
	}
}

static VALUE
Packer_pack (VALUE self, VALUE obj)
{
	PACKER(self, ptr);

	Packer_write(ptr, obj);
	VALUE str = rb_str_new2(ptr->buffer);
	free(ptr->buffer);
	return str;
}

static void
Packer_write (packer_t* ptr, VALUE obj)
{
	switch (rb_type(obj)) {
	case T_NIL:
		Packer_write_buffer_1(ptr, 'W');
		break;
	case T_FALSE:
		Packer_write_buffer_1(ptr, 'X');
		break;
	case T_TRUE:
		Packer_write_buffer_1(ptr, 'Y');
		break;
	case T_ARRAY:
		Packer_array(ptr, obj);
		break;
	case T_FIXNUM:
		Packer_fixnum(ptr, obj);
		break;
	case T_BIGNUM:
		Packer_bignum(ptr, obj);
		break;
	}
}

static VALUE
AsciiPack_pack (int argc, VALUE *argv, VALUE self)
{
	VALUE packer = rb_funcall(cAsciiPack_Packer, rb_intern("new"), 0);
	return rb_funcall(packer, rb_intern("pack"), 1, argv[0]);
}

void
AsciiPack_Packer_init(VALUE mAsciiPack)
{
//	cAsciiPack_Packer = rb_define_class_under(mAsciiPack, "Packer", rb_cObject);
//	rb_define_alloc_func(cAsciiPack_Packer, Packer_alloc);
//
//	rb_define_method(cAsciiPack_Packer, "initialize", Packer_initialize, -1);
//	rb_define_method(cAsciiPack_Packer, "pack", Packer_pack, 1);
//
//	rb_define_module_function(mAsciiPack, "pack", AsciiPack_pack, -1);
}
