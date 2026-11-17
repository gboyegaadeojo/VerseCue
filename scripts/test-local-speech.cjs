'use strict';
// Optional integration test using an already authorized private WAV fixture.
const fs=require('node:fs/promises');const path=require('node:path');const os=require('node:os');const assert=require('node:assert/strict');const {LocalSpeech}=require('../core/stt.cjs');const {Session}=require('../core/session.cjs');
(async()=>{
  const [executable,model,file]=process.argv.slice(2);if(!executable||!model||!file)throw new Error('Usage: node scripts/test-local-speech.cjs <trusted-whisper-cli> <model> <private-mono-16k-wav>');
  const before=new Set((await fs.readdir(os.tmpdir())).filter(n=>n.startsWith('versecue-')));
  const bytes=await fs.readFile(file);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.readUInt32LE(24),16000);assert.equal(bytes.readUInt16LE(22),1);assert.equal(bytes.readUInt16LE(34),16);
  let offset=12,data=null;while(offset+8<=bytes.length){const size=bytes.readUInt32LE(offset+4);if(bytes.toString('ascii',offset,offset+4)==='data'){data=bytes.subarray(offset+8,offset+8+size);break;}offset+=8+size+(size%2);}assert.ok(data);
  const samples=[];for(let i=0;i<Math.min(data.length,192000*2);i+=2)samples.push(data.readInt16LE(i)/32768);
  const speech=new LocalSpeech();speech.configure(path.resolve(executable),path.resolve(model));
  const result=await speech.transcribe(samples);assert.ok(result.text.length>0);let sends=0;const session=new Session({send:async()=>{sends++;return {state:'simulated'};}});session.ingest(result.text);
  const after=(await fs.readdir(os.tmpdir())).filter(n=>n.startsWith('versecue-')&&!before.has(n));assert.deepEqual(after,[]);assert.equal(sends,0);
  const report={at:new Date().toISOString(),passed:true,fixture:'authorized private pilot window',audioSeconds:samples.length/16000,elapsedMs:result.elapsedMs,transcriptNonempty:true,temporaryAudioRemoved:true,outputRequests:sends,accuracyScored:false,liveLatencyScored:false};await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/local-speech-integration.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
