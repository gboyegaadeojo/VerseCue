'use strict';
const {_electron}=require('playwright');const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');const assert=require('node:assert/strict');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const profile=path.resolve('test-results','renderer-recovery-'+randomUUID());await fs.mkdir(profile,{recursive:true});
  const electron=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${profile}`],env});
  try{
    const page=await electron.firstWindow();await page.waitForFunction(()=>document.querySelector('#message').textContent.length>0);const id=(await page.evaluate(()=>window.versecue.identity())).value.id;
    const start=async()=>{assert.equal((await page.evaluate(()=>window.versecue.command('resume'))).ok,true);assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);assert.equal((await page.evaluate(()=>window.versecue.startPrivateApi({allowPreparedSend:false}))).ok,true);};
    const verify=async()=>{const state=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(state.capture.active,false);assert.equal(state.mode,'paused');assert.equal(state.dryRun,true);assert.equal(state.history.length,0);assert.equal((await page.evaluate(()=>window.versecue.privateApiStatus())).value.enabled,false);};
    await start();await electron.evaluate(({webContents},id)=>webContents.fromId(id).emit('render-process-gone',{}, {reason:'crashed',exitCode:1}),id);await verify();
    await start();await page.reload();await page.waitForFunction(()=>document.querySelector('#message').textContent.length>0);await verify();
    const compactPromise=electron.waitForEvent('window');await page.locator('#compact').click();const compact=await compactPromise;await compact.waitForFunction(()=>document.querySelector('#message').textContent.length>0);
    assert.equal((await page.evaluate(()=>window.versecue.command('resume'))).ok,true);assert.equal((await compact.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);assert.equal((await page.evaluate(()=>window.versecue.startPrivateApi({allowPreparedSend:false}))).ok,true);await compact.close();await page.waitForFunction(async()=>!(await window.versecue.state()).value.capture.active);await verify();
    const report={at:new Date().toISOString(),passed:true,packaged:!!executable,version:await electron.evaluate(({app})=>app.getVersion()),simulatedRendererGoneEvent:true,actualRendererCrash:false,actualReload:true,actualOwnerWindowClose:true,pausedDisarmedCaptureRevokedApiRevoked:true,microphoneCapture:false,outputRequests:0};await fs.writeFile(executable?'test-results/packaged-renderer-recovery.json':'test-results/source-renderer-recovery.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }finally{await electron.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
