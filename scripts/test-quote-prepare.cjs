'use strict';
// SYNTHETIC target and recognized text. NR-013: quotes are on by default in Prepare for volunteer; nothing is sent.
const {_electron}=require('playwright'),http=require('node:http'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null;let outputRequests=0;
  const server=http.createServer((req,res)=>{if(req.url.includes('/trigger'))outputRequests++;res.setHeader('Content-Type','application/json');if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter SYNTHETIC quote host'}));if(req.url==='/v1/libraries')return res.end('[]');res.writeHead(404);res.end('{}');});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','quote-prepare-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(n,p)=>page.evaluate(({n,p})=>window.versecue.command(n,p),{n,p});
    await page.evaluate(async port=>{const s=(await window.versecue.settings()).value;await window.versecue.saveSettings({...s,host:'127.0.0.1',port,startMode:'prepare'});fillSettings((await window.versecue.settings()).value);},server.address().port);
    await command('reset');assert.equal((await command('test')).ok,true);
    await app.evaluate(({app})=>{const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async()=>({text:'For God so loved the world, that he gave his only begotten Son',final:true,elapsedMs:10});});
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    await page.evaluate(()=>enableVolunteerPreparation());
    let s=await state();assert.equal(s.quoteMatching?.enabled,true,'Quotes are on by default in Prepare for volunteer');assert.equal(s.quoteMatching?.publicDomain,true);assert.ok(s.quoteMatching.passages>60000);
    const r=await page.evaluate(()=>window.versecue.audio(new Array(32000).fill(0),{windowId:crypto.randomUUID(),timingBasis:'capture-monotonic-proxy',windowDurationMs:2000,bufferedAgeMs:2000,speechEndAgeMs:1000,endEvidence:'silence',droppedSamples:0,clippedSamples:0}));assert.equal(r.ok,true,r.error);
    s=await state();const c=s.queue.find(x=>x.label==='John 3:16')??(s.preparation?.reference==='John 3:16'?{recognition:'quote',issues:['Matched from quoted wording']}:null);
    assert.ok(c,'The quote became John 3:16');assert.equal(c.recognition,'quote');
    await page.waitForFunction(()=>/Matched from quoted wording/.test(document.body.innerText));
    assert.equal(outputRequests,0,'Nothing was sent');
    console.log(JSON.stringify({passed:true,packaged:!!executable,quotesOnByDefault:true,publicDomain:true,quoteBecameReference:'John 3:16',labelShown:true,outputRequests,microphoneCapture:false,actualProPresenterAccess:false}));
  }finally{await app.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});