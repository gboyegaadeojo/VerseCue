'use strict';
// SYNTHETIC browser tracks and input failures; never requests an OS microphone.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;let app;
try{
 app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','audio-input-'+randomUUID())],env});
 const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
 await page.evaluate(()=>{document.getElementById('settings-dialog').showModal();document.querySelector('[data-settings="audio"]').click();});
 await page.evaluate(async()=>{
  const track={label:'SYNTHETIC input',stop(){},getSettings:()=>({deviceId:'synthetic-private-id',channelCount:2,sampleRate:48000,sampleSize:24}),getCapabilities:()=>({channelCount:{min:1,max:2}})};
  Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>({getTracks:()=>[track],getAudioTracks:()=>[track]})});
  window.AudioContext=class{constructor(){this.audioWorklet={addModule:async()=>{}};}createMediaStreamSource(){return {connect(){}};}createGain(){return {gain:{},connect(){}};}async close(){}};
  window.AudioWorkletNode=class{constructor(){this.port={};}connect(){}disconnect(){}};
  await audio.start('synthetic-private-id',1);
 });
 const info=page.locator('#audio-input-info');await info.waitFor();assert.match(await info.textContent(),/Selected channel 2.*2 channels.*48000 Hz.*24 bit/);assert.ok(!(await info.textContent()).includes('synthetic-private-id'));
 await page.locator('#audio-channel').fill('1');await page.locator('#audio-channel').dispatchEvent('change');assert.match(await info.textContent(),/Start the saved input/);
 await page.evaluate(async()=>{await audio.stop();try{await audio.start('synthetic-private-id',3);}catch(error){document.getElementById('setup-message').textContent=error.message;}});assert.match(await page.locator('#setup-message').textContent(),/channel 4 is unavailable/);assert.match(await info.textContent(),/Start the saved input/);
 await page.evaluate(()=>{Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:async()=>{throw Object.assign(new Error('synthetic denied'),{name:'NotAllowedError'});}});});await page.locator('#refresh-devices').click();await page.waitForFunction(()=>document.getElementById('setup-message').textContent.includes('Microphone access was denied'));assert.match(await page.locator('#setup-message').textContent(),/explicitly start/);
 for(const width of [1280,900,640]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>{const e=document.getElementById('audio-input-info');return e.scrollWidth>e.clientWidth+1;}),false);}
 assert.deepEqual(errors,[]);await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/'+(executable?'packaged-':'')+'audio-input-information-ui.json',JSON.stringify({passed:true,synthetic:true,realMicrophone:false,realProPresenter:false,errors},null,2));
}finally{await app?.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
