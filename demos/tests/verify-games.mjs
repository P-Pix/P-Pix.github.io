// Run: node demos/tests/verify-games.mjs -- no dependencies beyond Node.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','engine');
const load=(module,imports={})=>new WebAssembly.Instance(new WebAssembly.Module(fs.readFileSync(path.join(root,module+'.wasm'))),imports).exports;
const t=load('tetris');
t.tg_reset(2026);
assert.equal(t.tg_score(),0);assert.equal(t.tg_pieces(),1);
assert.equal(t.tg_rotations(1),2);assert.equal(t.tg_rotations(4),1);assert.equal(t.tg_rotations(6),4);
const bag=[t.tg_current(),...Array.from({length:6},(_,i)=>t.tg_next(i))];
assert.equal(new Set(bag).size,7,'first 7 pieces must contain each type once');
const firstSequence=[t.tg_current(),...Array.from({length:5},(_,i)=>t.tg_next(i))];
t.tg_reset(2026);
assert.deepEqual([t.tg_current(),...Array.from({length:5},(_,i)=>t.tg_next(i))],firstSequence,'determinism');
assert.equal(t.tg_act(6),1);assert.equal(t.tg_can_hold(),0);assert.equal(t.tg_act(6),0);
assert.equal(t.tg_act(5),1);assert.equal(t.tg_can_hold(),1);
assert.ok(t.tg_pieces()>=3);
const cells=new Uint8Array(t.memory.buffer,t.tg_board_ptr(),200);
assert.ok(cells.some(v=>v>0),'hard drop locks pieces');
let tiles=0;t.tg_reset(7);
for(let i=0;i<130;i++){if(!t.tg_ai())break;tiles++;
 assert.ok(t.tg_lines()>=0);assert.ok(t.tg_score()>=0);
}
assert.ok(tiles>=30,'2-ply AI must be able to play successive pieces');
console.log('OK Tetris: 7-bag/rotations/hold/drop/AI and board');
const env={js_exp:Math.exp,js_tanh:Math.tanh,js_log:Math.log,js_sqrt:Math.sqrt};
const n=load('neural',{env});
for(const h of [1,2]){
 n.nn_clear_samples();n.nn_reset(h,0.08,2026);
 for(let i=0;i<320;i++){
  const x=(i%4<2?-0.8:0.8),label=i%2;
  const y=(label===0?x:-x);
  assert.ok(n.nn_add_point(x,y,label,i%5===0?1:0)>0);
 }
 assert.equal(n.nn_sample_count(),320);
 const before=n.nn_loss(1);assert.ok(Number.isFinite(before)&&before>0);
 n.nn_train(100);n.nn_train(100);n.nn_train(100);
 const after=n.nn_loss(1),accuracy=n.nn_accuracy(1);
 assert.ok(after<before*0.5,`XOR with ${h} hidden: loss ${before} -> ${after}`);
 assert.ok(accuracy>.98,`XOR test accuracy ${accuracy}`);
 assert.equal(n.nn_epoch(),300);
 assert.equal(n.nn_compute_field(60),3600);
 const view=new Uint8Array(n.memory.buffer,n.nn_field_ptr(),3600);
 assert.ok(view.some(p=>p<100)&&view.some(p=>p>160));
 console.log(`OK Neural (${h} hidden layers): test loss ${before.toFixed(3)} -> ${after.toFixed(3)}, acc ${accuracy.toFixed(2)}`);
}
assert.equal(n.nn_add_point(400,0,1,1),0,'out of domain rejected');
assert.equal(n.nn_compute_field(200),0,'oversize heatmap rejected');
console.log('PASS 2 WASM game engines');
