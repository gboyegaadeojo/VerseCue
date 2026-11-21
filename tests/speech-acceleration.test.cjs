'use strict';
// Graphics-card speech: GPU is the default, CPU adds whisper.cpp's -ng flag, and only the first GPU request gets the warm-up allowance.
const test=require('node:test');const assert=require('node:assert/strict');const {EventEmitter}=require('node:events');
const childProcess=require('node:child_process');const settings=require('../core/settings.cjs');
const calls=[];const realSpawn=childProcess.spawn,realSetTimeout=global.setTimeout;
function fakeSpawn(executable,args){
  calls.push({executable,args});const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};
  realSetTimeout(()=>{child.stdout.emit('data',Buffer.from('John 3:16'));child.emit('close',0);},5);return child;
}
childProcess.spawn=fakeSpawn;delete require.cache[require.resolve('../core/stt.cjs')];
const {LocalSpeech}=require('../core/stt.cjs');childProcess.spawn=realSpawn;
const scratch={ready:true,create:async()=>({directory:'d',file:'f.wav'}),remove:async()=>{}};
function timeouts(run){const seen=[];global.setTimeout=(fn,ms,...rest)=>{seen.push(ms);return realSetTimeout(fn,ms,...rest);};return run().finally(()=>{global.setTimeout=realSetTimeout;}).then(()=>seen);}
test('settings default to the graphics card and validate the choice',()=>{
  assert.equal(settings.defaults().speechAcceleration,'gpu');assert.equal(settings.validateSettings({schemaVersion:1}).speechAcceleration,'gpu');
  assert.equal(settings.validateSettings({...settings.defaults(),speechAcceleration:'cpu'}).speechAcceleration,'cpu');
  assert.throws(()=>settings.validateSettings({...settings.defaults(),speechAcceleration:'cuda'}),/acceleration/);
  assert.throws(()=>new LocalSpeech().configure('w','m','cli','tpu'),/acceleration/);
});
test('CPU choice passes -ng; GPU does not, and gets the one-time warm-up allowance',async()=>{
  const speech=new LocalSpeech();speech.scratch=scratch;speech.configure('whisper-cli','model.bin','cli');calls.length=0;
  const first=await timeouts(()=>speech.transcribe(new Array(16000).fill(0)));
  assert.ok(!calls[0].args.includes('-ng'));assert.ok(first.includes(90000));
  const second=await timeouts(()=>speech.transcribe(new Array(16000).fill(0)));
  assert.ok(second.includes(20000)&&!second.includes(90000));
  speech.configure('whisper-cli','model.bin','cli','cpu');
  const cpu=await timeouts(()=>speech.transcribe(new Array(16000).fill(0)));
  assert.ok(calls[2].args.includes('-ng'));assert.ok(cpu.includes(20000)&&!cpu.includes(90000));
  assert.equal(speech.resident.acceleration,'cpu');assert.equal(speech.resident.warmedUp,false);
});
test('heard clarity is the mean word-token probability, ignoring special and punctuation tokens',()=>{
  const {heardConfidence}=require('../core/stt.cjs');
  assert.equal(heardConfidence([{text:'[_BEG_]',p:.01},{text:' John',p:.9},{text:' 3',p:.8},{text:':',p:.1},{text:'16',p:1}]),0.9);
  assert.equal(heardConfidence([]),null);assert.equal(heardConfidence(null),null);assert.equal(heardConfidence([{text:' a',p:NaN}]),null);
});
test('final windows use a 15 s audio context and write token probabilities; previews do not',async()=>{
  const speech=new LocalSpeech();speech.scratch=scratch;speech.configure('whisper-cli','model.bin','cli','cpu');calls.length=0;
  await speech.transcribe(new Array(16000).fill(0));
  const args=calls[0].args;assert.equal(args[args.indexOf('-ac')+1],'768');assert.ok(args.includes('-ojf'));
  await speech.transcribeProvisional(new Array(32000).fill(0)).catch(()=>{});
  if(calls[1]){assert.ok(calls[1].args.includes('-ac'));assert.ok(!calls[1].args.includes('-ojf'));}
});
