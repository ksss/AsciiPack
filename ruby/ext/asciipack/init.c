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

#include "packer.h"
#include "unpacker.h"

void
Init_asciipack(void)
{
	VALUE mAsciiPack = rb_define_module("AsciiPack");
	AsciiPack_Unpacker_init(mAsciiPack);
	AsciiPack_Packer_init(mAsciiPack);
}
