'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const {AudioWindowBuffer}=require('../ui/audio-buffer.js');
function setup(){
  let release,closed=0,stopped=0;const moduleReady=new Promise(resolve=>release=resolve);
  const track={label:'SYNTHETIC test input',stop(){stopped++;}};const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
  class Context{constructor(){this.audioWorklet={addModule:()=>moduleReady};}async close(){closed++;}}
  const sandbox={window:{},AudioWindowBuffer,AudioContext:Context,navigator:{mediaDevices:{getUserMedia:async()=>stream}},performance};vm.runInNewContext(fs.readFileSync('ui/audio.js','utf8'),sandbox);
  const audio=new sandbox.window.PastorAudio({onLevel:()=>{},onWindow:()=>{},onHealth:()=>{}});
  return {audio,release,counts:()=>({closed,stopped})};
}
test('stop during worklet initialization releases the late audio context and track',async()=>{
  const fixture=setup();const start=fixture.audio.start('synthetic-device',0);await new Promise(resolve=>setImmediate(resolve));await fixture.audio.stop();fixture.release();await start;assert.equal(fixture.audio.active,false);assert.equal(fixture.audio.ctx,null);assert.equal(fixture.counts().closed,1);assert.ok(fixture.counts().stopped>=1);
});
test('authorization revoked during worklet initialization cannot activate a late input',async()=>{const fixture=setup();let authorized=true;const start=fixture.audio.start('synthetic-device',0,()=>authorized);await new Promise(resolve=>setImmediate(resolve));authorized=false;fixture.release();await start;assert.equal(fixture.audio.active,false);assert.equal(fixture.counts().closed,1);assert.ok(fixture.counts().stopped>=1);});
