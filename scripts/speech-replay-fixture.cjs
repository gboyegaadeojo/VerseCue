'use strict';
// Diagnostic replay only. Never represents a microphone clock or audible-end measurement.
const {createHash}=require('node:crypto');
const rate=16000,minSamples=3200,maxSamples=160000;
function decodeReplayFixture(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<44||bytes.length>4*1024*1024)throw Error('Use a bounded PCM WAV replay fixture');
 if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE'||bytes.readUInt32LE(4)!==bytes.length-8)throw Error('Replay fixture RIFF/WAVE length is invalid');
 let format=false,pcm=null,offset=12;
 while(offset<bytes.length){
  if(offset+8>bytes.length)throw Error('Replay fixture chunk header is truncated');
  const name=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),start=offset+8,end=start+size,next=end+size%2;
  if(end>bytes.length||next>bytes.length)throw Error('Replay fixture chunk data is truncated');
  if(name==='fmt '){
   if(format||size<16||bytes.readUInt16LE(start)!==1||bytes.readUInt16LE(start+2)!==1||bytes.readUInt32LE(start+4)!==rate||bytes.readUInt32LE(start+8)!==rate*2||bytes.readUInt16LE(start+12)!==2||bytes.readUInt16LE(start+14)!==16)throw Error('Replay requires PCM16 mono at 16000 Hz');
   format=true;
  }else if(name==='data'){
   if(pcm!==null||size%2!==0)throw Error('Replay fixture needs one complete PCM data chunk');
   pcm=bytes.subarray(start,end);
  }
  offset=next;
 }
 if(!format||pcm===null||pcm.length/2<minSamples)throw Error('Replay fixture has no usable audio window');
 const sourceSamples=pcm.length/2,processedSamples=Math.min(sourceSamples,maxSamples),processed=pcm.subarray(0,processedSamples*2),samples=Array.from({length:processedSamples},(_,i)=>processed.readInt16LE(i*2)/32768);
 return {samples,fixture:{format:'PCM16 mono 16000 Hz',sourceSamples,processedSamples,sourceSeconds:sourceSamples/rate,processedSeconds:processedSamples/rate,truncated:sourceSamples>processedSamples,selection:'First at most ten seconds; later samples are not processed',sourceWavSha256:createHash('sha256').update(bytes).digest('hex'),processedPcmSha256:createHash('sha256').update(processed).digest('hex'),timingBasis:'untimed-file-replay',audibleEndMeasured:false}};
}
module.exports={decodeReplayFixture};
