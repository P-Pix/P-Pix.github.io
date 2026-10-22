#include <stdint.h>
extern "C" {
void* memset(void* dst,int byte,__SIZE_TYPE__ n){volatile unsigned char* p=(volatile unsigned char*)dst;for(__SIZE_TYPE__ i=0;i<n;i++)p[i]=(unsigned char)byte;return dst;}
void* memcpy(void* dst,const void* src,__SIZE_TYPE__ n){volatile unsigned char* d=(volatile unsigned char*)dst;const volatile unsigned char* s=(const volatile unsigned char*)src;for(__SIZE_TYPE__ i=0;i<n;i++)d[i]=s[i];return dst;}
void* memmove(void* dst,const void* src,__SIZE_TYPE__ n){volatile unsigned char* d=(volatile unsigned char*)dst;const volatile unsigned char* s=(const volatile unsigned char*)src;if((uintptr_t)d<(uintptr_t)s){for(__SIZE_TYPE__ i=0;i<n;i++)d[i]=s[i];}else{for(__SIZE_TYPE__ i=n;i>0;i--)d[i-1]=s[i-1];}return dst;}
}
