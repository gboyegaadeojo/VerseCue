'use strict';
// SYNTHETIC session only. Checks NR-011 pre-ticked boxes; no microphone or ProPresenter output.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','consents-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const ticks=()=>page.evaluate(()=>['audio-consent','native-preparation-consent','native-save-consent','test-target'].map(id=>document.getElementById(id).checked));
    assert.deepEqual(await ticks(),[true,true,true,false],'Authorization and preparation start ticked; output arming does not');
    assert.equal((await page.evaluate(()=>window.versecue.state())).value.dryRun,true,'Still starts in dry run');
    assert.equal((await page.evaluate(()=>window.versecue.command('reset'))).ok,true);await page.waitForFunction(()=>document.getElementById('audio-consent').checked);
    assert.deepEqual(await ticks(),[true,true,true,false],'Reset keeps the default ticks');
    await page.evaluate(()=>{document.getElementById('audio-consent').checked=false;});assert.equal((await ticks())[0],false,'The operator can untick for a session');
    assert.equal(await page.evaluate(async()=>{const s=(await window.versecue.settings()).value;const r=await window.versecue.saveSettings({...s,preTickConsents:false});fillSettings((await window.versecue.settings()).value);return r.ok;}),true);
    assert.equal((await page.evaluate(()=>window.versecue.command('reset'))).ok,true);await new Promise(r=>setTimeout(r,300));
    assert.equal((await ticks())[0],false,'With the option off, reset leaves the audio authorization unticked');
    console.log(JSON.stringify({passed:true,packaged:!!executable,consentsStartTicked:true,armingNotTicked:true,resetKeepsDefaults:true,optOutRespected:true,actualProPresenterAccess:false,microphoneCapture:false}));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
