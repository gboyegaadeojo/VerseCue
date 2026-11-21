'use strict';
// SYNTHETIC capture frames and recognition streams; no microphone, model or ProPresenter.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {AudioLossPolicy}=require('../core/audio-loss-policy.cjs');const {AudioWindowBuffer}=require('../ui/audio-buffer.js');const {rehearse}=require('../core/auto-rehearsal.cjs');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('Auto pauses only after three losses within sixty seconds',()=>{
  const p=new AudioLossPolicy();assert.equal(p.record(0).pauseAuto,false);assert.equal(p.record(30000).pauseAuto,false);assert.deepEqual(p.record(59999),{pauseAuto:true,recentLosses:3});
  assert.equal(p.record(60000).pauseAuto,false,'History restarts after a pause');
  const spaced=new AudioLossPolicy();for(const t of [0,61000,122000,183000])assert.equal(spaced.record(t).pauseAuto,false,'Isolated losses never accumulate');
  const r=new AudioLossPolicy();r.record(0);r.record(1);r.reset();assert.equal(r.record(2).pauseAuto,false);
  assert.throws(()=>new AudioLossPolicy({limit:0}));assert.throws(()=>p.record(NaN));
});

test('window evidence reports loss since the previous window, while the session total keeps growing',async()=>{
  let node;const windows=[],gaps=[],track={label:'SYNTHETIC',stop(){}},stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
  class Context{constructor(){this.state='running';this.currentTime=100;this.audioWorklet={addModule:async()=>{}};this.destination={};}createMediaStreamSource(){return {connect(){}};}createGain(){return {gain:{value:1},connect(){}};}async close(){this.state='closed';}}
  class Worklet{constructor(){node=this;this.port={};}connect(){}disconnect(){}}
  const scope={window:{},navigator:{mediaDevices:{getUserMedia:async()=>stream}},AudioContext:Context,AudioWorkletNode:Worklet,AudioWindowBuffer};vm.runInNewContext(fs.readFileSync('ui/audio.js','utf8'),scope);
  const audio=new scope.window.PastorAudio({onLevel(){},onHealth(){},onWindow:async(_,meta)=>windows.push(meta),onLost(){},onDiscontinuity:gap=>gaps.push(gap)});await audio.start('synthetic-device',0,()=>true);
  let offset=0;const frame=()=>{node.port.onmessage({data:{samples:new Array(1600).fill(.1),rms:.1,peak:.1,sampleOffset:offset,capturedAtContextSeconds:100}});offset+=1600;};
  frame();offset+=1600;for(let i=0;i<100;i++){frame();await tick();}
  for(let i=0;i<100;i++){frame();await tick();}
  assert.equal(gaps.length,1);assert.ok(windows.length>=2);
  assert.equal(windows[0].droppedSamples,1600,'The window that followed the gap is lossy');
  assert.equal(windows[1].droppedSamples,0,'The next clean window is loss-free');assert.equal(windows[1].sessionDroppedSamples,1600,'The operator still sees the session total');
  assert.equal(audio.droppedSamples,1600);await audio.stop();
});

const win=(endSeconds,text,extra={})=>({endSeconds,durationSeconds:3,text,endEvidence:'silence',elapsedMs:500,droppedSamples:0,...extra});
const stream=(windows,labels)=>({schemaVersion:1,recordingId:'SYN-LOSS-'+Math.random().toString(36).slice(2,8),source:'SYNTHETIC-TEXT',split:'held-out',durationSeconds:600,windows,labels});
const display=(atSeconds,reference)=>({atSeconds,reference,translation:'KJV',intent:'display'});
test('rehearsal: one loss leaves Auto on for the next clean reference; persistent loss pauses it',async()=>{
  const once=await rehearse([stream([win(5,'and so we read',{droppedSamples:1600}),win(20,'Please show John chapter three verse sixteen.')],[display(18,'John 3:16')])]);
  assert.equal(once.recordings[0].automaticSends,1);assert.equal(once.recordings[0].autoPausedAtSeconds,null);
  const persistent=await rehearse([stream([win(5,'a',{droppedSamples:1600}),win(10,'b',{droppedSamples:1600}),win(15,'c',{droppedSamples:1600}),win(30,'Please show John chapter three verse sixteen.')],[display(28,'John 3:16')])]);
  assert.equal(persistent.recordings[0].automaticSends,0);assert.ok(persistent.recordings[0].autoPausedAtSeconds>0);assert.equal(persistent.recordings[0].missedDisplays,1);
});
