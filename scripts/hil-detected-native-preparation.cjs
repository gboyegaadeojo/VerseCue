'use strict';
// Authorized PERSONAL host preparation only. Computer Use clicks Review reference.
// One new Bible test copy, no output, no microphone and no theme/Look/playlist edits.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{createHash,randomUUID}=require('node:crypto'),{execFileSync}=require('node:child_process');
const {titleReference}=require('../core/bible-passage-plan.cjs');
(async()=>{
 if(!process.argv.includes('--authorized-personal-host'))throw Error('Personal-host authorization required');
 const reference=process.argv.find(arg=>arg.startsWith('--reference='))?.slice('--reference='.length)??'Hosea 1:5';if(!/^Hosea 1:[567]$/.test(reference))throw Error('Use a bounded new personal acceptance reference');
 const reportPath=`poc/private/acceptance-2026-11-18/detected-native-${reference.replaceAll(' ','_').replace(':','_')}.json`;
 try{await fs.access(reportPath);throw Error('Attempt already recorded; inspect it instead of blindly repeating');}catch(error){if(error.code!=='ENOENT')throw error;}
 const read=async route=>{const r=await fetch('http://127.0.0.1:1025'+route,{signal:AbortSignal.timeout(2500)});assert.equal(r.ok,true);return r.json();};
 const version=await read('/version');assert.equal(version.host_description,'ProPresenter 21.4.2');assert.equal(version.platform,'win');
 const output=async()=>JSON.stringify(await Promise.all([read('/v1/presentation/slide_index'),read('/v1/status/slide')]));
 const focused=await read('/v1/playlist/focused');assert.equal(focused.playlist?.name,'Sunday Service');
 const playlistRoute='/v1/playlist/'+focused.playlist.uuid,playlistBefore=JSON.stringify(await read(playlistRoute)),outputBefore=await output();
 const libraries=await read('/v1/libraries');assert.equal(libraries.length,1);const libraryRoute='/v1/library/'+libraries[0].uuid,catalog=await read(libraryRoute);
 assert.equal(catalog.items.some(item=>titleReference(item.name,'KJV')===reference),false,'Passage already exists; do not create a duplicate');
 const beforeIds=new Set(catalog.items.map(item=>item.uuid)),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
 const sourceFiles=['core/preparation-controller.cjs','core/reference-preparation.cjs','core/bible-preparation.cjs','core/passage-coordinator.cjs','desktop/main.cjs','native/windows/BibleBridge.cs','native/bin/VerseCue.BibleBridge.exe'];
 const sourceHashes=Object.fromEntries(await Promise.all(sourceFiles.map(async file=>[file,createHash('sha256').update(await fs.readFile(file)).digest('hex')])));
 let app,report={at:new Date().toISOString(),reference,translation:'KJV',sourceRevision:revision,sourceHashes,actualProPresenterAccess:true,microphoneCapture:false,requestedOutputCommands:0,physicalOutputObserved:false,audibleEndLatencyMeasured:false};
 try{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;app=await _electron.launch({args:[path.resolve('.'),`--user-data-dir=${path.resolve('test-results','hil-detected-'+randomUUID())}`],env});
  const page=await app.firstWindow();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setTitle('VerseCue - Detected Native Acceptance'));
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await page.evaluate(async()=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port:1025,translation:'KJV'});});assert.equal((await page.evaluate(()=>window.versecue.command('test'))).ok,true);
  await page.locator('#setup').click();await page.locator('[data-settings=output]').click();await page.locator('#prepare-missing-detected').check();await page.locator('#close-settings').click();await page.locator('#reference-input').fill(reference);
  assert.equal((await page.evaluate(()=>window.versecue.state())).value.capture.active,false);
  console.log(JSON.stringify({phase:'ready-for-computer-use-review-reference',reference,scope:'personal preparation only; no output'}));
  const deadline=Date.now()+180000;let state,minimized=false,everCapture=false,startedAt=null;
  while(Date.now()<deadline){state=(await page.evaluate(()=>window.versecue.state())).value;everCapture||=state.capture.active;if(state.preparation.phase==='preparing'&&!minimized){startedAt=Date.now();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].minimize());minimized=true;}if(state.preparation.phase==='review-required')break;if(['blocked','manual-preparation-required','consent-required'].includes(state.preparation.phase))throw Error(state.preparation.reason??state.preparation.phase);await new Promise(resolve=>setTimeout(resolve,100));}
  assert.equal(state.preparation.phase,'review-required');assert.equal(state.preparation.reference,reference);assert.equal(state.preparation.translation,'KJV');assert.equal(state.mode,'confirm');assert.equal(state.dryRun,true);assert.equal(everCapture,false);assert.equal(state.history.length,0);assert.equal(state.referencePreparation.nativeConsent,true);
  assert.equal(await output(),outputBefore);assert.equal(JSON.stringify(await read(playlistRoute)),playlistBefore);assert.equal(await page.locator('#confirm-passage').isDisabled(),true);assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isMinimized()),true);
  const after=await read(libraryRoute),created=after.items.filter(item=>!beforeIds.has(item.uuid));assert.equal(created.length,1);assert.equal(created[0].uuid,state.preparation.uuid);
  report={...report,passed:true,detectedReferencePreparedWithoutPrepareClick:true,noCaptureLeaseAcquired:true,ownerWindowStayedMinimized:minimized,nativeWorkerMs:state.preparation.nativeWorkerMs??null,nativeStageStartedAtMs:state.preparation.nativeStageStartedAtMs??{},preparationToReviewPollMs:startedAt===null?null:Date.now()-startedAt,clippingWarning:state.preparation.clippingWarning===true,cueCount:state.preparation.cues.length,completeSavedMetadata:state.preparation.coverageComplete===true,newCopyCount:created.length,outputUnchanged:true,sundayPlaylistContentsUnchanged:true,uncheckedConfirmationBlocked:true};
 }catch(error){report={...report,passed:false,error:error.message};try{report.outputUnchanged=await output()===outputBefore;report.sundayPlaylistContentsUnchanged=JSON.stringify(await read(playlistRoute))===playlistBefore;report.newCopyCount=(await read(libraryRoute)).items.filter(item=>!beforeIds.has(item.uuid)).length;}catch{report.postFailureInspectionUnavailable=true;}process.exitCode=1;}
 finally{await fs.mkdir(path.dirname(reportPath),{recursive:true});await fs.writeFile(reportPath,JSON.stringify(report,null,2),{flag:'wx'});console.log(JSON.stringify(report));await app?.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
