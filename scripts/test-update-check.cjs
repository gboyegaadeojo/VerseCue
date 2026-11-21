'use strict';
// SYNTHETIC: no release is installed and no file dialog opens. Checks the service lock and the no-key result.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','update-check-'+randomUUID())],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await app.evaluate(({dialog})=>{globalThis.dialogOpened=0;dialog.showOpenDialog=async()=>{globalThis.dialogOpened++;return {canceled:true,filePaths:[]};};});
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    const locked=await page.evaluate(()=>window.versecue.checkUpdate());assert.equal(locked.ok,false);assert.match(locked.error,/wait until the service ends/);
    assert.equal((await page.evaluate(()=>window.versecue.endAudio())).ok,true);
    const result=await page.evaluate(()=>window.versecue.checkUpdate());assert.equal(result.ok,true);assert.equal(result.value.valid,false);assert.match(result.value.reason,/No trusted update key/);
    assert.equal(await app.evaluate(()=>globalThis.dialogOpened),0,'No file dialog opens without a trusted key');
    await page.locator('#setup').click();await page.locator('[data-settings="advanced"]').click();await page.locator('#check-update').click();
    await page.waitForFunction(()=>/^Not verified: No trusted update key/.test(document.getElementById('update-status').textContent));
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,lockedWhileListening:true,noTrustedKeyReported:true,nothingInstalled:true,microphoneCapture:false,actualProPresenterAccess:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-update-check.json':'test-results/update-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
