#include "packer.h"

VALUE cAsciiPack_Packer;

static void Packer_write_value(packer_t* ptr, VALUE obj);

static void
Packer_mark (packer_t* ptr)
{
}

static void
Packer_free (packer_t* ptr)
{
	buffer_t* b = ptr->start;
	buffer_t* next;

	while (b != NULL) {
		next = b->next;
		free(b);
		b = next;
	}
	free(ptr->mem);
}

static VALUE
Packer_alloc (VALUE klass)
{
	packer_t *ptr = ALLOC(packer_t);
	return Data_Wrap_Struct(klass, Packer_mark, Packer_free, ptr);
}

static void
Packer_init (packer_t* ptr)
{
	buffer_t* buffer = (buffer_t*) malloc(sizeof(buffer_t));
	char* mem = (char*) malloc(sizeof(char) * MEMSIZE_INIT);

	ptr->mem = mem;
	ptr->mem_end = mem;
	ptr->memsize = MEMSIZE_INIT;
	ptr->start = buffer;
	ptr->buffer = ptr->start;
	ptr->buffer->begin = mem;
	ptr->buffer->end = mem;
	ptr->buffer->is_reference = 0;
	ptr->buffer->next = NULL;
}

static VALUE
Packer_initialize (int argc, VALUE *argv, VALUE self)
{
	PACKER(self, ptr);

	if (!ptr) {
		rb_raise(rb_eArgError, "unallocated packer");
	}

	Packer_init(ptr);
	return self;
}

static size_t
Packer_buffer_writed_size (packer_t* ptr)
{
	return ptr->buffer->end - ptr->mem;
}

static size_t
Packer_buffer_rest_size (packer_t* ptr)
{
	return ptr->memsize - Packer_buffer_writed_size(ptr);
}

static char*
Packer_realloc (packer_t* ptr, size_t require)
{
	size_t newsize = ptr->memsize;
	size_t len = Packer_buffer_writed_size(ptr);
	size_t require_size = require + len;
	char* mem;
	buffer_t* b = ptr->start;

	while (newsize < require_size) {
		newsize *= 2;
	}

	mem = (char*) realloc(ptr->mem, sizeof(char) * newsize);
	ptr->mem = mem;
	ptr->memsize = newsize;
	if (mem == NULL) {
		return NULL;
	}

	while (1) {
		if (!b->is_reference) {
			len = b->end - b->begin;
			b->begin = mem;
			b->end = mem + len;
			ptr->mem_end = b->end;
			mem += len;
		}
		if (b->next == NULL) {
			return ptr->mem;
		}
		b = b->next;
	}
}

static void
Packer_check (packer_t* ptr, size_t require)
{
	if (ptr->buffer->is_reference) {
		buffer_t* buffer_mem = (buffer_t*) malloc(sizeof(buffer_t));

		ptr->buffer->next = buffer_mem;

		buffer_mem->begin = ptr->mem_end;
		buffer_mem->end = ptr->mem_end;
		buffer_mem->next = NULL;
		buffer_mem->is_reference = 0;
		ptr->buffer = buffer_mem;
	}
	if (Packer_buffer_rest_size(ptr) < require) {
		if (Packer_realloc(ptr, require) == NULL) {
			rb_raise(rb_eNoMemError, "Packer can not realloc.");
		}
	}
}

static void
Packer_write_buffer_1 (packer_t* ptr, char ch)
{
	*ptr->buffer->end++ = ch;
}

static void
Packer_write_buffer_cpy (packer_t* ptr, VALUE string)
{
	const char* p = RSTRING_PTR(string);
	uint32_t len = RSTRING_LEN(string);

	memcpy(ptr->buffer->end, p, len);
	ptr->buffer->end += len;
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
Packer_write_uint8 (packer_t* ptr, uint8_t n)
{
	Packer_write_positive_num_1(ptr, (n & 0xf0) >> 4);
	Packer_write_positive_num_1(ptr, n & 0x0f);
}

static void
Packer_write_uint16 (packer_t* ptr, uint16_t n)
{
	Packer_write_positive_num_1(ptr, (n & 0xf000) >> 12);
	Packer_write_positive_num_1(ptr, (n & 0x0f00) >> 8);
	Packer_write_positive_num_1(ptr, (n & 0x00f0) >> 4);
	Packer_write_positive_num_1(ptr, n & 0x000f);
}

static void
Packer_write_uint32 (packer_t* ptr, uint32_t n)
{
	Packer_write_positive_num_1(ptr, (n & 0xf0000000LL) >> 28);
	Packer_write_positive_num_1(ptr, (n & 0x0f000000LL) >> 24);
	Packer_write_positive_num_1(ptr, (n & 0x00f00000LL) >> 20);
	Packer_write_positive_num_1(ptr, (n & 0x000f0000LL) >> 16);
	Packer_write_positive_num_1(ptr, (n & 0x0000f000LL) >> 12);
	Packer_write_positive_num_1(ptr, (n & 0x00000f00LL) >> 8);
	Packer_write_positive_num_1(ptr, (n & 0x000000f0LL) >> 4);
	Packer_write_positive_num_1(ptr, (n & 0x0000000fLL));
}

static void
Packer_write_uint64 (packer_t* ptr, uint64_t n)
{
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
Packer_write_ubignum(packer_t* ptr, VALUE ubignum)
{
	uint64_t n = rb_big2ull(ubignum);

	Packer_write_buffer_1(ptr, 'j');
	Packer_write_uint64(ptr, n);
}

static void
Packer_write_bignum(packer_t* ptr, VALUE bignum)
{
	int64_t v = rb_big2ll(bignum);
	union unegative_int cb;

	Packer_write_buffer_1(ptr, 'e');
	cb.i64 = v;
	Packer_write_uint64(ptr, cb.ul);
}

static void
Packer_bignum (packer_t* ptr, VALUE bignum)
{
	Packer_check(ptr, 17);
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
			Packer_check(ptr, 2);
			Packer_write_buffer_1(ptr, 'a');
			cb.i4 = v;
			Packer_write_positive_num_1(ptr, cb.ul & 0x0f);
		} else if (-0x80 <= v) {
			Packer_check(ptr, 3);
			Packer_write_buffer_1(ptr, 'b');
			cb.i8 = v;
			Packer_write_uint8(ptr, cb.ul);
		} else if (-0x8000L <= v) {
			Packer_check(ptr, 5);
			Packer_write_buffer_1(ptr, 'c');
			cb.i16 = v;
			Packer_write_uint16(ptr, cb.ul);
		} else if (-0x80000000LL <= v) {
			Packer_check(ptr, 9);
			Packer_write_buffer_1(ptr, 'd');
			cb.i32 = v;
			Packer_write_uint32(ptr, cb.ul);
		} else {
			Packer_check(ptr, 17);
			Packer_write_buffer_1(ptr, 'e');
			cb.i64 = v;
			Packer_write_uint64(ptr, cb.ul);
		}

	} else {
		if (v < 0x10) {
			Packer_check(ptr, 1);
			if (v < 0x0a) {
				Packer_write_buffer_1(ptr, v + '0');
			} else {
				Packer_write_buffer_1(ptr, v + 'A' - 10);
			}
			return;

		} else if (v < 0x100) {
			Packer_check(ptr, 3);
			Packer_write_buffer_1(ptr, 'g');
			Packer_write_uint8(ptr, v);

		} else if (v < 0x10000LL) {
			Packer_check(ptr, 5);
			Packer_write_buffer_1(ptr, 'h');
			Packer_write_uint16(ptr, v);

		} else if (v < 0x100000000LL) {
			Packer_check(ptr, 9);
			Packer_write_buffer_1(ptr, 'i');
			Packer_write_uint32(ptr, v);

		} else {
			Packer_check(ptr, 17);
			Packer_write_buffer_1(ptr, 'j');
			Packer_write_uint64(ptr, v);
		}
	}
}

static void
Packer_float (packer_t* ptr, VALUE floatnum)
{
	double float64 = rb_num2dbl(floatnum);
	union {
		double d;
		uint64_t u64;
	} converter = {float64};

	Packer_check(ptr, 17);
	Packer_write_buffer_1(ptr, 'l');
	Packer_write_uint64(ptr, converter.u64);
}

static void
Packer_write_string_header (packer_t* ptr, uint32_t len)
{
	if (len < 0x10) {
		Packer_check(ptr, 1);
		Packer_write_buffer_1(ptr, 'G' + len);
	} else if (len < 0x100) {
		Packer_check(ptr, 3);
		Packer_write_buffer_1(ptr, 'n');
		Packer_write_uint8(ptr, len);
	} else if (len < 0x10000) {
		Packer_check(ptr, 5);
		Packer_write_buffer_1(ptr, 'o');
		Packer_write_uint16(ptr, len);
	} else {
		Packer_check(ptr, 9);
		Packer_write_buffer_1(ptr, 'p');
		Packer_write_uint32(ptr, len);
	}
}

static void
Packer_write_string_reference (packer_t* ptr, VALUE string)
{
	VALUE dup = rb_str_dup(string);
	char* p = RSTRING_PTR(dup);
	uint32_t len = RSTRING_LEN(dup);
	buffer_t* buffer_reference = (buffer_t*) malloc(sizeof(buffer_t));

	if (!ptr->buffer->is_reference) {
		ptr->mem_end = ptr->buffer->end;
	}

	buffer_reference->begin = p;
	buffer_reference->end = p + len;
	buffer_reference->next = NULL;
	buffer_reference->is_reference = 1;
	ptr->buffer->next = buffer_reference;
	ptr->buffer = buffer_reference;
}

static void
Packer_str (packer_t* ptr, VALUE string)
{
	uint32_t len = RSTRING_LEN(string);

	Packer_write_string_header(ptr, len);

	if (len < 131072L) {
		Packer_check(ptr, len);
		Packer_write_buffer_cpy(ptr, string);
	} else {
		Packer_write_string_reference(ptr, string);
	}
}

static void
Packer_symbol (packer_t* ptr, VALUE symbol)
{
	const char* p = rb_id2name(SYM2ID(symbol));
	uint32_t len = strlen(p);

	Packer_write_string_header(ptr, len);

	Packer_check(ptr, len);
	while (len--) {
		Packer_write_buffer_1(ptr, *p++);
	}
}

static void
Packer_array (packer_t* ptr, VALUE array)
{
	uint32_t len = RARRAY_LEN(array);
	uint32_t i = 0;

	if (len < 0x10) {
		Packer_check(ptr, 2);
		Packer_write_buffer_1(ptr, 'v');
		Packer_write_positive_num_1(ptr, len);
	} else if (len < 0x100) {
		Packer_check(ptr, 3);
		Packer_write_buffer_1(ptr, 'w');
		Packer_write_uint8(ptr, len);
	} else if (len < 0x10000) {
		Packer_check(ptr, 5);
		Packer_write_buffer_1(ptr, 'x');
		Packer_write_uint16(ptr, len);
	} else {
		Packer_check(ptr, 9);
		Packer_write_buffer_1(ptr, 'y');
		Packer_write_uint32(ptr, len);
	}

	for (i = 0; i < len; i++) {
		VALUE e = rb_ary_entry(array, i);
		Packer_write_value(ptr, e);
	}
}

static int
Packer_write_hash_each (VALUE key, VALUE value, VALUE obj)
{
	packer_t* ptr = (packer_t*) obj;
	Packer_write_value(ptr, key);
	Packer_write_value(ptr, value);
	return ST_CONTINUE;
}

static void
Packer_map (packer_t* ptr, VALUE hash)
{
	uint32_t len = RHASH_SIZE(hash);

	if (len < 0x10) {
		Packer_check(ptr, 2);
		Packer_write_buffer_1(ptr, 'r');
		Packer_write_positive_num_1(ptr, len);
	} else if (len < 0x100) {
		Packer_check(ptr, 3);
		Packer_write_buffer_1(ptr, 's');
		Packer_write_uint8(ptr, len);
	} else if (len < 0x10000) {
		Packer_check(ptr, 5);
		Packer_write_buffer_1(ptr, 't');
		Packer_write_uint16(ptr, len);
	} else {
		Packer_check(ptr, 9);
		Packer_write_buffer_1(ptr, 'u');
		Packer_write_uint32(ptr, len);
	}

	rb_hash_foreach(hash, Packer_write_hash_each, (VALUE) ptr);
}

static VALUE
Packer_write_to_s (packer_t* ptr)
{
	uint64_t length = ptr->start->end - ptr->mem;
	uint64_t total_length = length;
	buffer_t* b = ptr->start->next;
	char* p = NULL;
	VALUE string;

	while (b != NULL) {
		total_length += b->end - b->begin;
		b = b->next;
	}

	string = rb_str_new(NULL, total_length);
	p = RSTRING_PTR(string);
	memcpy(p, ptr->mem, length);
	p += length;

	b = ptr->start->next;
	if (b == NULL) {
		return string;
	}
	while (1) {
		length = b->end - b->begin;
		memcpy(p, b->begin, length);
		if (b->next == NULL) {
			return string;
		}
		p += length;
		b = b->next;
	}
}

static VALUE
Packer_to_s (VALUE self)
{
	PACKER(self, ptr);
	return Packer_write_to_s(ptr);
}

static void
Packer_write_clear (packer_t* ptr)
{
	buffer_t* b;
	buffer_t* next;

	*ptr->mem = '\0';
	ptr->mem_end = ptr->mem;

	if (ptr->start->next != NULL) {
		b = ptr->start->next;
		while (b != NULL) {
			next = b->next;
			free(b);
			b = next;
		}
	}
	ptr->start->begin = ptr->mem;
	ptr->start->end = ptr->mem;
	ptr->start->next = NULL;
	ptr->buffer = ptr->start;
}

static VALUE
Packer_clear (VALUE self)
{
	PACKER(self, ptr);
	Packer_write_clear(ptr);
	return Qnil;
}

static void
Packer_nil (packer_t* ptr)
{
	Packer_check(ptr, 1);
	Packer_write_buffer_1(ptr, 'W');
}

static void
Packer_false (packer_t* ptr)
{
	Packer_check(ptr, 1);
	Packer_write_buffer_1(ptr, 'X');
}

static void
Packer_true (packer_t* ptr)
{
	Packer_check(ptr, 1);
	Packer_write_buffer_1(ptr, 'Y');
}

static void
Packer_write_value (packer_t* ptr, VALUE obj)
{
	switch (rb_type(obj)) {
	case T_NIL:
		Packer_nil(ptr);
		break;
	case T_FALSE:
		Packer_false(ptr);
		break;
	case T_TRUE:
		Packer_true(ptr);
		break;
	case T_FIXNUM:
		Packer_fixnum(ptr, obj);
		break;
	case T_BIGNUM:
		Packer_bignum(ptr, obj);
		break;
	case T_FLOAT:
		Packer_float(ptr, obj);
		break;
	case T_SYMBOL:
		Packer_symbol(ptr, obj);
		break;
	case T_STRING:
		Packer_str(ptr, obj);
		break;
	case T_ARRAY:
		Packer_array(ptr, obj);
		break;
	case T_HASH:
		Packer_map(ptr, obj);
		break;
	}
}

static VALUE
Packer_write (VALUE self, VALUE obj)
{
	PACKER(self, ptr);
	Packer_write_value(ptr, obj);
	return self;
}

static VALUE
AsciiPack_pack (int argc, VALUE* argv)
{
	VALUE str;
	VALUE v = argv[0];
	VALUE self = Packer_alloc(cAsciiPack_Packer);

	PACKER(self, ptr);
	if (!ptr) {
		rb_raise(rb_eArgError, "unallocated packer");
	}
	Packer_init(ptr);

	Packer_write_value(ptr, v);

	str = Packer_write_to_s(ptr);

	Packer_write_clear(ptr);
	return str;
}

static VALUE AsciiPack_to_asciipack (int argc, VALUE* argv, VALUE self)
{
	return AsciiPack_pack(1, &self);
}

void
AsciiPack_Packer_init(VALUE mAsciiPack)
{
	cAsciiPack_Packer = rb_define_class_under(mAsciiPack, "Packer", rb_cObject);
	rb_define_alloc_func(cAsciiPack_Packer, Packer_alloc);

	rb_define_method(cAsciiPack_Packer, "initialize", Packer_initialize, -1);
	rb_define_method(cAsciiPack_Packer, "write", Packer_write, 1);
	rb_define_alias(cAsciiPack_Packer, "pack", "write");
	rb_define_method(cAsciiPack_Packer, "to_s", Packer_to_s, 0);
	rb_define_method(cAsciiPack_Packer, "clear", Packer_clear, 0);

	rb_define_module_function(mAsciiPack, "pack", AsciiPack_pack, -1);

	rb_define_method(rb_cFixnum, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cBignum, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cFloat, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cString, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cSymbol, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cHash, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cArray, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cNilClass, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cFalseClass, "to_asciipack", AsciiPack_to_asciipack, -1);
	rb_define_method(rb_cTrueClass, "to_asciipack", AsciiPack_to_asciipack, -1);
}
