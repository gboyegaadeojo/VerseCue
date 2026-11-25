'use strict';
// NR-027: an early recognition (started during the pause) creates nothing by itself; the window's commit finishes it
// through the normal path; a discarded one cannot be committed. Speech is stubbed; no microphone or ProPresenter.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const exe=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(exe?{executablePath:exe}:{}),args:[...(exe?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','early-recognition-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await app.evaluate(({app})=>{const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));
      require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async(samples,options={})=>{globalThis.lastSpeculative=options.speculative===true;return {text:'Turn with me to John chapter 3 verse 16',final:true,elapsedMs:20};};});
    const api=(name,...args)=>page.evaluate(({name,args})=>window.versecue[name](...args),{name,args});
    await api('command','mode','confirm');assert.equal((await api('beginAudio',{authorized:true})).ok,true);
    const samples=new Array(32000).fill(0),session=randomUUID(),meta=(id,seq,extra={})=>({windowId:id,captureSessionId:session,windowSequence:seq,timingBasis:'capture-monotonic-proxy',windowDurationMs:2000,bufferedAgeMs:2000,speechEndAgeMs:300,endEvidence:'speculative',droppedSamples:0,clippedSamples:0,...extra});
    const early=randomUUID();const held=await api('audio',samples,meta(early,1,{speculative:true}));
    assert.equal(held.ok,true,held.error);assert.equal(held.value.speculative,true);assert.equal(await app.evaluate(()=>globalThis.lastSpeculative),true,'run as interruptible early recognition');
    assert.equal((await api('state')).value.queue.length,0,'nothing happens until the pause is confirmed');
    const committed=await api('audioCommit',early,meta(early,1,{endEvidence:'silence',speechEndAgeMs:700}));assert.equal(committed.ok,true,committed.error);
    assert.match(committed.value.text,/John chapter 3 verse 16/);const queue=(await api('state')).value.queue;assert.equal(queue.length,1);assert.equal(queue[0].label,'John 3:16');
    assert.equal((await api('audioCommit',early,meta(early,1))).ok,false,'a result is committed once');
    const dropped=randomUUID();await api('audio',samples,meta(dropped,2,{speculative:true}));await api('audioDiscard',dropped);
    assert.equal((await api('audioCommit',dropped,meta(dropped,2))).ok,false,'a discarded early result cannot be committed');
    assert.equal((await api('audio',samples,meta('not-a-uuid',3,{speculative:true}))).ok,false,'early windows need a window id');
    await api('endAudio');const state=(await api('state')).value;assert.equal(state.history.length,0);assert.equal(state.dryRun,true);
    console.log(JSON.stringify({earlyRecognition:'passed',candidate:queue[0].label},null,2));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
