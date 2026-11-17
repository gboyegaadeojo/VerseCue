// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Existing authorized private windows only; no microphone or output control.
'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const {createHash}=require('node:crypto');const {LocalSpeech}=require('../core/stt.cjs');
(async()=>{
  const sha=b=>createHash('sha256').update(b).digest('hex');
  const models=[['base.en','a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002'],['tiny.en','921e4cf8686fdd993dcd081a5da5b6c365bfde1162e72b08d75ac75289920b1f']];
  for(const [name,digest] of models)if(sha(await fs.readFile(`poc/private/models/ggml-${name}.bin`))!==digest)throw new Error('Pinned model digest mismatch');
  if(sha(await fs.readFile('poc/private/tools/whisper-bin-x64.zip'))!=='6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb')throw new Error('Pinned archive digest mismatch');
  const rows=[],started=new Date().toISOString();await fs.mkdir('recordings/model-comparison-private',{recursive:true});
  for(const [model] of models){const speech=new LocalSpeech();speech.configure(path.resolve('poc/private/tools/whisper-b5454/Release/whisper-cli.exe'),path.resolve(`poc/private/models/ggml-${model}.bin`),'resident');
    try{for(const id of ['REAL-PILOT-001-6','REAL-PILOT-001-12','REAL-PILOT-002-12','REAL-PILOT-004-14']){
      const b=await fs.readFile(`recordings/replay-private/${id}.wav`);let offset=12,pcm;while(offset+8<=b.length){const size=b.readUInt32LE(offset+4);if(b.toString('ascii',offset,offset+4)==='data'){pcm=b.subarray(offset+8,offset+8+size);break;}offset+=8+size+size%2;}if(!pcm)throw new Error('Missing private PCM fixture');
      const samples=[];for(let i=0;i<Math.min(pcm.length,384000);i+=2)samples.push(pcm.readInt16LE(i)/32768);const result=await speech.transcribe(samples);await fs.writeFile(`recordings/model-comparison-private/${id}.${model}.private.txt`,result.text);
      const row={model,id,audioSeconds:samples.length/16000,elapsedMs:result.elapsedMs,includesStartup:rows.filter(r=>r.model===model).length===0,transcriptNonempty:!!result.text.trim(),transcriptSha256:sha(result.text),accuracyScored:false,liveLatencyScored:false};rows.push(row);console.log(JSON.stringify(row));
    }}finally{speech.cancel();}
  }
  await fs.writeFile('docs/evidence/model-size-comparison.json',JSON.stringify({started,finished:new Date().toISOString(),provider:'resident CPU whisper.cpp b5454',threads:4,beamSize:1,rows,outputRequests:0,microphoneCapture:false,defaultModelChanged:false,limitations:['No independent gold labels','Uncontrolled shared-host load','Cold first request and subsequent warm requests','Fixture decode duration is not audible-end output latency']},null,2)+'\n');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
