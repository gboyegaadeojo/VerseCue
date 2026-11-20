'use strict';
// Isolated synthetic connector. No microphone, network target or ProPresenter.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','reset-receipt-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await app.evaluate(({app})=>{const path=process.mainModule.require('node:path'),{Connector}=process.mainModule.require(path.join(app.getAppPath(),'core/connector.cjs'));globalThis.resetAccepted=0;Connector.prototype.send=async(_candidate,{guard})=>{if(!guard())throw Error('Synthetic preflight canceled');globalThis.resetAccepted++;return new Promise((resolve,reject)=>globalThis.resetTransport={resolve,reject});};});
    for(const outcome of ['readback-matched','uncertain','error']){
      await app.evaluate(()=>globalThis.resetTransport=null);
      assert.equal((await page.evaluate(()=>window.versecue.command('ingest',{text:'John 3:16'}))).ok,true);await page.waitForFunction(()=>document.getElementById('reference').textContent==='John 3:16');await page.locator('#show').click();
      const deadline=Date.now()+5000;while(!await app.evaluate(()=>!!globalThis.resetTransport)){if(Date.now()>deadline)throw Error('Held synthetic dispatch did not start');await new Promise(resolve=>setTimeout(resolve,20));}
      await page.locator('#reset').click();await page.waitForFunction(()=>document.getElementById('message').textContent.startsWith('Session reset.'));
      assert.equal((await page.evaluate(()=>window.versecue.command('ingest',{text:'Romans 8:28'}))).ok,true);
      await app.evaluate((_electron,outcome)=>{if(outcome==='error')globalThis.resetTransport.reject(Error('SYNTHETIC_PRIVATE_OLD_REFERENCE John 3:16'));else globalThis.resetTransport.resolve({state:outcome,presentation:{text:'SYNTHETIC_PRIVATE_OLD_REFERENCE'}});},outcome);
      await page.waitForFunction(outcome=>document.getElementById('message').textContent.toLowerCase().includes(outcome==='error'?'previous-session':'uncertain'),outcome);
      const state=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(state.busy,false);assert.equal(state.mode,'confirm');assert.equal(state.dryRun,true);assert.equal(state.history.length,0);assert.equal(state.queue.length,1);assert.equal(state.queue[0].label,'Romans 8:28');assert.equal(state.autoStatus,null);assert.equal(await page.locator('#reference').textContent(),'Romans 8:28');assert.equal((await page.locator('#message').textContent()).includes('SYNTHETIC_PRIVATE_OLD_REFERENCE'),false);assert.equal((await page.locator('#history').textContent()).includes('John 3:16'),false);
      assert.equal((await page.evaluate(()=>window.versecue.command('reset'))).ok,true);
    }
    assert.equal(await app.evaluate(()=>globalThis.resetAccepted),3);
    const report={passed:true,packaged:!!executable,lateSuccessAndUncertaintyDidNotRestoreHistory:true,lateErrorSanitized:true,newCandidateAndConfirmPreserved:true,syntheticAcceptedDispatches:3,actualProPresenterAccess:false,microphoneCapture:false};await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-reset-inflight-receipt.json':'test-results/reset-inflight-receipt.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
