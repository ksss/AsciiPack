#include "unpacker.h"

VALUE cAsciiPack_Unpacker;
static ID id_positive_fixint, id_fixstr;
static ID id_int4, id_int8, id_int16, id_int32, id_int64;
static ID id_uint8, id_uint16, id_uint32, id_uint64;
static ID id_str8, id_str16, id_str32;
static ID id_float32, id_float64;
static ID id_map4, id_map8, id_map16, id_map32;
static ID id_array4, id_array8, id_array16, id_array32;
static ID id_move, id_next, id_slice;
static ID id_iv_ap, id_iv_at, id_iv_ch;

typedef struct unpacker {
	char* buffer;
	char* ch;
} unpacker_t;

#define UNPACKER(from, name) \
	unpacker_t* name; \
	Data_Get_Struct(from, unpacker_t, name); \
	if (name == NULL) { \
		rb_raise(rb_eArgError, "NULL found for " # name " when shouldn't be.'"); \
	}

static void
unpacker_mark(unpacker_t* ptr)
{
}

static VALUE
Unpacker_alloc(VALUE klass)
{
	unpacker_t *ptr = ALLOC(unpacker_t);
	return Data_Wrap_Struct(klass, unpacker_mark, -1, ptr);
}

static void
move (unpacker_t* ptr)
{
	ptr->ch++;
}

static char*
cut (unpacker_t* ptr, size_t n)
{
	char* ret = malloc(sizeof(char) * n);
	memset(ret, 0, n);
	memcpy(ret, ptr->ch, n);
	ptr->ch += n;
	return ret;
}

static VALUE
Unpacker_init(VALUE self, VALUE obj, int argc, VALUE *argv, VALUE size)
{
	UNPACKER(self, ptr);

	if (!ptr) {
		rb_raise(rb_eArgError, "unallocated unpacker");
	}

	ptr->buffer = RSTRING_PTR(obj);
	ptr->ch = ptr->buffer;

	return self;
}

static VALUE
Unpacker_initialize(int argc, VALUE *argv, VALUE self)
{
	VALUE obj = *argv++;
	VALUE size = Qnil;
	return Unpacker_init(self, obj, argc, argv, size);
}

static unsigned short
to_i16 (char ch)
{
	unsigned short ret = 0;
	if ('0' <= ch && ch <= '9') {
		ret += ch - '0';
	} else if ('a' <= ch && ch <= 'f') {
		ret += ch - 'a' + 10;
	}
	return ret;
}

uint64_t
Unpacker_int (unpacker_t* ptr, size_t n)
{
	size_t len = n;
	char* head = ptr->ch;
	uint64_t ret = 0;
	uint64_t base = 1;

	while (len--) {
		ret += to_i16(*ptr->ch);
		ptr->ch++;
		if (len != 0) ret = ret << 4;
	}

	if ('8' <= *head) {
		ret -= (base << (n * 4));
	}
	return ret;
}

uint64_t
Unpacker_uint (unpacker_t* ptr, size_t n)
{
	size_t len = n;
	char* head = ptr->ch;
	uint64_t ret = 0;
	uint64_t base = 1;

	while (len--) {
		ret += to_i16(*ptr->ch);
		ptr->ch++;
		if (len != 0) ret = ret << 4;
	}

	return ret;
}

double
Unpacker_float (unpacker_t* ptr, int n)
{
	int len = n;
	int width = 16 - n;
	uint64_t ret = 0;
	int num = 0;
	bool sign = 0;
	int exp = 0;
	uint64_t frac = 1;

	while (len--) {
		num += to_i16(*ptr->ch);
		ptr->ch++;
		if (len != 0) num = num << 4;
	}

	sign = num & 0x800;
	exp = (num & 0x7ff) - 1023;

	frac = frac << 4;
	while (width--) {
		frac += to_i16(*ptr->ch);
		ptr->ch++;
		if (width != 0) frac = frac << 4;
	}

//	if (num == 0x7ff && frac != 0) {
//		return NAN;
//	} else if (num == 0x7ff && ) {
//		return INFINITY;
//	} else
	return (double) (sign == 0 ? 1 : -1) * frac * (2**(exp - 52))
}
//    def float64
//      # IEEE 752 format
//      hex = cut(3)
//      num = hex.to_i(16)
//      sign = num & 0x800
//      exp = (num & 0x7ff) - 1023
//      frac = ('1' + cut(13)).to_i(16)
//
//      if hex == '7ff' && frac != 0
//        return Float.NAN
//      elsif hex == '7ff' && frac == 0
//        return Float.INFINITY
//      elsif hex == 'fff' && frac == 0
//        return -1 / 0.0
//      end
//
//      ((sign == 0 ? 1 : -1) * frac * (2**(exp - 52))).to_f

static VALUE
Unpacker_unpack (VALUE self)
{
	uint64_t num;

	UNPACKER(self, ptr);
	move(ptr);

	switch (*(ptr->ch - 1)) {
		case 'a': // int 4
			num = Unpacker_int(ptr, 1);
			return INT2FIX((int)num);
		case 'b': // int 8
			num = Unpacker_int(ptr, 2);
			return INT2FIX((int)num);
		case 'c': // int 16
			num = Unpacker_int(ptr, 4);
			return INT2FIX(num);
		case 'd': // int 32
			num = Unpacker_int(ptr, 8);
			return LONG2NUM(num);
		case 'e': // int 64
			num = Unpacker_int(ptr, 16);
			return rb_ll2inum(num);
		case 'g':
			num = Unpacker_uint(ptr, 2);
			return INT2FIX(num);
		case 'h':
			num = Unpacker_uint(ptr, 4);
			return INT2FIX(num);
		case 'i':
			num = Unpacker_uint(ptr, 8);
			return LONG2NUM(num);
		case 'j':
			num = Unpacker_uint(ptr, 16);
			return rb_ull2inum(num);
		case 'k':
			num = Unpacker_float(ptr);
			return rb_float_new(num);
		case 'l':
			num = Unpacker_float(ptr);
			return rb_float_new(num);
		case 'n':
			return rb_funcall(self, rb_intern("str8"), 0);
		case 'o':
			return rb_funcall(self, rb_intern("str16"), 0);
		case 'p':
			return rb_funcall(self, rb_intern("str32"), 0);
		case 'r':
			return rb_funcall(self, id_map4, 0);
		case 's':
			return rb_funcall(self, id_map8, 0);
		case 't':
			return rb_funcall(self, id_map16, 0);
		case 'u':
			return rb_funcall(self, id_map32, 0);
		case 'v':
			return rb_funcall(self, id_array4, 0);
		case 'w':
			return rb_funcall(self, id_array8, 0);
		case 'x':
			return rb_funcall(self, id_array16, 0);
		case 'y':
			return rb_funcall(self, id_array32, 0);
		case '0': return INT2FIX(0);
		case '1': return INT2FIX(1);
		case '2': return INT2FIX(2);
		case '3': return INT2FIX(3);
		case '4': return INT2FIX(4);
		case '5': return INT2FIX(5);
		case '6': return INT2FIX(6);
		case '7': return INT2FIX(7);
		case '8': return INT2FIX(8);
		case '9': return INT2FIX(9);
		case 'A': return INT2FIX(10);
		case 'B': return INT2FIX(11);
		case 'C': return INT2FIX(12);
		case 'D': return INT2FIX(13);
		case 'E': return INT2FIX(14);
		case 'F': return INT2FIX(15);
		case 'G':
		case 'H':
		case 'I':
		case 'J':
		case 'K':
		case 'L':
		case 'M':
		case 'N':
		case 'O':
		case 'P':
		case 'Q':
		case 'R':
		case 'S':
		case 'T':
		case 'U':
		case 'V':
			return rb_funcall(self, rb_intern("fixstr"), 0);
		case 'W': return Qnil;
		case 'X': return Qfalse;
		case 'Y': return Qtrue;
	}
	rb_raise(rb_eArgError, "undefined type:%c", *(ptr->ch));
	return Qnil;
}

void
Init_asciipack(void)
{
// TODO
//	rb_define_method(rb_cArray, "to_asciipack", obj_to_asciipack, -1);
//	rb_define_method(rb_cHash,  "to_asciipack", obj_to_asciipack, -1);

	id_positive_fixint = rb_intern("positive_fixint");
	id_map4 = rb_intern("map4");
	id_map8 = rb_intern("map8");
	id_map16 = rb_intern("map16");
	id_map32 = rb_intern("map32");
	id_array4 = rb_intern("array4");
	id_array8 = rb_intern("array8");
	id_array16 = rb_intern("array16");
	id_array32 = rb_intern("array32");
	id_move = rb_intern("move");
	id_iv_ap = rb_intern("@ap");
	id_iv_at = rb_intern("@at");
	id_iv_ch = rb_intern("@ch");
	id_next = rb_intern("next");
	id_slice = rb_intern("slice");

	VALUE mAsciiPack = rb_path2class("AsciiPack");
	VALUE cAsciiPack_Unpacker = rb_define_class_under(mAsciiPack, "Unpacker", rb_cObject);

	rb_define_alloc_func(cAsciiPack_Unpacker, Unpacker_alloc);

	rb_define_method(cAsciiPack_Unpacker, "unpack", Unpacker_unpack, 0);
	rb_define_method(cAsciiPack_Unpacker, "initialize", Unpacker_initialize, -1);
}
