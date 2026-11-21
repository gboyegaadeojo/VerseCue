'use strict';
// SYNTHETIC worker processes only. No microphone, model or ProPresenter.
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const {EventEmitter}=require('node:events');
const childProcess=require('node:child_process');const spawned=[];
childProcess.spawn=()=>{const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.killed=false;child.kill=()=>{if(child.killed)return;child.killed=true;setImmediate(()=>child.emit('close',null));};child.finish=text=>{child.stdout.emit('data',Buffer.from(text));child.emit('close',0);};spawned.push(child);return child;};
const {LocalSpeech}=require('../core/stt.cjs');const {AudioWindowBuffer}=require('../ui/audio-buffer.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));const until=async predicate=>{for(let i=0;i<200&&!predicate();i++)await tick();assert.ok(predicate());};
async function cli(){const root=await fs.mkdtemp(path.join(os.tmpdir(),'versecue-provisional-'));const speech=new LocalSpeech();await speech.initializeScratch(root);speech.configure('trusted-cli','model','cli');return {speech,root};}
const audio=new Array(32000).fill(.1);

test('provisional recognition is marked non-final and leaves no scratch audio',async()=>{
  const {speech,root}=await cli();try{const pending=speech.transcribeProvisional(audio);await until(()=>spawned.length===1);spawned[0].finish('turn to John chapter');const result=await pending;assert.equal(result.final,false);assert.equal(result.text,'turn to John chapter');assert.equal(speech.busy,false);assert.deepEqual((await fs.readdir(root)).filter(name=>!name.startsWith('.')),[]);}finally{spawned.length=0;await fs.rm(root,{recursive:true,force:true});}
});
test('a completed window preempts an in-flight provisional run instead of waiting or being dropped',async()=>{
  const {speech,root}=await cli();try{const provisional=speech.transcribeProvisional(audio);await until(()=>spawned.length===1);const final=speech.transcribe(audio);await assert.rejects(provisional,/superseded/);assert.equal(spawned[0].killed,true);await until(()=>spawned.length===2);spawned[1].finish('John 3:16');const result=await final;assert.equal(result.final,true);assert.equal(result.text,'John 3:16');assert.equal(speech.busy,false);}finally{spawned.length=0;await fs.rm(root,{recursive:true,force:true});}
});
test('provisional runs never interrupt or overlap a completed window',async()=>{
  const {speech,root}=await cli();try{const final=speech.transcribe(audio);await until(()=>spawned.length===1);await assert.rejects(speech.transcribeProvisional(audio),/busy/);assert.equal(spawned[0].killed,false);spawned[0].finish('Romans 8:28');assert.equal((await final).text,'Romans 8:28');assert.equal(spawned.length,1);}finally{spawned.length=0;await fs.rm(root,{recursive:true,force:true});}
});
test('stop cancels provisional work and the resident worker cannot run provisional previews',async()=>{
  const {speech,root}=await cli();try{const provisional=speech.transcribeProvisional(audio);await until(()=>spawned.length===1);speech.cancel();await assert.rejects(provisional,/canceled|failed/);assert.equal(speech.busy,false);assert.deepEqual(speech.capabilities(),{provisional:true,final:true});speech.configure('trusted-cli','model','resident');assert.deepEqual(speech.capabilities(),{provisional:false,final:true});await assert.rejects(speech.transcribeProvisional(audio),/bounded CLI/);}finally{spawned.length=0;await fs.rm(root,{recursive:true,force:true});}
});

const voiced=(buffer,packets)=>{for(let i=0;i<packets;i++)buffer.push(new Array(1600).fill(.1),.1);};
test('buffer snapshots growing speech only when enabled and keeps the window intact',async()=>{
  const snapshots=[],windows=[];let enabled=false;const buffer=new AudioWindowBuffer({onWindow:samples=>windows.push(samples.length),onProvisional:(samples,meta)=>{snapshots.push({length:samples.length,meta});return new Promise(()=>{});},provisionalEnabled:()=>enabled});
  buffer.start();voiced(buffer,30);await tick();assert.equal(snapshots.length,0);enabled=true;voiced(buffer,1);await tick();assert.equal(snapshots.length,1);assert.equal(snapshots[0].length,49600);assert.equal(snapshots[0].meta.windowSequence,1);assert.equal(buffer.samples.length,49600);
  voiced(buffer,40);await tick();assert.equal(snapshots.length,1,'one provisional at a time');assert.equal(windows.length,0);buffer.stop();
});
test('a completed window dispatches immediately while a provisional snapshot is still running',async()=>{
  const windows=[];let releaseProvisional;const buffer=new AudioWindowBuffer({onWindow:samples=>{windows.push(samples.length);},onProvisional:()=>new Promise(resolve=>releaseProvisional=resolve),provisionalEnabled:()=>true});
  buffer.start();voiced(buffer,25);await tick();assert.equal(typeof releaseProvisional,'function');for(let i=0;i<10;i++)buffer.push(new Array(1600).fill(0),0);await tick();assert.deepEqual(windows,[56000]);releaseProvisional();await tick();buffer.stop();
});
test('no provisional snapshot while a completed window owns the worker, during silence or below two seconds',async()=>{
  let release;const snapshots=[];const buffer=new AudioWindowBuffer({capacity:48000,onWindow:()=>new Promise(resolve=>release=resolve),onProvisional:samples=>{snapshots.push(samples.length);},provisionalEnabled:()=>true});
  buffer.start();voiced(buffer,19);await tick();assert.equal(snapshots.length,0,'below two seconds');buffer.push(new Array(1600).fill(0),0);await tick();assert.equal(snapshots.length,0,'silence');buffer.stop();buffer.start();
  voiced(buffer,30);await tick();snapshots.length=0;voiced(buffer,15);await tick();assert.equal(buffer.busy,true);assert.equal(snapshots.length,0,'worker busy');buffer.stop();release();await tick();
});
test('each new provisional snapshot needs two more seconds of speech and a restart starts fresh',async()=>{
  const snapshots=[];const buffer=new AudioWindowBuffer({onWindow:()=>{},onProvisional:samples=>{snapshots.push(samples.length);},provisionalEnabled:()=>true});
  buffer.start();voiced(buffer,20);await tick();voiced(buffer,19);await tick();assert.deepEqual(snapshots,[32000]);voiced(buffer,1);await tick();assert.deepEqual(snapshots,[32000,64000]);buffer.stop();buffer.start();voiced(buffer,20);await tick();assert.deepEqual(snapshots,[32000,64000,32000]);buffer.stop();
});
