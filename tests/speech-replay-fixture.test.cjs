'use strict';
// SYNTHETIC PCM only; no private recording, model, microphone or output.
const test=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {decodeReplayFixture}=require('../scripts/speech-replay-fixture.cjs'),{wav}=require('../core/stt.cjs');
function audio(count=3200){const bytes=Buffer.alloc(44+count*2);wav(Array(3200).fill(0)).copy(bytes,0,0,44);bytes.writeUInt32LE(bytes.length-8,4);bytes.writeUInt32LE(count*2,40);return bytes;}
function chunks(...parts){const bytes=Buffer.concat([Buffer.from('RIFF\0\0\0\0WAVE','binary'),...parts]);bytes.writeUInt32LE(bytes.length-8,4);return bytes;}
function chunk(name,data){const bytes=Buffer.alloc(8+data.length+data.length%2);bytes.write(name,0,4,'ascii');bytes.writeUInt32LE(data.length,4);data.copy(bytes,8);return bytes;}
test('synthetic PCM decoding preserves signed extrema and fits the current runtime window',()=>{
 const bytes=audio();bytes.writeInt16LE(-32768,44);bytes.writeInt16LE(32767,46);const result=decodeReplayFixture(bytes);assert.equal(result.samples[0],-1);assert.equal(result.samples[1],32767/32768);assert.equal(result.fixture.truncated,false);assert.equal(result.fixture.processedSeconds,.2);assert.equal(result.fixture.audibleEndMeasured,false);assert.equal(result.fixture.timingBasis,'untimed-file-replay');assert.doesNotThrow(()=>wav(result.samples));
});
test('twelve-second replay is explicitly bounded to ten seconds with separate source/window provenance',()=>{
 const bytes=audio(192000);bytes.writeInt16LE(1234,44+159999*2);bytes.writeInt16LE(-1234,44+160000*2);const {samples,fixture}=decodeReplayFixture(bytes);assert.equal(samples.length,160000);assert.equal(samples.at(-1),1234/32768);assert.equal(fixture.sourceSeconds,12);assert.equal(fixture.processedSeconds,10);assert.equal(fixture.truncated,true);assert.equal(fixture.sourceWavSha256,createHash('sha256').update(bytes).digest('hex'));assert.equal(fixture.processedPcmSha256,createHash('sha256').update(bytes.subarray(44,44+320000)).digest('hex'));assert.doesNotThrow(()=>wav(samples));assert.throws(()=>wav(Array(160001).fill(0)),/Invalid audio/);
});
test('chunk traversal handles padded metadata and nonstandard data placement',()=>{
 const b=audio(16000),bytes=chunks(chunk('JUNK',Buffer.from([1,2,3])),chunk('data',b.subarray(44)),chunk('fmt ',b.subarray(20,36)));assert.equal(decodeReplayFixture(bytes).samples.length,16000);
});
test('wrong channel/rate/encoding/byte-rate/block-alignment/bit-depth is refused',()=>{
 for(const [offset,value,wide]of [[20,3,false],[22,2,false],[24,48000,true],[28,64000,true],[32,4,false],[34,8,false]]){const b=audio();if(wide)b.writeUInt32LE(value,offset);else b.writeUInt16LE(value,offset);assert.throws(()=>decodeReplayFixture(b),/PCM16 mono/);}
});
test('malformed RIFF and truncated chunk boundaries fail before any sample is used',()=>{
 for(const bytes of [null,new Uint8Array(44),Buffer.alloc(0),Buffer.alloc(4*1024*1024+1)])assert.throws(()=>decodeReplayFixture(bytes),/bounded PCM/);
 for(const offset of [0,8]){const b=audio();b.write('NOPE',offset);assert.throws(()=>decodeReplayFixture(b),/RIFF\/WAVE/);}
 const length=audio();length.writeUInt32LE(length.length,4);assert.throws(()=>decodeReplayFixture(length),/length/);
 const tail=Buffer.concat([audio(),Buffer.from([0])]);tail.writeUInt32LE(tail.length-8,4);assert.throws(()=>decodeReplayFixture(tail),/header is truncated/);
 const size=audio();size.writeUInt32LE(size.length,40);assert.throws(()=>decodeReplayFixture(size),/data is truncated/);
 const b=audio(),missingPad=chunks(chunk('fmt ',b.subarray(20,36)),chunk('data',b.subarray(44)),Buffer.from('JUNK\x01\0\0\0x','binary'));assert.throws(()=>decodeReplayFixture(missingPad),/data is truncated/);
});
test('duplicate format/data chunks, incomplete samples and short/missing audio are refused',()=>{
 const b=audio(),fmt=chunk('fmt ',b.subarray(20,36)),data=chunk('data',b.subarray(44));for(const bytes of [chunks(fmt,fmt,data),chunks(fmt,data,data)])assert.throws(()=>decodeReplayFixture(bytes),/PCM16|one complete/);
 assert.throws(()=>decodeReplayFixture(chunks(fmt,chunk('data',Buffer.alloc(6401)))),/complete PCM/);assert.throws(()=>decodeReplayFixture(audio(3199)),/usable audio/);assert.throws(()=>decodeReplayFixture(chunks(chunk('JUNK',Buffer.alloc(6400)))),/usable audio/);
});
