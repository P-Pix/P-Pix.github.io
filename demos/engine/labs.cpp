/*
 * C++20 freestanding WebAssembly adapters for P-Pix portfolio.
 * Source of protocol specifications: the five uploaded native repositories.
 * These routines intentionally implement portable, selected paths rather than
 * claim to compile Linux socket, POSIX threads or GUI applications as-is.
 * No libc, malloc, RTTI, syscalls, network or pthread dependencies.
 */
extern "C" void* memcpy(void* dest,const void* src,unsigned long n){
  auto* d=(volatile unsigned char*)dest;const auto* s=(const volatile unsigned char*)src;
  for(unsigned long i=0;i<n;i++) d[i]=s[i];return dest;
}
using u8 = unsigned char;
using u16 = unsigned short;
using u32 = unsigned int;
using u64 = unsigned long long;
static_assert(sizeof(u8)==1 && sizeof(u16)==2 && sizeof(u32)==4 && sizeof(u64)==8);
static u8 frame[8192];
static u8 input[512];
static int frame_size=0;
static int error_count=0;
static u32 compute_crc(const u8* bytes,int n){
  u32 crc=0xffffffffU;
  for(int i=0;i<n;i++){
    crc^=bytes[i];
    for(int bit=0;bit<8;bit++)crc=(crc>>1)^((crc&1U)?0xEDB88320U:0U);
  }
  return crc^0xffffffffU;
}
static void be16(int p,u32 value){ frame[p]=(u8)(value>>8); frame[p+1]=(u8)value; }
static void be32(int p,u32 value){ for(int i=0;i<4;i++)frame[p+i]=(u8)(value>>(24-8*i)); }
static void be64(int p,u64 value){ for(int i=0;i<8;i++)frame[p+i]=(u8)(value>>(56-8*i)); }
static void le16(int p,u32 value){frame[p]=(u8)value;frame[p+1]=(u8)(value>>8);}
static void le32(int p,u32 value){for(int i=0;i<4;i++)frame[p+i]=(u8)(value>>(8*i));}
static u32 read_be32(int p){return (u32(frame[p])<<24)|(u32(frame[p+1])<<16)|(u32(frame[p+2])<<8)|u32(frame[p+3]);}
static u32 read_le32(int p){return u32(frame[p])|(u32(frame[p+1])<<8)|(u32(frame[p+2])<<16)|(u32(frame[p+3])<<24);}
static u32 raw_float(float value){ union{float f;u32 i;} raw={value};return raw.i; }
static void frame_copy(int start,int len){for(int i=0;i<len;i++)frame[start+i]=input[i];}

extern "C" {
int input_ptr(){return (int)(unsigned long)input;}
int frame_ptr(){return (int)(unsigned long)frame;}
int frame_length(){return frame_size;}
u32 crc32_bytes(int len){return len>=0 && len<=512?compute_crc(input,len):0U;}
void frame_flip(int offset){if(offset>=0 && offset<frame_size)frame[offset]^=0x01;}
u32 frame_crc_actual(){return frame_size>=4?compute_crc(frame,frame_size-4):0U;}
int frame_byte(int p){return p>=0 && p<frame_size?frame[p]:-1;}

/* STGS v1: magic, version, sat ID, timestamp, IEEE f32 BE,
   battery, status, payload len BE, payload, CRC32 BE. */
int stgs_build(int satellite,int timestamp_lo,int timestamp_hi,float temperature,int battery,int status,int len){
  if(satellite<0||satellite>65535||battery<0||battery>100||status<0||status>3||len<0||len>512||temperature!=temperature||temperature>1000000.0f||temperature< -1000000.0f)return 0;
  be32(0,0x53544753U);frame[4]=1;be16(5,u32(satellite));be64(7,(u64(u32(timestamp_hi))<<32)|u64(u32(timestamp_lo)));
  be32(15,raw_float(temperature));frame[19]=u8(battery);frame[20]=u8(status);
  be16(21,u32(len));frame_copy(23,len);frame_size=23+len+4;
  be32(frame_size-4,compute_crc(frame,frame_size-4));return frame_size;
}
/* return 1 success; negative codes correspond to expected native codec checks. */
int stgs_check(){
  if(frame_size<27)return -1;
  if(read_be32(0)!=0x53544753U)return -2;
  if(frame[4]!=1)return -3;
  int payload=(int(frame[21])<<8)|frame[22];
  if(payload>4096 || 27+payload!=frame_size)return -4;
  if(read_be32(frame_size-4)!=compute_crc(frame,frame_size-4))return -5;
  if(frame[19]>100 || frame[20]>3)return -6;
  return 1;
}

/* LHBD v1: magic LHBD, version, cmd,status,flags, seq BE,
   reserved BE, payload len BE, payload, CRC32 BE. */
int lhbd_build(int command,int sequence,int sensor){
  if(command<1||command>6||sequence<0||sequence>65535||sensor<1||sensor>4)return 0;
  be32(0,0x4C484244U);frame[4]=1;frame[5]=u8(command);frame[6]=0;frame[7]=0;
  be16(8,u32(sequence));be16(10,0);be32(12,1);
  frame[16]=u8(sensor);frame_size=21;
  be32(17,compute_crc(frame,17));return frame_size;
}
int lhbd_check(){
  if(frame_size<20)return -1;
  if(read_be32(0)!=0x4C484244U)return -2;
  if(frame[4]!=1)return -3;
  if(read_be32(12)>4096 || int(read_be32(12))+20!=frame_size)return -4;
  if(read_be32(frame_size-4)!=compute_crc(frame,frame_size-4))return -5;
  return 1;
}

/* EDDS v1: magic ED D5, version, request/response, seq LE,
   cmd,status,len LE,payload,CRC32 LE. */
int edds_build(int sequence,int command,int sample){
  if(sequence<0||sequence>65535||!(command==1||(command>=16&&command<=20)||command==32||command==48))return 0;
  frame[0]=0xED;frame[1]=0xD5;frame[2]=1;frame[3]=2;
  le16(4,u32(sequence));frame[6]=u8(command);frame[7]=0;le16(8,2);
  le16(10,u32(sample));frame_size=16;le32(12,compute_crc(frame,12));return frame_size;
}
int edds_check(){
  if(frame_size<14)return -1;
  if(frame[0]!=0xED||frame[1]!=0xD5)return -2;
  if(frame[2]!=1||frame[3]<1||frame[3]>2)return -3;
  int payload=int(frame[8])|(int(frame[9])<<8);
  if(payload>4096||payload+14!=frame_size)return -4;
  if(read_le32(frame_size-4)!=compute_crc(frame,frame_size-4))return -5;
  return 1;
}

/* MCPS/1.0 single-session adapter with CONNECT/AUTH gating.
   Not the original multi-client TCP server. */
static int connected=0,authorized=0,mode=0,stream=0,commands=0;
void mcps_reset(){connected=authorized=mode=stream=commands=error_count=0;}
int mcps_command(int command,int argument){
  commands++;
  if(command==1){connected=1;return 1;}
  if(command==7)return 10; // PING is unprivileged in native CommandProcessor.
  if(command==8){connected=authorized=stream=0;return 11;}
  if(!connected){error_count++;return -1;}
  if(command==2){if(argument==1){authorized=1;return 2;}error_count++;return -3;}
  if(!authorized){error_count++;return -2;}
  if(command==3)return 7;
  if(command==4){stream=1;return 8;}
  if(command==5){stream=0;return 9;}
  if(command==6){if(argument<0||argument>2){error_count++;return -4;}mode=argument;return 6;}
  error_count++;return -5;
}
int mcps_connected(){return connected;}
int mcps_authorized(){return authorized;}
int mcps_mode(){return mode;}
int mcps_stream(){return stream;}
int mcps_commands(){return commands;}
int mcps_errors(){return error_count;}

/* HPBLR-inspired non-blocking try_push model (saturation -> false).
   AsyncRecorder::submit uses the blocking push instead. This deterministic
   visualization is not the native threaded recorder or file format. */
static int ring[64];static int head=0,tail=0,count=0,capacity=8,accepted=0,processed=0,dropped=0;
void queue_reset(int requested){if(requested<1)requested=1;if(requested>64)requested=64;capacity=requested;head=tail=count=accepted=processed=dropped=0;}
int queue_enqueue(int priority){
  if(priority<0||priority>5)return -1;
  if(count==capacity){dropped++;return 0;}
  ring[tail]=priority;tail=(tail+1)%capacity;count++;accepted++;return 1;
}
int queue_drain(int n){int drained=0;if(n>64)n=64;while(n-->0&&count){head=(head+1)%capacity;count--;drained++;processed++;}return drained;}
int queue_count(){return count;}
int queue_capacity(){return capacity;}
int queue_dropped(){return dropped;}
int queue_accepted(){return accepted;}
int queue_processed(){return processed;}
int queue_at(int p){return p>=0&&p<count?ring[(head+p)%capacity]:-1;}
} // extern C
