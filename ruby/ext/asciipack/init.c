#include "packer.h"
#include "unpacker.h"

void
Init_asciipack(void)
{
	VALUE mAsciiPack = rb_define_module("AsciiPack");
	AsciiPack_Unpacker_init(mAsciiPack);
	AsciiPack_Packer_init(mAsciiPack);
}
