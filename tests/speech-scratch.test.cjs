'use strict';
// Synthetic bytes only. Each test owns its isolated scratch and witness directories.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process'),{SpeechScratch}=require('../core/speech-scratch.cjs'),{LocalSpeech}=require('../core/stt.cjs');
async function fixture(run){const parent=await fs.mkdtemp(path.join(os.tmpdir(),'versecue-scratch-test-'));try{await run(parent,path.join(parent,'scratch'));}finally{await fs.rm(parent,{recursive:true,force:true});}}
test('scratch requires initialization and removes only its exact generated WAV directory',()=>fixture(async(parent,root)=>{
 const scratch=new SpeechScratch(root);await assert.rejects(scratch.create(Buffer.from('SYNTHETIC')),/recovery/);await scratch.initialize();await fs.writeFile(path.join(root,'unrelated.txt'),'KEEP');const item=await scratch.create(Buffer.from('SYNTHETIC'));assert.equal(await fs.readFile(item.file,'utf8'),'SYNTHETIC');await scratch.remove(item.directory);assert.deepEqual(await fs.readdir(root),['unrelated.txt']);
}));
test('next startup recovers synthetic WAV left by abruptly terminated process',()=>fixture(async(parent,root)=>{
 const source=`const {SpeechScratch}=require(${JSON.stringify(path.resolve('core/speech-scratch.cjs'))});(async()=>{const s=new SpeechScratch(${JSON.stringify(root)});await s.initialize();await s.create(Buffer.from('SYNTHETIC CRASH DATA'));process.exit(23);})();`;
 const child=spawnSync(process.execPath,['-e',source],{encoding:'utf8',windowsHide:true});assert.equal(child.status,23);assert.equal((await fs.readdir(root)).length,1);await new SpeechScratch(root).initialize();assert.deepEqual(await fs.readdir(root),[]);
}));
test('cleanup rejects paths outside its scope and preserves foreign files',()=>fixture(async(parent,root)=>{
 const scratch=new SpeechScratch(root);await scratch.initialize();const witness=path.join(parent,'witness');await fs.mkdir(witness);await fs.writeFile(path.join(witness,'input.wav'),'KEEP');await assert.rejects(scratch.remove(witness),/out-of-scope/);assert.equal(await fs.readFile(path.join(witness,'input.wav'),'utf8'),'KEEP');const item=await scratch.create(Buffer.from('SYNTHETIC'));await fs.writeFile(path.join(item.directory,'foreign.txt'),'KEEP');await assert.rejects(new SpeechScratch(root).initialize(),/Unexpected file/);assert.equal(await fs.readFile(path.join(item.directory,'foreign.txt'),'utf8'),'KEEP');
}));
test('linked directories cannot redirect recovery into another folder',()=>fixture(async(parent,root)=>{
 const scratch=new SpeechScratch(root);await scratch.initialize();const target=path.join(parent,'target');await fs.mkdir(target);await fs.writeFile(path.join(target,'input.wav'),'KEEP');const link=path.join(root,'run-11111111-1111-4111-8111-111111111111');await fs.symlink(target,link,process.platform==='win32'?'junction':'dir');await assert.rejects(new SpeechScratch(root).initialize(),/linked/);assert.equal(await fs.readFile(path.join(target,'input.wav'),'utf8'),'KEEP');await fs.unlink(link);
}));
test('CLI startup failure removes its synthetic WAV and does not retain busy state',()=>fixture(async(parent,root)=>{
 const speech=new LocalSpeech();await speech.initializeScratch(root);speech.configure(path.join(parent,'missing-worker'),path.join(parent,'model'));await assert.rejects(speech.transcribe(new Array(3200).fill(0)),/could not start/);assert.equal(speech.busy,false);assert.deepEqual(await fs.readdir(root),[]);
}));
test('configured CLI cannot write audio before scratch recovery is initialized',async()=>{
 const speech=new LocalSpeech();speech.configure('missing-worker','model');await assert.rejects(speech.transcribe(new Array(3200).fill(0)),/scratch recovery/);assert.equal(speech.busy,false);assert.throws(()=>new SpeechScratch('relative'),/absolute/);
});
test('cancellation while scratch is being written cannot start a worker afterward',async()=>{
 const speech=new LocalSpeech();speech.configure('missing-worker','model');let release,removed=0;
 speech.scratch={create:()=>new Promise(resolve=>release=()=>resolve({directory:'synthetic-directory',file:'synthetic-file'})),remove:async()=>removed++};
 const request=speech.transcribe(new Array(3200).fill(0));await new Promise(resolve=>setImmediate(resolve));speech.cancel();release();await assert.rejects(request,/Recognition canceled/);assert.equal(removed,1);assert.equal(speech.child,null);
});
test('cleanup failure withholds recognized result and disables further scratch writes',async()=>{
 const speech=new LocalSpeech();speech.configure('missing-worker','model');speech.scratch={ready:true,create:async()=>({directory:'synthetic-directory',file:'synthetic-file'}),remove:async()=>{throw Error('PRIVATE PATH');}};
 await assert.rejects(speech.transcribe(new Array(3200).fill(0)),error=>/Temporary speech cleanup failed/.test(error.message)&&!error.message.includes('PRIVATE'));assert.equal(speech.scratch.ready,false);assert.equal(speech.busy,false);
});
test('successful synthetic worker result is returned only after its WAV is removed',()=>fixture(async(parent,root)=>{
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),load=require('node:module').createRequire(path.resolve('core/stt.cjs'));let fileSeen;
 const spawn=(_executable,args)=>{fileSeen=args[args.indexOf('-f')+1];const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};setImmediate(async()=>{try{assert.equal((await fs.readFile(fileSeen)).toString('ascii',0,4),'RIFF');child.stdout.emit('data',Buffer.from('SYNTHETIC REFERENCE'));child.emit('close',0);}catch(error){child.emit('error',error);}});return child;};
 const scope={require:name=>name==='node:child_process'?{spawn}:load(name),module:{exports:{}},Buffer,performance,setTimeout,clearTimeout};vm.runInNewContext(await fs.readFile('core/stt.cjs','utf8'),scope);
 const speech=new scope.module.exports.LocalSpeech();await speech.initializeScratch(root);speech.configure('synthetic-worker','synthetic-model');const result=await speech.transcribe(Array.from({length:3200},()=>0));assert.equal(result.text,'SYNTHETIC REFERENCE');assert.ok(fileSeen.startsWith(root+path.sep));assert.deepEqual(await fs.readdir(root),[]);assert.equal(speech.busy,false);
}));
