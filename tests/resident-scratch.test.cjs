'use strict';
// SYNTHETIC: a fake worker process that never becomes ready. No model, audio or network beyond loopback health probes.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{EventEmitter}=require('node:events');
const childProcess=require('node:child_process');let spawnedArgs=null;
childProcess.spawn=(_exe,args)=>{spawnedArgs=args;const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>setImmediate(()=>child.emit('close',null));return child;};
const {LocalSpeech}=require('../core/stt.cjs');
const settle=()=>new Promise(resolve=>setTimeout(resolve,50));

test('the resident worker public folder is an owned scratch run folder, removed on stop',async()=>{
  const parent=await fs.mkdtemp(path.join(os.tmpdir(),'versecue-resident-test-'));
  try{
    const speech=new LocalSpeech();await speech.initializeScratch(path.join(parent,'scratch'));const root=speech.scratch.root;
    const resident=speech.resident,epoch=resident.epoch;
    await assert.rejects(resident.start('worker','model',Date.now()+150,epoch),/could not become ready/);
    const publicDir=spawnedArgs[spawnedArgs.indexOf('--public')+1];
    assert.equal(path.dirname(publicDir),root,'Folder lives under the app-owned scratch root, not the global temp folder');assert.match(path.basename(publicDir),/^run-[0-9a-f-]{36}$/);
    resident.stop();await settle();
    await assert.rejects(fs.access(publicDir),'Stop removes the folder');assert.deepEqual(await fs.readdir(root),[]);
  }finally{await fs.rm(parent,{recursive:true,force:true});}
});
test('a resident folder left by a crash is removed at the next startup',async()=>{
  const parent=await fs.mkdtemp(path.join(os.tmpdir(),'versecue-resident-test-'));
  try{
    const first=new LocalSpeech();await first.initializeScratch(path.join(parent,'scratch'));const leftover=await first.scratch.createDirectory();
    const next=new LocalSpeech();await next.initializeScratch(path.join(parent,'scratch'));
    await assert.rejects(fs.access(leftover));assert.deepEqual(await fs.readdir(next.scratch.root),[]);
  }finally{await fs.rm(parent,{recursive:true,force:true});}
});
test('scratch folders cannot be created before recovery finishes',async()=>{
  const {SpeechScratch}=require('../core/speech-scratch.cjs');const scratch=new SpeechScratch(path.join(os.tmpdir(),'versecue-never-initialized'));
  await assert.rejects(scratch.createDirectory(),/recovery must finish/);
});
