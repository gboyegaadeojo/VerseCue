'use strict';
// SYNTHETIC tracks only: no microphone, OS permission or actual interface test.
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function fixture({settings={},capabilities={},pending=false}={}){
 let stops=0,requests=0,contexts=0,release;const reports=[];
 const track={label:'Synthetic',getSettings:()=>settings,getCapabilities:()=>capabilities,stop:()=>stops++};const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
 class Buffer{start(){}stop(){}}
 class Context{constructor(){contexts++;this.audioWorklet={addModule:async()=>{}};}createMediaStreamSource(){return {connect(){}};}createGain(){return {gain:{},connect(){}};}async close(){}}
 class Worklet{constructor(){this.port={};}connect(){}disconnect(){}}
 const scope={window:{},navigator:{mediaDevices:{getUserMedia:async()=>{requests++;return pending?new Promise(resolve=>release=()=>resolve(stream)):stream;}}},AudioWindowBuffer:Buffer,AudioContext:Context,AudioWorkletNode:Worklet};
 vm.runInNewContext(fs.readFileSync('ui/audio.js','utf8'),scope);const Type=scope.window.PastorAudio;
 const audio=new Type({onLevel(){},onWindow(){},onHealth(){},onInputInfo:info=>reports.push(info)});
 return {Type,audio,track,reports,release:()=>release(),counts:()=>({stops,requests,contexts})};
}
test('reported input values and capability ranges contain no device identifiers',async()=>{
 const f=fixture({settings:{channelCount:2,sampleRate:48000,sampleSize:24,deviceId:'private-device'},capabilities:{channelCount:{min:1,max:2},sampleRate:{min:16000,max:48000},sampleSize:{min:16,max:24},deviceId:'private-device'}});
 await f.audio.start('private-device',1);const info=f.reports.at(-1);assert.equal(info.channel,2);assert.equal(info.sampleRate,48000);assert.equal(info.channels.max,2);assert.ok(!JSON.stringify(info).includes('private-device'));await f.audio.stop();assert.equal(f.reports.at(-1),null);
});
test('unavailable reported channel stops returned tracks before any audio context',async()=>{
 const f=fixture({settings:{channelCount:2}});await assert.rejects(f.audio.start('chosen',3),/channel 4 is unavailable/);assert.deepEqual(f.counts(),{stops:1,requests:1,contexts:0});assert.equal(f.audio.active,false);assert.equal(f.reports.at(-1),null);
});
test('device identity mismatch stops capture without silently substituting an input',async()=>{
 const f=fixture({settings:{deviceId:'different'}});await assert.rejects(f.audio.start('chosen',0),/does not match/);assert.equal(f.counts().contexts,0);assert.equal(f.counts().stops,1);assert.equal(f.reports.filter(Boolean).length,0);
});
test('invalid channels reject before microphone permission is requested',async()=>{
 for(const channel of [-1,8,1.5,NaN,Infinity,'0']){const f=fixture();await assert.rejects(f.audio.start('chosen',channel),/1 to 8/);assert.equal(f.counts().requests,0);}
});
test('unsupported and malformed metadata stays unknown without claiming hardware capabilities',async()=>{
 const f=fixture({settings:{channelCount:NaN,sampleRate:'48000',sampleSize:-1},capabilities:{channelCount:{min:4,max:2},sampleRate:{min:0,max:48000}}});await f.audio.start('chosen',0);const info=f.reports.at(-1);for(const key of ['channelCount','sampleRate','sampleSize','channels','rates','sizes'])assert.equal(info[key],null);
 f.track.getSettings=()=>{throw Error('unavailable');};f.track.getCapabilities=()=>{throw Error('unavailable');};assert.equal(f.Type.inputInformation(f.track,0).sampleRate,null);await f.audio.stop();
});
test('cancellation during permission request cannot publish stale input information',async()=>{
 const f=fixture({pending:true,settings:{channelCount:2}}),start=f.audio.start('chosen',0);await new Promise(resolve=>setImmediate(resolve));await f.audio.stop();f.release();await start;assert.equal(f.reports.filter(Boolean).length,0);assert.equal(f.counts().contexts,0);assert.equal(f.counts().stops,1);
});
test('input failures provide platform guidance without changing system permissions',()=>{
 const {Type}=fixture();assert.match(Type.inputError({name:'NotAllowedError'},'Win32'),/desktop app access/);assert.match(Type.inputError({name:'NotAllowedError'},'MacIntel'),/System Settings/);assert.match(Type.inputError({name:'NotAllowedError'},'unknown'),/system settings/);assert.match(Type.inputError({name:'OverconstrainedError'}),/no other input/);assert.match(Type.inputError({name:'NotReadableError'}),/another application/);
});
