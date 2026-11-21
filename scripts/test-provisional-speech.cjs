'use strict';
// SYNTHETIC provisional worker replies only. No microphone, model or ProPresenter access.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','provisional-speech-'+randomUUID())],env});
  try{
    const primary=await app.firstWindow(),errors=[];primary.on('pageerror',error=>errors.push(error.message));await primary.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const opened=app.waitForEvent('window');assert.equal((await primary.evaluate(()=>window.versecue.compact())).ok,true);const compact=await opened;
    await compact.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const state=async()=>(await primary.evaluate(()=>window.versecue.state())).value;
    await app.evaluate(({app})=>{
      const path=process.mainModule.require('node:path'),{LocalSpeech}=process.mainModule.require(path.join(app.getAppPath(),'core/stt.cjs'));
      globalThis.provisionalCalls=0;globalThis.provisionalHold=null;
      LocalSpeech.prototype.transcribeProvisional=async function(){globalThis.provisionalCalls++;if(globalThis.provisionalHold)await new Promise(resolve=>{globalThis.provisionalHold=resolve;});return {text:'turn to Romans 8:28',final:false,elapsedMs:5};};
    });
    assert.equal(await primary.locator('#provisional-consent').isChecked(),false,'Provisional preview must start off');
    assert.equal(await primary.evaluate(()=>provisionalAllowed()),false);
    const unowned=await primary.evaluate(()=>window.versecue.audioProvisional(new Array(32000).fill(0)));
    assert.equal(unowned.ok,false);assert.match(unowned.error,/does not own/);
    assert.equal((await primary.evaluate(()=>window.versecue.command('ingest',{text:'John 3:16'}))).ok,true);
    await primary.waitForFunction(()=>document.getElementById('reference').textContent==='John 3:16');
    const before=await state();assert.equal(before.queue.length,1);
    assert.equal((await primary.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    const reply=await primary.evaluate(()=>window.versecue.audioProvisional(new Array(32000).fill(0)));
    assert.equal(reply.ok,true);assert.equal(reply.value.final,false);assert.equal(reply.value.text,'turn to Romans 8:28');
    const after=await state();
    assert.equal(after.queue.length,1,'Provisional text must not create or remove candidates');
    assert.equal(JSON.stringify(after.queue).includes('Romans'),false);
    assert.equal(after.latest?.id,before.latest?.id,'Existing review candidate survives provisional speech');
    assert.equal(after.history.length,before.history.length);
    assert.deepEqual(after.speechStabilization??null,before.speechStabilization??null,'Provisional text does not touch citation stabilization');
    const other=await compact.evaluate(()=>window.versecue.audioProvisional(new Array(32000).fill(0)));
    assert.equal(other.ok,false);assert.match(other.error,/does not own/);
    // Opt-in gate in the renderer: an unchecked box shows nothing even when a worker replies.
    await primary.evaluate(()=>audio.buffer.onProvisional(new Array(32000).fill(0),{}));
    assert.equal(await primary.locator('#provisional-speech').isHidden(),true);
    await primary.locator('#provisional-consent').check();
    assert.equal(await primary.evaluate(()=>provisionalAllowed()),true);
    await primary.evaluate(()=>audio.buffer.onProvisional(new Array(32000).fill(0),{}));
    assert.equal(await primary.locator('#provisional-speech').textContent(),'Provisional speech: turn to Romans 8:28');
    assert.equal(await primary.locator('#transcript').textContent(),'No audio has been processed.','Provisional text is not a completed window');
    // A completed window starting first makes a late provisional reply obsolete.
    await app.evaluate(()=>{globalThis.provisionalHold=true;});
    await primary.evaluate(()=>{window.lateProvisional=audio.buffer.onProvisional(new Array(32000).fill(0),{});});
    const deadline=Date.now()+5000;while(await app.evaluate(()=>typeof globalThis.provisionalHold!=='function')){if(Date.now()>deadline)throw Error('Synthetic provisional request did not arrive');await new Promise(resolve=>setTimeout(resolve,20));}
    await primary.evaluate(()=>{provisionalToken++;showProvisionalSpeech('');});
    await app.evaluate(()=>{const release=globalThis.provisionalHold;globalThis.provisionalHold=null;release();});await primary.evaluate(()=>window.lateProvisional);
    assert.equal(await primary.locator('#provisional-speech').isHidden(),true,'Late provisional reply must not reappear after a completed window');
    // Unchecking hides preview immediately.
    await primary.evaluate(()=>audio.buffer.onProvisional(new Array(32000).fill(0),{}));assert.equal(await primary.locator('#provisional-speech').isHidden(),false);
    await primary.locator('#provisional-consent').uncheck();assert.equal(await primary.locator('#provisional-speech').isHidden(),true);
    assert.equal((await primary.evaluate(()=>window.versecue.command('mode','paused'))).ok,true);
    const paused=await primary.evaluate(()=>window.versecue.audioProvisional(new Array(32000).fill(0)));
    assert.equal(paused.ok,false);assert.match(paused.error,/paused|does not own/i,'Pausing revokes capture authority before provisional work');
    assert.equal((await primary.evaluate(()=>window.versecue.endAudio())).ok,true);
    const ended=await primary.evaluate(()=>window.versecue.audioProvisional(new Array(32000).fill(0)));assert.equal(ended.ok,false);
    await primary.locator('#provisional-consent').check();
    assert.equal((await compact.evaluate(()=>window.versecue.command('reset'))).ok,true);
    await primary.waitForFunction(()=>!document.getElementById('provisional-consent').checked);
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,defaultOff:true,optInRequired:true,nonOwnerRejected:true,pausedRejected:true,stoppedCaptureRejected:true,candidateQueueUnchanged:true,stabilizationUnchanged:true,lateReplyDiscarded:true,resetClearsOptIn:true,syntheticWorkerReplies:(await app.evaluate(()=>globalThis.provisionalCalls)),actualProPresenterAccess:false,microphoneCapture:false,speechModel:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-provisional-speech.json':'test-results/provisional-speech.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
