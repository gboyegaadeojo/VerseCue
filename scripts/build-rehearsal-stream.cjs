'use strict';
// Builds a PRIVATE rehearsal stream from an authorized local recording. Output stays in ignored test-results.
// Windows follow the app's AudioWindowBuffer rules in simulated real time; text comes from the real local worker.
// Labels are left empty: they must come from independent listening, never from this output.
const fs=require('node:fs/promises'),path=require('node:path');
const {LocalSpeech}=require('../core/stt.cjs');const {AudioWindowBuffer}=require('../ui/audio-buffer.js');
function readWav(bytes){
  if(bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw Error('Expected a RIFF/WAVE file');
  let offset=12,format=null,data=null;
  while(offset+8<=bytes.length){const id=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),body=offset+8;if(body+size>bytes.length)throw Error('Truncated WAV chunk');if(id==='fmt ')format={code:bytes.readUInt16LE(body),channels:bytes.readUInt16LE(body+2),rate:bytes.readUInt32LE(body+4),bits:bytes.readUInt16LE(body+14)};if(id==='data')data={start:body,size};offset=body+size+(size%2);}
  if(!format||!data||format.code!==1||format.channels!==1||format.rate!==16000||format.bits!==16)throw Error('Expected PCM16 mono 16 kHz audio');
  const count=Math.floor(data.size/2),samples=new Float32Array(count);for(let i=0;i<count;i++)samples[i]=bytes.readInt16LE(data.start+i*2)/32768;return samples;
}
(async()=>{
  const [executable,model,wavPath,recordingId,outName]=process.argv.slice(2);
  if(!executable||!model||!wavPath||!/^[A-Za-z0-9._-]{1,80}$/.test(recordingId??'')||!/^[A-Za-z0-9._-]{1,80}\.json$/.test(outName??''))throw Error('Usage: node scripts/build-rehearsal-stream.cjs <whisper-cli> <model> <pcm16-mono-16k.wav> <recordingId> <name.json>');
  const outDir=path.resolve('test-results','auto-rehearsal','streams');await fs.mkdir(outDir,{recursive:true});const outFile=path.join(outDir,outName);
  try{await fs.access(outFile);throw Error('Refusing to overwrite an existing stream');}catch(error){if(error.code!=='ENOENT')throw error;}
  const samples=readWav(await fs.readFile(wavPath));
  const speech=new LocalSpeech();await speech.initializeScratch(path.resolve('test-results','auto-rehearsal','scratch'));speech.configure(path.resolve(executable),path.resolve(model),'cli');
  let clock=0,dropped=0,current=null;const windows=[];
  const buffer=new AudioWindowBuffer({clock:()=>clock,onDrop:drop=>{dropped+=drop.samples;},onWindow:(window,meta)=>{const dispatchAt=clock;const job=speech.transcribe(Array.from(window,v=>Math.max(-1,Math.min(1,v)))).then(r=>{windows.push({endSeconds:dispatchAt/1000,durationSeconds:window.length/16000,text:r.text,endEvidence:meta.endEvidence,elapsedMs:r.elapsedMs,droppedSamples:dropped});return r.elapsedMs;},()=>{windows.push({endSeconds:dispatchAt/1000,durationSeconds:window.length/16000,text:'',endEvidence:meta.endEvidence,elapsedMs:20000,droppedSamples:dropped});return 20000;});return new Promise(release=>{current={job,dispatchAt,release};});}});
  buffer.start();
  for(let i=0;i<samples.length;i+=1600){
    const packet=Array.from(samples.subarray(i,i+1600));clock+=packet.length/16;const rms=Math.sqrt(packet.reduce((t,v)=>t+v*v,0)/packet.length);buffer.push(packet,rms);
    await new Promise(r=>setImmediate(r)); // let the buffer dispatch, as the renderer's event loop does between worklet messages
    if(current){const elapsed=await current.job;if(clock>=current.dispatchAt+elapsed){const done=current;current=null;done.release();await new Promise(r=>setImmediate(r));}}
    if(i%(1600*600)===0)process.stdout.write(`processed ${(i/16000/60).toFixed(0)} min\n`);
  }
  if(current){await current.job;current.release();}
  buffer.stop();
  const stream={schemaVersion:1,recordingId,source:'REAL-RECORDING',split:'held-out',durationSeconds:samples.length/16000,dataUseAuthorized:false,labelsReviewed:false,windows:windows.sort((a,b)=>a.endSeconds-b.endSeconds),labels:[]};
  await fs.writeFile(outFile,JSON.stringify(stream),{flag:'wx'});
  console.log(JSON.stringify({written:true,windows:windows.length,durationSeconds:stream.durationSeconds,droppedSamples:dropped,labels:0,next:'Add independently reviewed labels, set dataUseAuthorized and labelsReviewed, then run run-auto-rehearsal.cjs'}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
