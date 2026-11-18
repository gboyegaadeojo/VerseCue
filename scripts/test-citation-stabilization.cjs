'use strict';
// SYNTHETIC speech/capture lease and target; no OS microphone or real ProPresenter.
const {_electron}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 const executable=process.argv[2]?path.resolve(process.argv[2]):null,uuid='75631f63-da79-419c-b862-c9b8338081f9',library='5e4da747-cf19-4810-8d4d-b6fe1a7d9350';let triggers=0;
 const server=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter SYNTHETIC stabilization'}));
  if(req.url==='/v1/libraries')return res.end(JSON.stringify([{uuid:library,name:'SYNTHETIC'}]));
  if(req.url==='/v1/library/'+library)return res.end(JSON.stringify({update_type:'all',items:[{uuid,name:'John 3_16 (KJV)'}]}));
  if(req.url==='/v1/presentation/'+uuid)return res.end(JSON.stringify({presentation:{id:{uuid,name:'John 3_16 (KJV)'},destination:'presentation',has_timeline:false,groups:[{slides:[{enabled:true,label:'John 3:16',text:'SYNTHETIC stabilization passage'}]}]}}));
  if(req.url.endsWith('/trigger')){triggers++;res.writeHead(204);return res.end();}
  if(req.url.endsWith('/slide_index'))return res.end(JSON.stringify({presentation_index:triggers?{presentation_id:{uuid},index:0}:null}));
  if(req.url.endsWith('/status/slide'))return res.end(JSON.stringify({current:{text:triggers?'SYNTHETIC stabilization passage':''}}));
  res.writeHead(404);res.end('{}');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;let app;
 try{
  app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${path.resolve('test-results','stabilization-'+randomUUID())}`],env});
  const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await app.evaluate(({app})=>{const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async()=>({text:global.__stabilizationText,final:global.__stabilizationFinal,elapsedMs:10});});
  const command=(name,payload)=>page.evaluate(({name,payload})=>window.versecue.command(name,payload),{name,payload}),state=async()=>(await page.evaluate(()=>window.versecue.state())).value;
  await page.evaluate(async port=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port});await window.versecue.command('test');},server.address().port);
  assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
  let captureSessionId=randomUUID(),sequence=0;
  const newPhrase=()=>{captureSessionId=randomUUID();sequence=0;};
  const feed=async(text,{final=true,age=sequence===0?4000:2000,repeat=false}={})=>{
   await app.evaluate((_,data)=>{global.__stabilizationText=data.text;global.__stabilizationFinal=data.final;},{text,final});
   if(!repeat)sequence++;
   return page.evaluate(metadata=>window.versecue.audio(new Array(16000).fill(.01),metadata),{captureSessionId,windowSequence:sequence,windowId:randomUUID(),timingBasis:'capture-monotonic-proxy',bufferedAgeMs:age,windowDurationMs:1000,speechEndAgeMs:1000,endEvidence:'silence',droppedSamples:0,clippedSamples:0});
  };
  assert.equal((await feed('Please turn to John chapter three')).ok,true);let s=await state();assert.equal(s.queue.length,0);assert.equal(s.speechStabilization.state,'waiting');assert.equal(s.capture.active,true);
  assert.equal((await feed('Please turn to John chapter three',{repeat:true,age:4000})).value.discarded,true);
  assert.equal((await feed('verse sixteen')).ok,true);s=await state();assert.equal(s.queue.length,1);assert.equal(s.queue[0].label,'John 3:16');assert.equal(s.queue[0].stabilization.fragmentCount,2);assert.match(s.queue[0].issues.join(' '),/Assembled/);assert.ok(s.queue[0].expiresAt-s.queue[0].detectedAt<12000);assert.equal(triggers,0);
  assert.equal((await command('prepare-passage-candidate',{id:s.queue[0].id})).ok,true);
  await page.locator('#passage-verified').check();await page.locator('#passage-test-consent').check();await page.locator('#confirm-passage').click();
  await page.waitForFunction(()=>document.getElementById('passage-ready-status').textContent.includes('matching readback was received'));assert.equal(triggers,1);
  newPhrase();await feed('John chapter three');assert.equal((await command('ingest',{text:'Romans 8:28'})).ok,true);await feed('verse sixteen');assert.equal((await state()).queue.some(c=>c.label==='John 3:16'),false);
  newPhrase();await feed('John chapter three');assert.equal((await command('audio-loss',{reason:'capture-gap',samples:1600})).ok,true);await feed('verse sixteen');assert.equal((await state()).queue.some(c=>c.stabilization),false);
  newPhrase();await feed('John 3:16',{final:false});assert.equal((await state()).queue.length,0);assert.equal((await state()).speechStabilization.state,'unstable');
  await command('dry-run');assert.equal((await command('enable-auto',{acknowledged:true})).ok,true);newPhrase();const historyCount=(await state()).history.length;
  await feed('Please read John chapter three');await feed('verse sixteen');await new Promise(resolve=>setTimeout(resolve,900));s=await state();assert.equal(s.history.length,historyCount);assert.match(s.autoStatus.reason,/review/);assert.equal(triggers,1);
  await command('stop');s=await state();assert.equal(s.capture.active,false);assert.equal(s.speechStabilization.state,'idle');assert.deepEqual(errors,[]);
  const report={at:new Date().toISOString(),version:await app.evaluate(({app})=>app.getVersion()),passed:true,packaged:!!executable,syntheticRecognition:true,adjacentFragmentsReachReview:true,originalAudioAgeRetained:true,duplicateWindowSuppressed:true,manualAndAudioLossCancelAssembly:true,partialTranscriptWithheld:true,assembledAutoBlocked:true,explicitDesktopConfirmationWorks:true,fakeTargetTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};
  await fs.writeFile(`test-results/${executable?'packaged-':''}citation-stabilization.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
