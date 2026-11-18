'use strict';
// SYNTHETIC native helper, speech, lease and target only. No OS mic or PP UI.
const {_electron}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 const args=process.argv.slice(2),noInput=args.includes('--no-input'),executable=args.find(arg=>!arg.startsWith('--'))?path.resolve(args.find(arg=>!arg.startsWith('--'))):null,uuid='75631f63-da79-419c-b862-c9b8338081f9',library='5e4da747-cf19-4810-8d4d-b6fe1a7d9350';let created=false,triggers=0,creations=0;
 const server=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter 21.4.2',platform:'win'}));
  if(req.url==='/fixture/create'){created=true;creations++;return res.end('{}');}
  if(req.url==='/v1/libraries')return res.end(JSON.stringify([{uuid:library,name:'SYNTHETIC'}]));
  if(req.url==='/v1/library/'+library)return res.end(JSON.stringify({update_type:'all',items:created?[{uuid,name:'John 3_16 (KJV)'}]:[]}));
  if(req.url==='/v1/playlist/focused')return res.end(JSON.stringify({playlist:null}));
  if(req.url==='/v1/presentation/'+uuid)return res.end(JSON.stringify({presentation:{id:{uuid,name:'John 3_16 (KJV)'},destination:'presentation',has_timeline:false,groups:[{slides:[{enabled:true,label:'John 3:16',text:'SYNTHETIC detected passage'}]}]}}));
  if(req.url.endsWith('/trigger')){triggers++;res.writeHead(204);return res.end();}
  if(req.url.endsWith('/slide_index'))return res.end(JSON.stringify({presentation_index:null}));
  if(req.url.endsWith('/status/slide'))return res.end(JSON.stringify({current:{text:''}}));
  res.writeHead(404);res.end('{}');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;let app;
 try{
  app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${path.resolve('test-results','detected-native-'+randomUUID())}`],env});const page=await app.firstWindow();
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await app.evaluate(({app},port)=>{
   const path=process.getBuiltinModule('node:path'),require=process.getBuiltinModule('node:module').createRequire(path.join(app.getAppPath(),'package.json'));
   global.__detectedText='John chapter three verse sixteen';global.__detectedCalls=0;
   require(path.join(app.getAppPath(),'core/stt.cjs')).LocalSpeech.prototype.transcribe=async()=>({text:global.__detectedText,final:true,elapsedMs:10});
   const bridge=require(path.join(app.getAppPath(),'core/bible-preparation.cjs')).BiblePreparation;
   bridge.prototype.available=()=>true;bridge.prototype.prepare=async(reference,translation,{guard,saveCopy})=>{global.__detectedCalls++;await new Promise(resolve=>setTimeout(resolve,600));if(!guard())throw Error('Synthetic native preparation canceled');await fetch('http://127.0.0.1:'+port+'/fixture/create');return {reference,translation,saveCopyRequested:saveCopy,outputRequests:0,workerElapsedMs:600,clippingWarning:false};};
  },server.address().port);
  const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(name,payload)=>page.evaluate(({name,payload})=>window.versecue.command(name,payload),{name,payload});
  await page.evaluate(async port=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port});await window.versecue.command('test');},server.address().port);
  assert.equal((await state()).referencePreparation.nativeConsent,false);
  if(!noInput)assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
  const feed=async text=>{if(noInput)return command('ingest',{text});await app.evaluate((_,text)=>{global.__detectedText=text;},text);return page.evaluate(metadata=>window.versecue.audio(new Array(16000).fill(.01),metadata),{windowId:randomUUID(),timingBasis:'capture-monotonic-proxy',bufferedAgeMs:1500,windowDurationMs:1000,speechEndAgeMs:1000,endEvidence:'silence',droppedSamples:0,clippedSamples:0});};
  await feed('John chapter three verse sixteen');assert.equal(await app.evaluate(()=>global.__detectedCalls),0);assert.equal(creations,0);
  await page.locator('#setup').click();await page.locator('[data-settings=output]').click();await page.locator('#prepare-missing-detected').check();await page.locator('#close-settings').click();
  assert.equal((await state()).referencePreparation.scope,'native-with-session-consent');
  await feed('John chapter three verse sixteen');
  const deadline=Date.now()+5000;while(await app.evaluate(()=>global.__detectedCalls)===0){if(Date.now()>deadline)throw Error('Native scheduling did not start');await new Promise(resolve=>setTimeout(resolve,20));}
  await app.evaluate(({BrowserWindow})=>new Promise(resolve=>{const win=BrowserWindow.getAllWindows()[0];if(win.isVisible())resolve();else win.once('show',resolve);}));
  await app.evaluate(({BrowserWindow})=>new Promise(resolve=>{const win=BrowserWindow.getAllWindows()[0];win.once('minimize',resolve);win.minimize();}));
  if(!noInput)assert.equal((await feed('God has not forgotten us')).ok,true);
  let prepared;do{prepared=await state();if(prepared.preparation.phase==='review-required')break;if(Date.now()>deadline)throw Error('Consented native review was not reached: '+JSON.stringify(prepared.preparation));await new Promise(resolve=>setTimeout(resolve,30));}while(true);
  assert.equal(prepared.mode,'confirm');assert.equal(prepared.dryRun,true);assert.equal(prepared.capture.active,!noInput);if(!noInput)assert.equal(prepared.capture.backgroundProtected,true);assert.equal(prepared.preparation.reference,'John 3:16');assert.equal(creations,1);assert.equal(triggers,0);assert.equal(prepared.referencePreparation.nativeConsent,true);
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isMinimized()),true);
  await command('stop');assert.equal((await state()).referencePreparation.nativeConsent,false);assert.equal((await state()).capture.active,false);
  await command('resume');assert.equal((await command('reference-preparation',{enabled:true,nativePreparation:true,acknowledgeFocusChange:true,acknowledgeCreateCopy:true})).ok,true);
  assert.equal((await state()).capture.active,false);assert.equal((await state()).referencePreparation.nativeConsent,true);
  await page.reload();await page.waitForSelector('#prepare-passage',{state:'attached'});assert.equal((await state()).referencePreparation.nativeConsent,false);assert.equal((await state()).mode,'paused');
  const report={at:new Date().toISOString(),version:await app.evaluate(({app})=>app.getVersion()),passed:true,packaged:!!executable,nativeBridge:'SYNTHETIC',offUntilExplicitOutputSetting:true,detectedMissingPassagePreparedWithoutPrepareClick:true,ordinarySpeechDidNotCancelNativeWork:noInput?null:true,minimizedReviewReached:true,existingInputRetained:noInput?null:true,noInputManualPathVerified:noInput,stopRevokedSessionConsent:true,ownerReloadWithoutCaptureRevokedConsent:true,nativeCopyCreations:creations,outputTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};
  await fs.writeFile(`test-results/${executable?'packaged-':''}detected-native-preparation${noInput?'-no-input':''}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
