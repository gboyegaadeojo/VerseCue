'use strict';
// SYNTHETIC loss events through the real IPC handler. No microphone, model or ProPresenter output.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','audio-loss-auto-'+randomUUID())],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(name,payload)=>page.evaluate(({name,payload})=>window.versecue.command(name,payload),{name,payload});
    assert.equal((await state()).mode,'auto');
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    assert.equal((await command('audio-loss',{reason:'overflow',samples:1600})).ok,true);
    let s=await state();assert.equal(s.mode,'auto','One loss keeps Auto on');assert.match(s.autoStatus?.reason??'',/Audio was dropped/);assert.ok(s.events.some(e=>e.code==='AUDIO_LOSS_CONTEXT_RESET'));
    assert.equal((await command('audio-loss',{reason:'capture-gap',samples:800})).ok,true);assert.equal((await state()).mode,'auto','Two losses keep Auto on');
    assert.equal((await command('audio-loss',{reason:'clipping',samples:1600})).ok,true);
    s=await state();assert.equal(s.mode,'paused','Three losses within a minute pause Auto');assert.ok(s.events.some(e=>e.code==='AUTO_PAUSED_PERSISTENT_AUDIO_LOSS'));
    assert.equal((await page.evaluate(()=>window.versecue.endAudio())).ok,true);
    assert.equal((await command('reset')).ok,true);s=await state();assert.equal(s.mode,'auto','Reset returns to Auto with a fresh loss history');
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    assert.equal((await command('audio-loss',{reason:'overflow',samples:1600})).ok,true);assert.equal((await state()).mode,'auto','Losses before reset do not count');
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,singleLossKeepsAuto:true,persistentLossPausesAuto:true,resetClearsLossHistory:true,microphoneCapture:false,actualProPresenterAccess:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-audio-loss-auto.json':'test-results/audio-loss-auto.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
