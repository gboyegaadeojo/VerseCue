'use strict';
// Early recognition (NR-027): a phrase is recognised during the pause that ends it; the result is used only when the
// pause is confirmed with no new speech. Phrase boundaries are unchanged.
const test=require('node:test');const assert=require('node:assert/strict');
const {AudioWindowBuffer}=require('../ui/audio-buffer.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const voice=(b,packets)=>{for(let i=0;i<packets;i++)b.push(new Array(1600).fill(.1),.1);};
const quiet=(b,packets)=>{for(let i=0;i<packets;i++)b.push(new Array(1600).fill(0),0);};
function make(reply=()=>({speculative:true})){
  const calls={spec:[],cancel:[],windows:[]};let release=null;
  const buffer=new AudioWindowBuffer({onWindow:async(samples,meta)=>{calls.windows.push({length:samples.length,meta});},onSpeculate:(samples,meta)=>{calls.spec.push({length:samples.length,meta});const r=reply(samples,meta);if(r==='hold')return new Promise(resolve=>{release=()=>resolve({speculative:true});});return r instanceof Error?Promise.reject(r):Promise.resolve(r);},onSpeculationCancel:id=>calls.cancel.push(id)});
  buffer.start();return {buffer,calls,release:()=>release?.()};
}
test('recognition starts after 0.3 s of silence and its result is used when the pause reaches 0.7 s',async()=>{
  const {buffer,calls}=make();voice(buffer,15);quiet(buffer,2);await tick();assert.equal(calls.spec.length,0,'not before 0.3 s');
  quiet(buffer,1);await tick();assert.equal(calls.spec.length,1,'started at 0.3 s of silence');assert.equal(calls.windows.length,0);
  quiet(buffer,4);await tick();await tick();
  assert.equal(calls.windows.length,1);assert.equal(calls.windows[0].meta.speculativeWindowId,calls.spec[0].meta.windowId,'the early result is committed');
  assert.equal(calls.windows[0].meta.windowSequence,calls.spec[0].meta.windowSequence);assert.equal(calls.cancel.length,0);
});
test('speech resuming discards the early result; the phrase then ends normally',async()=>{
  const {buffer,calls}=make();voice(buffer,15);quiet(buffer,3);await tick();assert.equal(calls.spec.length,1);
  voice(buffer,5);assert.deepEqual(calls.cancel,[calls.spec[0].meta.windowId],'discarded when speech resumes');
  quiet(buffer,3);await tick();assert.equal(calls.spec.length,2,'a new early start in the next pause');
  quiet(buffer,4);await tick();await tick();assert.equal(calls.windows.length,1);assert.equal(calls.windows[0].meta.speculativeWindowId,calls.spec[1].meta.windowId);
  assert.equal(calls.windows[0].length,(15+3+5+7)*1600,'the whole phrase, nothing cut');
});
test('a failed early recognition falls back to the normal window',async()=>{
  const {buffer,calls}=make(()=>new Error('busy'));voice(buffer,15);quiet(buffer,7);await tick();await tick();
  assert.equal(calls.windows.length,1);assert.equal(calls.windows[0].meta.speculativeWindowId,undefined);assert.equal(calls.cancel.length,1,'the failed attempt is released');
});
test('a slow early recognition is waited for, never sent twice',async()=>{
  const h=make(()=>'hold');voice(h.buffer,15);quiet(h.buffer,8);await tick();assert.equal(h.calls.windows.length,0,'waits for the early result');
  h.release();await tick();await tick();await tick();assert.equal(h.calls.windows.length,1);assert.ok(h.calls.windows[0].meta.speculativeWindowId);assert.equal(h.calls.spec.length,1);
});
test('a window under one second in total never starts early recognition; stop discards it',async()=>{
  const a=make();voice(a.buffer,4);quiet(a.buffer,5);await tick();assert.equal(a.calls.spec.length,0,'under one second of audio in total');
  const b=make(()=>'hold');voice(b.buffer,15);quiet(b.buffer,3);await tick();b.buffer.stop();assert.equal(b.calls.cancel.length,1);
});
