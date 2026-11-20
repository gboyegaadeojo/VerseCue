'use strict';
const {apiJSON,apiResponse}=require('./synthetic-presentation.cjs');
// SYNTHETIC native helper, speech, lease and target only. No OS mic or PP UI.
const {_electron}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 const args=process.argv.slice(2),noInput=args.includes('--no-input'),outputEdit=args.includes('--output-edit'),uncertain=args.includes('--uncertain')||outputEdit,recover=args.includes('--recover'),clipped=args.includes('--clipped')||recover,executable=args.find(arg=>!arg.startsWith('--'))?path.resolve(args.find(arg=>!arg.startsWith('--'))):null,uuid='75631f63-da79-419c-b862-c9b8338081f9',library='5e4da747-cf19-4810-8d4d-b6fe1a7d9350';let created=false,triggers=0,creations=0;const freshUuid='b1c6194a-50d9-461f-9d27-33b388b7d8a1',createdIds=[];
 const server=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url==='/version')return res.end(apiJSON({host_description:'ProPresenter 21.4.2',platform:'win'}));
  if(req.url==='/fixture/create'){created=true;creations++;createdIds.push(creations===1?uuid:freshUuid);return res.end('{}');}
  if(req.url==='/v1/libraries')return res.end(apiJSON([{uuid:library,name:'SYNTHETIC'}]));
  if(req.url==='/v1/library/'+library)return res.end(apiJSON({update_type:'all',items:createdIds.map(uuid=>({uuid,name:'John 3_16 (KJV)'}))}));
  if(req.url==='/v1/playlist/focused')return res.end(apiJSON({playlist:null}));
  const requested=createdIds.find(id=>req.url==='/v1/presentation/'+id);if(requested)return res.end(apiJSON({presentation:{id:{uuid:requested,name:'John 3_16 (KJV)'},destination:'presentation',has_timeline:false,groups:[{slides:[{enabled:true,label:'John 3:16',text:'SYNTHETIC detected passage'}]}]}}));
  if(req.url.endsWith('/trigger')){triggers++;res.writeHead(204);return res.end();}
  if(req.url.endsWith('/slide_index'))return res.end(apiJSON({presentation_index:outputEdit?{presentation_id:{uuid:'3273e659-f3fb-4b1f-8d22-747e872ff154'},index:0}:null}));
  if(req.url.endsWith('/status/slide'))return res.end(apiJSON({current:{text:outputEdit?(creations?'SYNTHETIC edited live text':'SYNTHETIC original live text'):''}}));
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
   bridge.prototype.available=()=>true;bridge.prototype.prepare=async(reference,translation,{guard,saveCopy})=>{global.__detectedCalls++;await new Promise(resolve=>setTimeout(resolve,600));if(!guard())throw Error('Synthetic native preparation canceled');if(global.__detectedUncertain)throw Error('Synthetic uncertain save receipt');await fetch('http://127.0.0.1:'+port+'/fixture/create');return {reference,translation,saveCopyRequested:saveCopy,outputRequests:0,workerElapsedMs:600,clippingWarning:global.__detectedClip===true};};
  },server.address().port);
  await app.evaluate((_,clipped)=>{global.__detectedClip=clipped;},clipped);
  await app.evaluate((_,uncertain)=>{global.__detectedUncertain=uncertain;},uncertain&&!outputEdit);
  const state=async()=>(await page.evaluate(()=>window.versecue.state())).value,command=(name,payload)=>page.evaluate(({name,payload})=>window.versecue.command(name,payload),{name,payload});
  await page.evaluate(async port=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port});await window.versecue.command('test');},server.address().port);
  assert.equal((await state()).referencePreparation.nativeConsent,false);
  if(!noInput)assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
  const feed=async text=>{if(noInput)return command('ingest',{text});await app.evaluate((_,text)=>{global.__detectedText=text;},text);return page.evaluate(metadata=>window.versecue.audio(new Array(16000).fill(.01),metadata),{windowId:randomUUID(),timingBasis:'capture-monotonic-proxy',bufferedAgeMs:1500,windowDurationMs:1000,speechEndAgeMs:1000,endEvidence:'silence',droppedSamples:0,clippedSamples:0});};
  await feed('John chapter three verse sixteen');assert.equal(await app.evaluate(()=>global.__detectedCalls),0);assert.equal(creations,0);
  await page.locator('#setup').click();await page.locator('[data-settings=output]').click();await page.locator('#prepare-missing-detected').check();await page.locator('#close-settings').click();
  assert.equal((await state()).referencePreparation.scope,'native-with-session-consent');
  const compactOpened=app.waitForEvent('window');assert.equal((await page.evaluate(()=>window.versecue.compact())).ok,true);const compact=await compactOpened;await compact.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
  assert.equal(await compact.locator('#prepare-missing-detected').isChecked(),false);assert.match(await compact.locator('#prepare-missing-help').textContent(),/another VerseCue window/);assert.equal(await page.locator('#prepare-missing-detected').isChecked(),true);
  assert.equal((await compact.evaluate(()=>window.versecue.command('ingest',{text:'John 3:16'}))).ok,true);
  await page.waitForFunction(async()=>{const state=(await window.versecue.state()).value;return !state.referencePreparation.running&&state.preparation.phase==='consent-required';});
  assert.equal(await app.evaluate(()=>global.__detectedCalls),0);assert.equal((await state()).referencePreparation.nativeConsent,true);await compact.close();assert.equal((await state()).mode,'confirm');
  await feed('John chapter three verse sixteen');
  const deadline=Date.now()+5000;while(await app.evaluate(()=>global.__detectedCalls)===0){if(Date.now()>deadline)throw Error('Native scheduling did not start');await new Promise(resolve=>setTimeout(resolve,20));}
  await app.evaluate(({BrowserWindow})=>new Promise(resolve=>{const win=BrowserWindow.getAllWindows()[0];if(win.isVisible())resolve();else win.once('show',resolve);}));
  await app.evaluate(({BrowserWindow})=>new Promise(resolve=>{const win=BrowserWindow.getAllWindows()[0];win.once('minimize',resolve);win.minimize();}));
  if(!noInput)assert.equal((await feed('God has not forgotten us')).ok,true);
  if(uncertain){
   let failed;do{failed=await state();if(failed.referencePreparation.needsInspection&&!failed.referencePreparation.running)break;if(Date.now()>deadline)throw Error('Uncertain preparation did not revoke consent');await new Promise(resolve=>setTimeout(resolve,30));}while(true);
   assert.equal(failed.referencePreparation.nativeConsent,false);assert.equal(failed.referencePreparation.enabled,true);assert.equal(failed.capture.active,!noInput);assert.equal(failed.mode,'confirm');assert.equal(failed.dryRun,true);
   await feed('John chapter three verse sixteen');await page.waitForFunction(async()=>!(await window.versecue.state()).value.referencePreparation.running);assert.equal(await app.evaluate(()=>global.__detectedCalls),1);assert.equal(creations,outputEdit?1:0);assert.equal(triggers,0);
   const choice={enabled:true,nativePreparation:true,acknowledgeFocusChange:true,acknowledgeCreateCopy:true};assert.equal((await command('reference-preparation',choice)).ok,false);
   await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].restore());await page.locator('#setup').click();await page.locator('[data-settings=output]').click();assert.match(await page.locator('#prepare-missing-detected').locator('..').innerText(),/inspected ProPresenter/);await page.locator('#prepare-missing-detected').check();assert.equal((await state()).referencePreparation.needsInspection,false);assert.equal((await state()).referencePreparation.nativeConsent,true);assert.equal(await app.evaluate(()=>global.__detectedCalls),1);await command('stop');assert.equal((await state()).referencePreparation.nativeConsent,false);
   const report={at:new Date().toISOString(),passed:true,packaged:!!executable,nativeBridge:'SYNTHETIC',uncertainAttemptRevokedConsent:true,liveTextEditWithUnchangedCueBlocked:outputEdit,nativeCopiesCreated:creations,savedLookupRetained:true,noAutomaticRetry:true,explicitInspectionRequired:true,inspectionChoiceDidNotRetry:true,nativeAttempts:1,outputTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};await fs.writeFile(`test-results/${executable?'packaged-':''}detected-native-preparation-${outputEdit?'output-edit':'uncertain'}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));return;
  }
  let prepared;do{prepared=await state();if(prepared.preparation.phase==='review-required')break;if(Date.now()>deadline)throw Error('Consented native review was not reached: '+JSON.stringify(prepared.preparation));await new Promise(resolve=>setTimeout(resolve,30));}while(true);
  assert.equal(prepared.preparation.bibleOrigin,'native-save-this-operation');assert.equal(prepared.mode,'confirm');assert.equal(prepared.dryRun,true);assert.equal(prepared.capture.active,!noInput);if(!noInput)assert.equal(prepared.capture.backgroundProtected,true);assert.equal(prepared.preparation.reference,'John 3:16');assert.equal(creations,1);assert.equal(triggers,0);assert.equal(prepared.referencePreparation.nativeConsent,true);
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isMinimized()),true);
  if(clipped){assert.equal(prepared.preparation.clippingWarning,true);const rejected=await command('confirm-passage',{reviewToken:prepared.preparation.reviewToken,verified:true,acknowledgeTestOutput:true});assert.equal(rejected.ok,false);assert.match(rejected.error,/clipped/);const oldToken=prepared.preparation.reviewToken;await command('ingest',{text:'John 3:16'});const limit=Date.now()+4000;let reused;do{reused=await state();if(reused.preparation.phase==='review-required'&&reused.preparation.reviewToken!==oldToken)break;if(Date.now()>limit)throw Error('Clipped reuse did not reach guarded review');await new Promise(resolve=>setTimeout(resolve,20));}while(true);assert.equal(reused.preparation.clippingWarning,true);assert.equal(reused.preparation.clippingEvidence,'reported-this-session');assert.equal(creations,1);assert.equal(triggers,0);}
  if(recover){const previous=await state();await app.evaluate(({BrowserWindow})=>{global.__detectedClip=false;BrowserWindow.getAllWindows()[0].restore();});assert.equal(await page.locator('#rebuild-clipped-passage').isEnabled(),false);await page.locator('#rebuild-clipping-consent').check();await page.locator('#rebuild-clipped-passage').click();const limit=Date.now()+8000;let fresh;do{fresh=await state();if(fresh.preparation.phase==='review-required'&&fresh.preparation.reviewToken!==previous.preparation.reviewToken)break;if(Date.now()>limit)throw Error('Fresh clipping recovery did not complete: '+JSON.stringify(fresh.preparation));await new Promise(resolve=>setTimeout(resolve,30));}while(true);assert.equal(fresh.preparation.uuid,freshUuid);assert.equal(fresh.preparation.clippingWarning,false);assert.equal(fresh.preparation.formattingVerified,false);assert.equal(creations,2);assert.equal(createdIds.length,2);assert.equal(await page.locator('#passage-verified').isChecked(),false);assert.equal(await page.locator('#passage-test-consent').isChecked(),false);assert.equal(await page.locator('#confirm-passage').isEnabled(),false);assert.equal(triggers,0);}
  await command('stop');assert.equal((await state()).referencePreparation.nativeConsent,false);assert.equal((await state()).capture.active,false);
  await command('resume');assert.equal((await command('reference-preparation',{enabled:true,nativePreparation:true,acknowledgeFocusChange:true,acknowledgeCreateCopy:true})).ok,true);
  assert.equal((await state()).capture.active,false);assert.equal((await state()).referencePreparation.nativeConsent,true);
  await page.reload();await page.waitForSelector('#prepare-passage',{state:'attached'});assert.equal((await state()).referencePreparation.nativeConsent,false);assert.equal((await state()).mode,'paused');
  const report={at:new Date().toISOString(),version:await app.evaluate(({app})=>app.getVersion()),passed:true,packaged:!!executable,nativeBridge:'SYNTHETIC',offUntilExplicitOutputSetting:true,otherWindowCannotBorrowNativeConsent:true,detectedMissingPassagePreparedWithoutPrepareClick:true,ordinarySpeechDidNotCancelNativeWork:noInput?null:true,minimizedReviewReached:true,existingInputRetained:noInput?null:true,noInputManualPathVerified:noInput,knownClippingReuseRetained:clipped?true:null,clippingRecoveryCreatesFreshReviewedCopy:recover?true:null,stopRevokedSessionConsent:true,ownerReloadWithoutCaptureRevokedConsent:true,nativeCopyCreations:creations,outputTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};
  await fs.writeFile(`test-results/${executable?'packaged-':''}detected-native-preparation${noInput?'-no-input':''}${clipped?'-clipped':''}${recover?'-recover':''}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
