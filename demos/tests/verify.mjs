import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const wasmPath=fileURLToPath(new URL('../engine/labs.wasm',import.meta.url));
const {instance}=await WebAssembly.instantiate(readFileSync(wasmPath));
const e=instance.exports;
let tests=0;
function test(name,fn){fn();tests++;console.log('OK '+name);}
function wire(){return new Uint8Array(e.memory.buffer,e.frame_ptr(),e.frame_length()).slice();}
function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let bit=0;bit<8;bit++)c=(c>>>1)^((c&1)?0xEDB88320:0);}return (c^0xffffffff)>>>0;}
function crcFrame(data,endian='BE'){
 const n=data.length;const stored=new DataView(data.buffer).getUint32(n-4,endian==='LE');
 assert.equal(stored>>>0,crc(data.slice(0,-4)));
}
test('crc32 canonical vector',()=>{
 const bytes=new TextEncoder().encode('123456789');new Uint8Array(e.memory.buffer,e.input_ptr(),bytes.length).set(bytes);
 assert.equal(e.crc32_bytes(bytes.length)>>>0,0xcbf43926);
});
test('STGS wire format and 64-bit timestamp',()=>{
 const payload=new TextEncoder().encode('STGS test');new Uint8Array(e.memory.buffer,e.input_ptr(),payload.length).set(payload);
 assert.equal(e.stgs_build(0x1234,0xabcdef01,0x00000193,18.5,92,2,payload.length),27+payload.length);
 const b=wire();assert.equal(new TextDecoder().decode(b.slice(0,4)),'STGS');assert.equal(b[4],1);
 const view=new DataView(b.buffer);assert.equal(view.getUint16(5),0x1234);
 assert.equal(view.getBigUint64(7),0x193abcdef01n);
 assert.equal(view.getFloat32(15),18.5);assert.equal(b[19],92);assert.equal(b[20],2);
 assert.equal(view.getUint16(21),payload.length);crcFrame(b);assert.equal(e.stgs_check(),1);
});
test('STGS corruption rejected',()=>{e.frame_flip(23);assert.equal(e.stgs_check(),-5);});
test('STGS bounds enforced',()=>{assert.equal(e.stgs_build(0,1,0,13,120,0,0),0);assert.equal(e.stgs_build(0,1,0,13,60,0,513),0);});
test('LHBD frame big-endian and CRC',()=>{
 assert.equal(e.lhbd_build(4,0x1234,3),21);const b=wire();assert.equal(new TextDecoder().decode(b.slice(0,4)),'LHBD');
 assert.equal(b[5],4);assert.equal(new DataView(b.buffer).getUint16(8),0x1234);assert.equal(b[16],3);
 crcFrame(b);assert.equal(e.lhbd_check(),1);
});
test('LHBD corruption rejected',()=>{e.frame_flip(16);assert.equal(e.lhbd_check(),-5);});
test('EDDS frame little-endian and CRC',()=>{
 assert.equal(e.edds_build(0x1234,16,0x5678),16);const b=wire();const view=new DataView(b.buffer);
 assert.equal(b[0],0xed);assert.equal(b[1],0xd5);assert.equal(b[3],2);
 assert.equal(view.getUint16(4,true),0x1234);assert.equal(b[6],16);assert.equal(view.getUint16(10,true),0x5678);
 crcFrame(b,'LE');assert.equal(e.edds_check(),1);
});
test('EDDS corruption rejected',()=>{e.frame_flip(11);assert.equal(e.edds_check(),-5);});
test('MCPS session and permission checks',()=>{
 e.mcps_reset();assert.equal(e.mcps_command(3,0),-1);
 assert.equal(e.mcps_command(1,0),1);assert.equal(e.mcps_command(6,1),-2);
 assert.equal(e.mcps_command(2,0),-3);assert.equal(e.mcps_command(2,1),2);
 assert.equal(e.mcps_command(6,1),6);assert.equal(e.mcps_mode(),1);
 assert.equal(e.mcps_command(4,0),8);assert.equal(e.mcps_stream(),1);
 assert.equal(e.mcps_command(8,0),11);assert.equal(e.mcps_connected(),0);
});
test('queue capacity FIFO and nonblocking try push',()=>{
 e.queue_reset(4);for(let i=0;i<4;i++)assert.equal(e.queue_enqueue(i),1);
 assert.equal(e.queue_enqueue(5),0);assert.equal(e.queue_dropped(),1);
 assert.equal(e.queue_count(),4);assert.equal(e.queue_at(0),0);assert.equal(e.queue_at(2),2);
 assert.equal(e.queue_drain(2),2);assert.equal(e.queue_at(0),2);
 assert.equal(e.queue_enqueue(5),1);assert.equal(e.queue_count(),3);
 assert.equal(e.queue_processed(),2);
});
console.log('PASS '+tests+' tests');
