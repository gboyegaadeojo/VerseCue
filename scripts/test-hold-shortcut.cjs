'use strict';
// SYNTHETIC recognition in dry run. No microphone, model or ProPresenter output.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','hold-'+randomUUID())],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await app.evaluate(({app})=>{const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async()=>({text:globalThis.syntheticText??'Please show John chapter three verse sixteen',final:true,elapsedMs:10});});
    const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(name,payload)=>page.evaluate(({name,payload})=>window.versecue.command(name,payload),{name,payload});
    const emit=()=>page.evaluate(()=>window.versecue.audio(new Array(32000).fill(0),{windowId:crypto.randomUUID(),timingBasis:'capture-monotonic-proxy',windowDurationMs:2000,bufferedAgeMs:2000,speechEndAgeMs:1000,endEvidence:'silence',droppedSamples:0,clippedSamples:0}));
    const until=async(check,ms=6000)=>{const deadline=Date.now()+ms;for(;;){const s=await state();if(check(s))return s;if(Date.now()>deadline)throw Error('State timeout: '+JSON.stringify({mode:s.mode,auto:s.autoStatus,history:s.history.length}));await new Promise(r=>setTimeout(r,25));}};
    const announced=pattern=>page.waitForFunction(source=>new RegExp(source).test(document.getElementById('auto-announcer').textContent),pattern.source,{timeout:4000});
    assert.equal(await page.evaluate(async()=>{const s=(await window.versecue.settings()).value;return (await window.versecue.saveSettings({...s,autoHoldMs:3000})).ok;}),true);
    assert.equal((await command('reset')).ok,true);assert.equal((await state()).mode,'auto');
    assert.equal(await page.getAttribute('#hold-auto','aria-keyshortcuts'),'H');
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    assert.equal((await emit()).ok,true);assert.equal((await state()).autoStatus.state,'pending');
    await announced(/^Sending John 3:16 in 3 seconds\. Press H to hold\.$/);
    await page.locator('body').click({position:{x:5,y:5}});await page.keyboard.press('h');
    await until(s=>s.autoStatus?.state==='held');await announced(/^Held\./);
    await new Promise(resolve=>setTimeout(resolve,3300));assert.equal((await state()).history.length,0,'H held the send');
    await app.evaluate(()=>{globalThis.syntheticText='Please show Romans chapter eight verse twenty-eight';});assert.equal((await emit()).ok,true);await page.locator('#reference-input').focus();await page.keyboard.press('h');
    assert.equal(await page.locator('#reference-input').inputValue(),'h','Typing h in a field types, never holds');
    await until(s=>s.history.length===1);
    assert.equal((await state()).history[0].state,'simulated');await announced(/^Romans 8:28 simulated\. No ProPresenter output\.$/);
    await page.locator('#reference-input').fill('');await page.locator('body').click({position:{x:5,y:5}});await page.keyboard.press('h');assert.equal((await state()).history.length,1,'H with nothing pending does nothing');
    assert.equal((await command('stop')).ok,true);await announced(/^Auto paused\. Emergency stop is on\.$/);
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,holdShortcutFocusedOnly:true,typingNeverHolds:true,announcesPending:true,announcesHeld:true,announcesSimulated:true,announcesPause:true,microphoneCapture:false,actualProPresenterAccess:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-hold-shortcut.json':'test-results/hold-shortcut.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
