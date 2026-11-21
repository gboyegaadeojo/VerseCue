'use strict';
// SYNTHETIC ProPresenter target. Checks NR-012 Prepare for volunteer; no microphone and no output requests.
const {_electron}=require('playwright'),http=require('node:http'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null;let outputRequests=0;
  const server=http.createServer((req,res)=>{if(req.url.includes('/trigger'))outputRequests++;res.setHeader('Content-Type','application/json');if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter SYNTHETIC prepare host'}));if(req.url==='/v1/libraries')return res.end('[]');res.writeHead(404);res.end('{}');});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','prepare-volunteer-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(n,p)=>page.evaluate(({n,p})=>window.versecue.command(n,p),{n,p});
    assert.equal(await page.evaluate(async port=>{const s=(await window.versecue.settings()).value;const r=await window.versecue.saveSettings({...s,host:'127.0.0.1',port,startMode:'prepare'});fillSettings((await window.versecue.settings()).value);return r.ok;},server.address().port),true);
    assert.equal((await command('reset')).ok,true);let s=await state();assert.equal(s.mode,'confirm','Prepare for volunteer starts in Confirm');assert.equal(s.dryRun,true);
    assert.equal((await command('test')).ok,true);assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    await page.evaluate(()=>enableVolunteerPreparation());
    s=await state();assert.equal(s.referencePreparation?.enabled,true,'Detected-reference preparation is on');
    await page.waitForFunction(()=>/PREPARE FOR VOLUNTEER/.test(document.getElementById('mode-explanation').textContent));
    assert.equal(outputRequests,0,'Preparation sends nothing');
    console.log(JSON.stringify({passed:true,packaged:!!executable,startsInConfirm:true,preparationEnabled:true,nativeConsent:s.referencePreparation?.nativeConsent===true,statusShown:true,outputRequests,microphoneCapture:false,actualProPresenterAccess:false}));
  }finally{await app.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});