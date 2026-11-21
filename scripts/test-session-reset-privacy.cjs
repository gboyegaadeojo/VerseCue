'use strict';
// Synthetic renderer content only. No microphone or ProPresenter access.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','reset-privacy-'+randomUUID())],env});
  try{
    const primary=await app.firstWindow();await primary.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const opened=app.waitForEvent('window');assert.equal((await primary.evaluate(()=>window.versecue.compact())).ok,true);const compact=await opened;
    await compact.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    assert.equal((await primary.evaluate(()=>window.versecue.command('ingest',{text:'John 3:16'}))).ok,true);
    for(const page of [primary,compact]){
      await page.waitForFunction(()=>document.getElementById('reference').textContent==='John 3:16');
      await page.evaluate(()=>{document.getElementById('transcript').textContent='SYNTHETIC PRIVATE SERMON';document.getElementById('reference-input').value='SYNTHETIC PRIVATE REFERENCE';document.getElementById('native-preparation-reference').value='SYNTHETIC PRIVATE NATIVE';document.getElementById('saved-cue-preview').textContent='SYNTHETIC PRIVATE SAVED';document.getElementById('audio-consent').checked=true;});
    }
    const staleSnapshot=(await primary.evaluate(()=>window.versecue.state())).value;
    assert.equal((await primary.evaluate(()=>window.versecue.command('reset'))).ok,true);
    for(const page of [primary,compact]){
      await page.waitForFunction(()=>document.getElementById('queue-count').textContent==='0');
      assert.equal(await page.locator('#transcript').textContent(),'No audio has been processed.','Reset must clear transcript in every window');
      assert.equal(await page.locator('#reference-input').inputValue(),'','Reset must clear unsubmitted reference text');
      assert.equal(await page.locator('#native-preparation-reference').inputValue(),'');
      assert.equal(await page.locator('#saved-cue-preview').textContent(),'');
      assert.equal(await page.locator('#audio-consent').isChecked(),false);
      assert.equal(await page.locator('#reference').textContent(),'','Hidden candidate reference must be cleared');
      assert.equal(await page.locator('#phrase').textContent(),'','Hidden source phrase must be cleared');
      const state=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(state.dryRun,true);assert.equal(state.mode,'confirm');assert.equal(state.history.length,0);
    }
    await primary.evaluate(snapshot=>render(snapshot),staleSnapshot);
    assert.equal(await primary.locator('#queue-count').textContent(),'0','Late pre-reset snapshot must not restore private candidates');
    // Model a successful reply already in transport when reset occurs. This
    // deliberately replaces only this isolated process's audio IPC handler.
    await app.evaluate(()=>{const {ipcMain}=process.mainModule.require('electron');ipcMain.removeHandler('audio');globalThis.resetReplies=[];ipcMain.handle('audio',()=>new Promise(resolve=>globalThis.resetReplies.push(resolve)));});
    await primary.evaluate(()=>{window.resetOldReply=audio.onWindow([],{});});
    const waitReplies=async count=>{const deadline=Date.now()+5000;while(await app.evaluate(()=>globalThis.resetReplies.length)<count){if(Date.now()>deadline)throw Error('Synthetic audio reply did not arrive');await new Promise(resolve=>setTimeout(resolve,20));}};
    await waitReplies(1);assert.equal((await compact.evaluate(()=>window.versecue.command('reset'))).ok,true);
    await primary.waitForFunction(()=>document.getElementById('transcript').textContent==='No audio has been processed.');
    await primary.evaluate(()=>{window.resetNewReply=audio.onWindow([],{});});await waitReplies(2);
    await app.evaluate(()=>globalThis.resetReplies[1]({ok:true,value:{text:'SYNTHETIC NEW SESSION',elapsedMs:10}}));await primary.evaluate(()=>window.resetNewReply);
    await app.evaluate(()=>globalThis.resetReplies[0]({ok:true,value:{text:'SYNTHETIC OLD SESSION',elapsedMs:10}}));await primary.evaluate(()=>window.resetOldReply);
    assert.equal(await primary.locator('#transcript').textContent(),'SYNTHETIC NEW SESSION','Late old success must not replace new-session transcript');
    assert.equal((await primary.evaluate(()=>window.versecue.command('reset'))).ok,true);
    await primary.waitForFunction(()=>document.getElementById('transcript').textContent==='No audio has been processed.');
    for(let index=0;index<6;index++){
      await primary.evaluate(()=>{window.previewReply=audio.onWindow([],{});});
      await waitReplies(3+index);
      assert.equal(await primary.locator('#transcript').getAttribute('aria-busy'),'true');
      await app.evaluate((_,index)=>globalThis.resetReplies[2+index]({ok:true,value:{text:'SYNTHETIC WINDOW '+index,elapsedMs:10}}),index);
      await primary.evaluate(()=>window.previewReply);
    }
    assert.deepEqual(await primary.locator('#transcript span').allTextContents(),[1,2,3,4,5].map(index=>'SYNTHETIC WINDOW '+index));
    assert.equal(await primary.locator('#transcript').getAttribute('aria-busy'),'false');
    await primary.evaluate(()=>{window.previewReply=audio.onWindow([],{});});
    await waitReplies(9);
    await app.evaluate(()=>globalThis.resetReplies[8]({ok:true,value:{text:'',elapsedMs:10}}));
    await primary.evaluate(()=>window.previewReply);
    assert.equal(await primary.locator('#transcript span').count(),5,'Silence must preserve completed windows');
    assert.equal((await compact.evaluate(()=>window.versecue.command('reset'))).ok,true);
    await primary.waitForFunction(()=>document.getElementById('transcript').textContent==='No audio has been processed.');
    const report={passed:true,rollingPreviewBoundedAndReset:true,packaged:!!executable,allWindowsCleared:true,unsubmittedReferenceCleared:true,hiddenCandidateContentCleared:true,lateSuccessCannotRestoreOldTranscript:true,newSessionRecognitionStillDisplayed:true,dryRunRestored:true,actualProPresenterAccess:false,microphoneCapture:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-session-reset-privacy.json':'test-results/session-reset-privacy.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
