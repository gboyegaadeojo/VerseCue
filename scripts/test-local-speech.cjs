'use strict';
// Optional integration test using an already authorized private WAV fixture.
const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');const assert=require('node:assert/strict');const {LocalSpeech}=require('../core/stt.cjs');const {Session}=require('../core/session.cjs');const {decodeReplayFixture}=require('./speech-replay-fixture.cjs');
(async()=>{
  const [executable,model,file]=process.argv.slice(2);if(!executable||!model||!file)throw new Error('Usage: node scripts/test-local-speech.cjs <trusted-whisper-cli> <model> <private-mono-16k-wav>');
  const {samples,fixture}=decodeReplayFixture(await fs.readFile(file));
  const speech=new LocalSpeech();await fs.mkdir('test-results',{recursive:true});const scratchRoot=path.resolve('test-results','local-speech-scratch-'+randomUUID());await speech.initializeScratch(scratchRoot);speech.configure(path.resolve(executable),path.resolve(model));
  const result=await speech.transcribe(samples);assert.ok(result.text.length>0);let sends=0;const session=new Session({send:async()=>{sends++;return {state:'simulated'};}});session.ingest(result.text);
  assert.deepEqual(await fs.readdir(scratchRoot),[]);assert.equal(sends,0);
  const report={at:new Date().toISOString(),passed:true,fixture,audioSeconds:samples.length/16000,elapsedMs:result.elapsedMs,transcriptNonempty:true,temporaryAudioRemoved:true,outputRequests:sends,accuracyScored:false,liveLatencyScored:false};await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/local-speech-integration.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
