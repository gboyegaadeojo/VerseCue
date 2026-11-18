'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {AudioWindowBuffer}=require('../ui/audio-buffer.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('worker windows distinguish silence completion from forced window limits',async()=>{const endings=[];const buffer=new AudioWindowBuffer({onWindow:async(_,meta)=>endings.push(meta.endEvidence)});buffer.start();for(let i=0;i<120;i++)buffer.push(new Array(1600).fill(.1),.1);await tick();buffer.push(new Array(1600).fill(.1),.1);for(let i=0;i<10;i++)buffer.push(new Array(1600).fill(0),0);await tick();buffer.stop();assert.deepEqual(endings,['window-limit','silence']);});
test('capture retains the next bounded window while one inference is busy',async()=>{
  const windows=[],release=[];const buffer=new AudioWindowBuffer({capacity:8,onWindow:samples=>{windows.push(samples);return new Promise(resolve=>release.push(resolve));}});buffer.start();buffer.push([1,2,3,4,5,6,7,8],1);await tick();buffer.push([9,10,11,12,13,14,15,16],1);assert.equal(windows.length,1);release.shift()();await tick();assert.deepEqual(windows[1],[9,10,11,12,13,14,15,16]);release.shift()();await tick();buffer.stop();
});
test('overflow drops oldest samples explicitly and never exceeds capacity',async()=>{
  let release;const drops=[],windows=[];const buffer=new AudioWindowBuffer({capacity:4,onDrop:drop=>drops.push(drop),onWindow:samples=>{windows.push(samples);return new Promise(resolve=>release=resolve);}});buffer.start();buffer.push([1,2,3,4],1);await tick();buffer.push([5,6,7,8],1);buffer.push([9,10],1);assert.equal(buffer.samples.length,4);assert.equal(drops[0].samples,2);release();await tick();assert.deepEqual(windows[1],[7,8,9,10]);buffer.stop();release();await tick();
});
test('completed pending audio expires instead of entering a stale inference backlog',async()=>{
  let now=0,release;const windows=[],drops=[];const buffer=new AudioWindowBuffer({capacity:4,clock:()=>now,onDrop:drop=>drops.push(drop),onWindow:samples=>{windows.push(samples);return new Promise(resolve=>release=resolve);}});buffer.start();buffer.push([1,2,3,4],1);await tick();buffer.push([5,6,7,8],1);now=4001;release();await tick();assert.equal(windows.length,1);assert.equal(drops[0].reason,'stale');assert.equal(buffer.samples.length,0);buffer.stop();
});
test('stop discards pending audio and a restart waits for the owned in-flight request',async()=>{
  const windows=[],releases=[];const buffer=new AudioWindowBuffer({capacity:4,onWindow:samples=>{windows.push(samples);return new Promise(resolve=>releases.push(resolve));}});buffer.start();buffer.push([1,2,3,4],1);await tick();buffer.push([5,6,7,8],1);buffer.stop();buffer.start();buffer.push([9,10,11,12],1);assert.equal(windows.length,1);releases.shift()();await tick();assert.deepEqual(windows[1],[9,10,11,12]);buffer.stop();releases.shift()();await tick();assert.equal(windows.length,2);
});
test('stop before dispatch prevents the queued microtask from starting recognition',async()=>{
  let calls=0;const buffer=new AudioWindowBuffer({capacity:4,onWindow:()=>calls++});buffer.start();buffer.push([1,2,3,4],1);buffer.stop();await tick();assert.equal(calls,0);
});
