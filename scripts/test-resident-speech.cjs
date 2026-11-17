'use strict';
// Uses only the already authorized private diagnostic WAV; no microphone/output.
const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');const {LocalSpeech}=require('../core/stt.cjs');
(async()=>{
  const bytes=await fs.readFile('recordings/replay-private/REAL-PILOT-001-12.wav');let offset=12,pcm;
  while(offset+8<=bytes.length){const size=bytes.readUInt32LE(offset+4);if(bytes.toString('ascii',offset,offset+4)==='data'){pcm=bytes.subarray(offset+8,offset+8+size);break;}offset+=8+size+size%2;}
  assert.ok(pcm);const samples=[];for(let i=0;i<Math.min(pcm.length,384000);i+=2)samples.push(pcm.readInt16LE(i)/32768);
  const speech=new LocalSpeech();speech.configure(path.resolve('poc/private/tools/whisper-b5454/Release/whisper-cli.exe'),path.resolve('poc/private/models/ggml-base.en.bin'),'resident');
  let base;const rows=[];
  try{for(let i=0;i<2;i++){const result=await speech.transcribe(samples);assert.ok(result.text.trim());rows.push({request:i+1,elapsedMs:result.elapsedMs,transcriptNonempty:true});base=speech.resident.base;assert.ok(base?.startsWith('http://127.0.0.1:'));}}finally{speech.cancel();}
  await new Promise(resolve=>setTimeout(resolve,300));let stopped=false;try{await fetch(base+'/health',{signal:AbortSignal.timeout(500)});}catch{stopped=true;}assert.equal(stopped,true);
  const report={at:new Date().toISOString(),passed:true,provider:'resident CPU whisper.cpp',audioSeconds:samples.length/16000,rows,workerStopped:true,microphoneCapture:false,outputRequests:0,accuracyScored:false,liveLatencyScored:false};await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/resident-speech-integration.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
