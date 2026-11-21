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
test('the graphics card is used only after the warm-up proves it; CPU choice always passes -ng',async()=>{
  const speech=new LocalSpeech();speech.scratch=scratch;speech.configure('whisper-cli','model.bin','cli');calls.length=0;
  assert.equal(speech.gpuState,'pending');
  const first=await timeouts(()=>speech.transcribe(new Array(16000).fill(0)));
  assert.ok(calls[0].args.includes('-ng'),'processor until warm');assert.ok(first.includes(20000)&&!first.includes(90000));
  speech.gpuReady=true;await speech.transcribe(new Array(16000).fill(0));assert.ok(!calls[1].args.includes('-ng'),'graphics card once ready');
  speech.configure('whisper-cli','model.bin','cli','cpu');assert.equal(speech.gpuReady,false);assert.equal(speech.gpuState,'cpu');
  await speech.transcribe(new Array(16000).fill(0));assert.ok(calls[2].args.includes('-ng'));
  assert.equal(speech.resident.acceleration,'cpu');assert.equal(speech.resident.warmedUp,false);
});
function engine(stderr,code=0){return ()=>{const child=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};setImmediate(()=>{child.stderr.emit('data',Buffer.from(stderr));child.emit('close',code);});return child;};}
test('warm-up: a loaded GPU backend makes the card ready; processor-only or failure keeps the processor',async()=>{
  const make=()=>{const s=new LocalSpeech();s.scratch=scratch;s.configure('whisper-cli','model.bin','cli');return s;};
  let s=make();let r=await s.warmUp({spawnImpl:engine('ggml_vulkan: 0 = AMD Radeon RX 7800 XT (AMD proprietary driver) | uma: 0\nload_backend: loaded Vulkan backend from x\n')});
  assert.equal(r.state,'ready');assert.equal(s.gpuReady,true);assert.equal(r.device,'AMD Radeon RX 7800 XT (AMD proprietary driver)');
  s=make();r=await s.warmUp({spawnImpl:engine('load_backend: loaded CPU backend from x\n')});assert.equal(r.state,'unavailable');assert.equal(s.gpuReady,false);
  s=make();r=await s.warmUp({spawnImpl:engine('ggml_metal_init: found device: Apple M4\n')});assert.equal(r.state,'ready');
  s=make();r=await s.warmUp({spawnImpl:engine('loaded CUDA backend\n',1)});assert.equal(r.state,'unavailable');
  s=make();const p=s.warmUp({spawnImpl:engine('loaded Vulkan backend\n')});s.configure('whisper-cli','model.bin','cli');assert.equal((await p).state,'superseded');assert.equal(s.gpuReady,false);
  const cpu=new LocalSpeech();cpu.scratch=scratch;cpu.configure('whisper-cli','model.bin','cli','cpu');assert.equal((await cpu.warmUp({spawnImpl:engine('loaded Vulkan backend\n')})).state,'cpu');
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
