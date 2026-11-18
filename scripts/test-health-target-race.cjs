'use strict';
// Isolated fake loopback targets only; never contacts the user's ProPresenter.
const {_electron}=require('playwright');const http=require('node:http');const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');const {randomUUID}=require('node:crypto');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function server(handler){const server=http.createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return {server,port:server.address().port};}
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const profile=path.resolve('test-results','health-race-'+randomUUID());await fs.mkdir(profile,{recursive:true});const electron=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${profile}`],env});let triggerRequests=0;const cases=[];
  try{const page=await electron.firstWindow();await page.waitForFunction(()=>document.querySelector('#message').textContent.length>0);
    for(const responseStatus of [200,503]){let requests=0,held;
      const a=await server((req,res)=>{if(req.url.includes('/trigger'))triggerRequests++;if(req.url!=='/version'){res.writeHead(404);res.end();return;}requests++;if(requests===1){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({host_description:'ProPresenter fake A'}));}else held=res;});
      const b=await server((req,res)=>{if(req.url.includes('/trigger'))triggerRequests++;if(req.url!=='/version'){res.writeHead(404);res.end();return;}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({host_description:'ProPresenter fake B'}));});
      try{
        const configure=async port=>{const result=await page.evaluate(async port=>{const current=await window.versecue.settings();return window.versecue.saveSettings({...current.value,host:'127.0.0.1',port});},port);assert.equal(result.ok,true);assert.equal((await page.evaluate(()=>window.versecue.command('test'))).ok,true);};
        await configure(a.port);await page.evaluate(()=>window.versecue.command('resume'));const deadline=Date.now()+6000;while(!held&&Date.now()<deadline)await pause(50);assert.ok(held,'Old-target health request did not start');
        await configure(b.port);assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
        held.writeHead(responseStatus,{'Content-Type':'application/json'});held.end(JSON.stringify({host_description:'ProPresenter fake A'}));await pause(500);
        const state=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(state.connection.version,'ProPresenter fake B');assert.equal(state.connection.state,'connected');assert.equal(state.mode,'confirm');assert.equal(state.capture.active,true);assert.equal(state.dryRun,true);await page.evaluate(()=>window.versecue.endAudio());cases.push({oldTargetResponse:responseStatus,newTargetIdentityPreserved:true,newCaptureNotCanceled:true,mode:'confirm'});
      }finally{a.server.closeAllConnections();b.server.closeAllConnections();await Promise.all([new Promise(resolve=>a.server.close(resolve)),new Promise(resolve=>b.server.close(resolve))]);}
    }
    assert.equal(triggerRequests,0);const report={at:new Date().toISOString(),passed:true,version:await electron.evaluate(({app})=>app.getVersion()),packaged:!!executable,cases,fakeLoopbackTargetsOnly:true,actualProPresenterAccess:false,microphoneCapture:false,outputRequests:0};await fs.writeFile(executable?'test-results/packaged-health-race.json':'test-results/source-health-race.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }finally{await electron.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
