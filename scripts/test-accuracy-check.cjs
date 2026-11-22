'use strict';
// NR-022: the accuracy check scores each phrase with and without book-name hints on its own capture purpose. Speech is
// stubbed here (real speech: docs/145). It never feeds the session, candidates, Auto, preparation or output.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const exe=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(exe?{executablePath:exe}:{}),args:[...(exe?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','accuracy-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    // Stub recognition: without hints the engine mishears Haggai; with hints it hears it.
    await app.evaluate(({app})=>{const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));
      require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async(samples,options={})=>({text:options.hint?'Haggai chapter 2 verse 9':'Hagiye chapter 2 verse 9',final:true,elapsedMs:options.hint?900:300});});
    const api=(name,...args)=>page.evaluate(({name,args})=>window.versecue[name](...args),{name,args});
    const prompts=(await api('accuracyPrompts')).value;assert.equal(prompts.prompts.length,50);assert.equal(prompts.withoutReferences.length,12);
    assert.equal(await page.evaluate(d=>window.versecueAccuracy.order(d).length,prompts),55,'50 references and 5 without');
    const samples=new Array(16000).fill(0);
    assert.equal((await api('accuracyTranscribe',samples,'Haggai 2:9')).ok,false,'needs the check capture');
    assert.equal((await api('beginAudio',{authorized:true,purpose:'accuracy-check'})).ok,false,'refused in Auto');
    await api('command','mode','confirm');
    const begun=await api('beginAudio',{authorized:true,purpose:'accuracy-check'});assert.equal(begun.ok,true,JSON.stringify(begun));
    const recognition=await api('audio',samples,{windowId:randomUUID(),timingBasis:'capture-monotonic-proxy',windowDurationMs:1000,bufferedAgeMs:1000,speechEndAgeMs:500,endEvidence:'silence',droppedSamples:0,clippedSamples:0});
    assert.equal(recognition.ok,false,'the check capture never feeds normal recognition');
    const scored=(await api('accuracyTranscribe',samples,'Haggai 2:9')).value;
    assert.equal(scored.plain.outcome,'missed');assert.equal(scored.hinted.outcome,'correct');assert.deepEqual(scored.hinted.references,['Haggai 2:9']);
    const none=(await api('accuracyTranscribe',samples,null)).value;assert.equal(none.hinted.outcome,'invented','a reference heard in a sentence without one is counted');
    const state=(await api('state')).value;assert.equal(state.queue.length,0,'nothing reached the session');assert.equal(state.history.length,0);assert.equal(state.dryRun,true);assert.notEqual(state.mode,'auto');
    assert.equal((await api('endAudio')).ok,true);assert.equal((await api('accuracyTranscribe',samples,'Haggai 2:9')).ok,false,'stops with the capture');
    // The dialog opens from Settings > Speech and asks for consent before using the input.
    await page.locator('#setup').click();await page.locator('[data-settings="speech"]').click();await page.locator('#accuracy-check').click();
    assert.equal(await page.locator('#accuracy-dialog').evaluate(d=>d.open),true);assert.equal(await page.locator('#accuracy-start').isVisible(),true);
    await page.locator('#accuracy-start').click();await page.waitForTimeout(300);assert.match(await page.locator('#accuracy-status').textContent(),/Tick the box/);
    await page.locator('#accuracy-close').click();assert.equal(await page.locator('#accuracy-dialog').evaluate(d=>d.open),false);
    assert.equal((await api('settings')).value.speechHints,false,'book-name hints are off by default');
    console.log(JSON.stringify({accuracyCheck:'passed',plain:scored.plain.outcome,hinted:scored.hinted.outcome,outputHistoryEntries:state.history.length},null,2));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
