'use strict';
// SYNTHETIC session only. No microphone, speech model or ProPresenter output.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','start-in-auto-'+randomUUID())],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(name,payload)=>page.evaluate(({name,payload})=>window.versecue.command(name,payload),{name,payload});
    let s=await state();assert.equal(s.mode,'auto','A new install starts in Auto');assert.equal(s.dryRun,true,'Auto starts as a simulation');assert.equal(s.connection?.armed??false,false);
    assert.match(await page.locator('#auto-status').textContent(),/SIMULATION/);
    assert.equal(await page.locator('#start-mode').inputValue(),'auto');assert.equal(await page.locator('#auto-hold-window').inputValue(),'1');
    assert.equal((await command('ingest',{text:'John 3:16'})).ok,true);s=await state();assert.equal(s.history.length,0,'Manual references never auto-send');
    assert.equal(await page.evaluate(()=>document.getElementById('hold-auto').hidden),true);
    const hold=await command('hold-auto');assert.equal(hold.ok,true);assert.equal(hold.value.held,false);
    const shown=await page.evaluate(async()=>{const st=(await window.versecue.state()).value;render({...st,autoStatus:{state:'pending',reason:'SYNTHETIC',dueAt:Date.now()+1000}});const b=document.getElementById('hold-auto');return {hidden:b.hidden,text:b.textContent};});
    assert.equal(shown.hidden,false,'A pending automatic send shows Hold');assert.match(shown.text,/^Hold - sending in \d\.\ds$/);
    assert.equal((await command('stop')).ok,true);s=await state();assert.equal(s.mode,'paused');
    assert.equal((await command('resume')).ok,true);s=await state();assert.equal(s.mode,'confirm','Resume after Emergency Stop is deliberate Confirm, not Auto');
    assert.equal((await command('reset')).ok,true);s=await state();assert.equal(s.mode,'auto','Session reset returns to the saved Auto start');
    const saved=await page.evaluate(async()=>{const st=(await window.versecue.settings()).value;return (await window.versecue.saveSettings({...st,startMode:'confirm',autoHoldMs:2000})).ok;});assert.equal(saved,true);
    s=await state();assert.notEqual(s.mode,'auto','Saving setup leaves Auto');
    assert.equal((await command('reset')).ok,true);s=await state();assert.equal(s.mode,'confirm','Confirm start preference is honored');
    const rejected=await page.evaluate(async()=>{const st=(await window.versecue.settings()).value;return (await window.versecue.saveSettings({...st,autoHoldMs:500})).ok;});assert.equal(rejected,false,'Hold window outside 0.75-3 s is rejected');
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,startsInAuto:true,startsInDryRun:true,manualNeverAutoSends:true,holdShownWhenPending:true,resumeAfterStopIsConfirm:true,resetReturnsToStartPreference:true,confirmPreferenceHonored:true,holdWindowBounded:true,actualProPresenterAccess:false,microphoneCapture:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-start-in-auto.json':'test-results/start-in-auto.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
