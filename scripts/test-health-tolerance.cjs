'use strict';
// SYNTHETIC ProPresenter that can answer late. No microphone or real ProPresenter.
const {_electron}=require('playwright'),http=require('node:http'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null;let slow=false,outputRequests=0;
  const server=http.createServer((req,res)=>{if(req.url.includes('/trigger'))outputRequests++;const reply=()=>{res.setHeader('Content-Type','application/json');if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter SYNTHETIC slow host'}));res.writeHead(404);res.end('{}');};if(slow&&req.url==='/version')setTimeout(()=>{if(!res.writableEnded)reply();},2600);else reply();});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','health-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(n,p)=>page.evaluate(({n,p})=>window.versecue.command(n,p),{n,p});
    const until=async(check,ms=15000)=>{const end=Date.now()+ms;for(;;){const s=await state();if(check(s))return s;if(Date.now()>end)throw Error('timeout '+JSON.stringify({c:s.connection,mode:s.mode,events:s.events.slice(-5).map(e=>e.code)}));await new Promise(r=>setTimeout(r,100));}};
    await page.evaluate(async port=>{const s=(await window.versecue.settings()).value;await window.versecue.saveSettings({...s,host:'127.0.0.1',port});},server.address().port);
    await command('reset');assert.equal((await command('test')).ok,true);
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);const mode=(await state()).mode;
    slow=true;await until(s=>s.connection.state==='degraded');slow=false;
    let s=await state();assert.equal(s.capture.active,true,'A slow answer does not stop listening');assert.equal(s.mode,mode,'A slow answer does not change the mode');
    assert.match(await page.locator('#connection').textContent(),/^Slow to respond/);
    s=await until(x=>x.connection.state==='connected');assert.equal(s.capture.active,true);assert.equal(s.mode,mode,'Recovering from a slow answer does not pause');
    const codes=s.events.map(e=>e.code);assert.ok(codes.includes('LINK_SLOW')&&codes.includes('LINK_SLOW_RECOVERED'));assert.equal(codes.includes('LINK_RECOVERED_REARM_REQUIRED'),false);
    slow=true;s=await until(x=>x.connection.state==='offline',40000);assert.equal(s.mode,'paused','15 seconds of failures is a lost link');assert.ok(s.events.some(e=>e.code==='LINK_LOST'));
    slow=false;s=await until(x=>x.connection.state==='connected',15000);assert.equal(s.mode,'paused','A real reconnect still requires a deliberate resume');assert.ok(s.events.some(e=>e.code==='LINK_RECOVERED_REARM_REQUIRED'));
    assert.equal(outputRequests,0);
    console.log(JSON.stringify({passed:true,packaged:!!executable,slowAnswerKeepsListening:true,slowRecoveryNoPause:true,threeFailuresLoseLink:true,reconnectRequiresResume:true,outputRequests,actualProPresenterAccess:false,microphoneCapture:false}));
  }finally{await app.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
