'use strict';
// SYNTHETIC-TEXT streams only. They exercise the harness, not speech accuracy.
const test=require('node:test');const assert=require('node:assert/strict');const {rehearse,validateStream,GATE_SECONDS}=require('../core/auto-rehearsal.cjs');
const win=(endSeconds,text,extra={})=>({endSeconds,durationSeconds:3,text,endEvidence:'silence',elapsedMs:500,droppedSamples:0,...extra});
const stream=(windows,labels,extra={})=>({schemaVersion:1,recordingId:'SYN-'+Math.random().toString(36).slice(2,10),source:'SYNTHETIC-TEXT',split:'held-out',durationSeconds:600,windows,labels,...extra});
const display=(atSeconds,reference)=>({atSeconds,reference,translation:'KJV',intent:'display'});

test('an explicit instruction auto-sends once in dry run and matches its display label',async()=>{
  const r=await rehearse([stream([win(10,'Please show John chapter three verse sixteen.')],[display(8,'John 3:16')])]);
  assert.deepEqual({sends:r.recordings[0].automaticSends,correct:r.recordings[0].correctAutomaticSends,wrong:r.recordings[0].wrongOutputs,missed:r.recordings[0].missedDisplays},{sends:1,correct:1,wrong:0,missed:0});
});
test('a passing mention does not auto-send, and an unlabelled instruction counts as a spurious wrong output',async()=>{
  const r=await rehearse([stream([win(10,'As John 3:16 tells us, God loves the world.')],[{atSeconds:8,reference:'John 3:16',translation:'KJV',intent:'mention'}]),stream([win(30,'Please show Romans chapter eight verse twenty-eight.')],[])]);
  assert.equal(r.recordings[0].automaticSends,0);assert.equal(r.recordings[0].wrongOutputs,0);
  assert.equal(r.recordings[1].wrongOutputs,1);assert.equal(r.recordings[1].wrong.spurious,1);
});
test('a misrecognized verse near a display label counts as a wrong reference, and the label as missed',async()=>{
  const r=await rehearse([stream([win(10,'Please show John chapter three verse seventeen.')],[display(8,'John 3:16')])]);
  assert.equal(r.recordings[0].wrong.wrongReference,1);assert.equal(r.recordings[0].missedDisplays,1);
});
test('new speech inside the hold window cancels the pending send, as in the app',async()=>{
  const r=await rehearse([stream([win(10,'Please show John chapter three verse sixteen.'),win(10.6,'No, wait.',{durationSeconds:0.5})],[display(8,'John 3:16')])],{holdMs:1000});
  assert.equal(r.recordings[0].automaticSends,0);assert.equal(r.recordings[0].missedDisplays,1);
  const later=await rehearse([stream([win(10,'Please show John chapter three verse sixteen.'),win(20,'Amen.',{durationSeconds:1})],[display(8,'John 3:16')])],{holdMs:1000});
  assert.equal(later.recordings[0].automaticSends,1);
});
test('lossy or forced-limit windows never auto-send',async()=>{
  const r=await rehearse([stream([win(10,'Please show John chapter three verse sixteen.',{droppedSamples:160}),win(40,'Please show Romans chapter eight verse twenty-eight.',{endEvidence:'window-limit'})],[display(8,'John 3:16'),display(38,'Romans 8:28')])]);
  assert.equal(r.recordings[0].automaticSends,0);assert.equal(r.recordings[0].wrongOutputs,0);
});
test('the ten-hour gate counts only reviewed held-out real recordings and fails on any wrong output',async()=>{
  const real=(extra={})=>stream([win(10,'Please show John chapter three verse sixteen.')],[display(8,'John 3:16')],{source:'REAL-RECORDING',dataUseAuthorized:true,labelsReviewed:true,durationSeconds:GATE_SECONDS/2,...extra});
  let r=await rehearse([real(),real()]);assert.equal(r.gate.reviewedHeldOutRealSeconds,GATE_SECONDS);assert.equal(r.gate.passed,true);assert.equal(r.serviceAcceptancePassed,false);
  r=await rehearse([real(),real({labelsReviewed:false}),stream([win(10,'x')],[],{durationSeconds:GATE_SECONDS})]);assert.equal(r.gate.reviewedHeldOutRealSeconds,GATE_SECONDS/2);assert.equal(r.gate.passed,false,'Unreviewed and synthetic audio never count');
  r=await rehearse([real(),real({split:'tuning'}),real({windows:[win(10,'Please show John chapter three verse seventeen.')]})]);assert.equal(r.gate.wrongOutputs,1);assert.equal(r.gate.passed,false);
});
test('malformed streams are rejected before replay',()=>{
  const ok=stream([win(10,'hello')],[]);assert.doesNotThrow(()=>validateStream(ok));
  for(const bad of [{...ok,transcript:'x'},{...ok,windows:[win(10,'a'),win(5,'b')]},{...ok,labels:[display(1,'john three sixteen')]},{...ok,source:'REAL-RECORDING'},{...ok,windows:[{...win(10,'a'),speaker:'x'}]},{...ok,durationSeconds:0}])assert.throws(()=>validateStream(bad));
});
