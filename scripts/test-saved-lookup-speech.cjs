'use strict';
const {apiJSON,apiResponse}=require('./synthetic-presentation.cjs');
// SYNTHETIC speech/target/capture lease only. Never opens a microphone or PP.
const {_electron}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 const executable=process.argv[2]?path.resolve(process.argv[2]):null,uuid='75631f63-da79-419c-b862-c9b8338081f9',library='5e4da747-cf19-4810-8d4d-b6fe1a7d9350';let release,blocked=false,triggers=0;
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');
  if(req.url==='/version')return res.end(apiJSON({host_description:'ProPresenter SYNTHETIC'}));
  if(req.url==='/v1/libraries')return res.end(apiJSON([{uuid:library,name:'SYNTHETIC'}]));
  if(req.url==='/v1/library/'+library){blocked=true;release=()=>res.end(apiJSON({update_type:'all',items:[{uuid,name:'Hosea 1_1 (KJV)'}]}));return;}
  if(req.url==='/v1/presentation/'+uuid)return res.end(apiJSON({presentation:{id:{uuid,name:'Hosea 1_1 (KJV)'},destination:'presentation',has_timeline:false,groups:[{slides:[{enabled:true,label:'Hosea 1:1',text:'SYNTHETIC saved text'}]}]}}));
  if(req.url.endsWith('/trigger')){triggers++;res.writeHead(204);return res.end();}
  res.writeHead(404);res.end('{}');
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let app;const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 try{
  app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${path.resolve('test-results','saved-lookup-speech-'+randomUUID())}`],env});const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await app.evaluate(({app})=>{const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async()=>({text:global.__lookupText,final:true,elapsedMs:1});});
  await page.evaluate(async port=>{const settings=(await window.versecue.settings()).value;await window.versecue.saveSettings({...settings,host:'127.0.0.1',port});await window.versecue.command('test');},server.address().port);
  assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
  assert.equal((await page.evaluate(()=>window.versecue.command('reference-preparation',true))).ok,true);
  const feed=async text=>{await app.evaluate((_,text)=>{global.__lookupText=text;},text);const result=await page.evaluate(metadata=>window.versecue.audio(new Array(16000).fill(.01),metadata),{windowId:randomUUID(),timingBasis:'capture-monotonic-proxy',bufferedAgeMs:1500,windowDurationMs:1000,speechEndAgeMs:1000,endEvidence:'silence',droppedSamples:0,clippedSamples:0});assert.equal(result.ok,true);};
  await feed('Hosea chapter one verse one');const deadline=Date.now()+5000;while(!blocked){if(Date.now()>deadline)throw Error('Lookup was not started');await new Promise(resolve=>setTimeout(resolve,20));}
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].minimize());await feed('God has not forgotten us');release();
  await page.waitForFunction(async()=>{const state=(await window.versecue.state()).value;return state.preparation.phase==='review-required';});const state=(await page.evaluate(()=>window.versecue.state())).value;
  assert.equal(state.preparation.reference,'Hosea 1:1');assert.equal(state.capture.active,true);assert.equal(state.capture.backgroundProtected,true);assert.equal(state.referencePreparation.nativeConsent,false);assert.equal(state.dryRun,true);assert.equal(triggers,0);await page.evaluate(()=>window.versecue.command('stop'));
  const report={at:new Date().toISOString(),passed:true,packaged:!!executable,ordinarySpeechDuringSavedLookupPreserved:true,minimizedCaptureRetained:true,nativeConsent:false,outputTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};await fs.writeFile(`test-results/${executable?'packaged-':''}saved-lookup-speech.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{release?.();await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
