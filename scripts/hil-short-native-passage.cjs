'use strict';
// PERSONAL DISABLED-SCREEN preparation test. Computer Use starts the native action.
// One bounded new copy; no output, microphone, formatting, Look or playlist edits.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID,createHash}=require('node:crypto');
const {titleReference}=require('../core/bible-passage-plan.cjs');
(async()=>{
 if(!process.argv.includes('--authorized-personal-host'))throw Error('Explicit personal-host authorization required');
 const executable=process.argv.find(arg=>arg.startsWith('--package='))?.slice('--package='.length);if(!executable||!path.isAbsolute(executable))throw Error('Supply the verified absolute review-package executable');
 const variant=process.argv.find(arg=>arg.startsWith('--case='))?.slice('--case='.length)??'baseline',cases={baseline:'John 11:35','popup-profile':'John 11:36'};
 if(!Object.hasOwn(cases,variant))throw Error('Choose a supported bounded test case');
 const reference=cases[variant],recordName='short-native-'+reference.replaceAll(' ','_').replace(':','_')+'.json',dir=path.join('poc/private','acceptance-'+new Date().toISOString().slice(0,10)),record=path.join(dir,recordName);
 await fs.mkdir('poc/private',{recursive:true});
 for(const folder of await fs.readdir('poc/private'))if(/^acceptance-\d{4}-\d{2}-\d{2}$/.test(folder)){try{await fs.access(path.join('poc/private',folder,recordName));throw Error('Attempt already recorded; inspect it instead of repeating');}catch(error){if(error.code!=='ENOENT')throw error;}}
 const read=async route=>{const r=await fetch('http://127.0.0.1:1025'+route,{redirect:'error',signal:AbortSignal.timeout(2500)});assert.equal(r.ok,true);return r.json();};
 const disabled=async()=>{assert.equal(await read('/v1/status/audience_screens'),false);assert.equal(await read('/v1/status/stage_screens'),false);};
 const output=async()=>JSON.stringify(await Promise.all([read('/v1/presentation/slide_index'),read('/v1/status/slide')]));
 await disabled();const version=await read('/version');assert.equal(version.host_description,'ProPresenter 21.4.2');assert.equal(version.platform,'win');
 const lookBefore=JSON.stringify(await read('/v1/look/current'));assert.equal(JSON.parse(lookBefore).id?.name,'Scripture');
 const focused=await read('/v1/playlist/focused');assert.equal(focused.playlist?.name,'Sunday Service');const playlistRoute='/v1/playlist/'+focused.playlist.uuid,playlistBefore=JSON.stringify(await read(playlistRoute)),outputBefore=await output();
 const libraries=await read('/v1/libraries');assert.equal(libraries.length,1);const libraryRoute='/v1/library/'+libraries[0].uuid,before=await read(libraryRoute),beforeIds=new Set(before.items.map(item=>item.uuid));
 assert.equal(before.items.some(item=>titleReference(item.name,'KJV')===reference),false,'Test passage already exists; inspect instead of creating duplicates');
 const manifest=await fs.readFile(path.join(path.dirname(executable),'SHA256-MANIFEST.json')),packageManifestSha256=createHash('sha256').update(manifest).digest('hex');
 let app,report={at:new Date().toISOString(),reference,translation:'KJV',packageManifestSha256,status:'RESERVED_NO_AUTOMATIC_RETRY',actualProPresenterAccess:true,microphoneCapture:false,requestedOutputCommands:0,physicalOutputVerified:false};
 await fs.mkdir(dir,{recursive:true});await fs.writeFile(record,JSON.stringify(report,null,2),{flag:'wx'});
 try{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  app=await _electron.launch({executablePath:executable,args:[`--user-data-dir=${path.resolve('test-results','hil-short-'+randomUUID())}`],env});const page=await app.firstWindow();
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setTitle('VerseCue - Short Native Passage Test'));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
  await page.evaluate(async()=>{const s=(await window.versecue.settings()).value;await window.versecue.saveSettings({...s,host:'127.0.0.1',port:1025,translation:'KJV'});});assert.equal((await page.evaluate(()=>window.versecue.command('test'))).ok,true);
  await page.locator('#setup').click();await page.locator('[data-settings=output]').click();await page.locator('#prepare-missing-detected').check();await page.locator('#close-settings').click();await page.locator('#reference-input').fill(reference);
  assert.equal((await page.evaluate(()=>window.versecue.state())).value.capture.active,false);
  console.log(JSON.stringify({phase:'ready-for-computer-use-review-reference',reference,scope:'one personal native copy; zero output'}));
  const deadline=Date.now()+180000;let state,minimized=false;
  while(Date.now()<deadline){await disabled();assert.equal(JSON.stringify(await read('/v1/look/current')),lookBefore);state=(await page.evaluate(()=>window.versecue.state())).value;if(state.preparation.phase==='preparing'&&!minimized){await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].minimize());minimized=true;}if(state.preparation.phase==='review-required')break;if(['blocked','manual-preparation-required','consent-required'].includes(state.preparation.phase))throw Error(state.preparation.reason??state.preparation.phase);await new Promise(resolve=>setTimeout(resolve,150));}
  assert.equal(state.preparation.phase,'review-required');assert.equal(state.preparation.reference,reference);assert.equal(state.preparation.translation,'KJV');assert.equal(state.capture.active,false);assert.equal(state.history.length,0);assert.equal(state.dryRun,true);assert.equal(state.mode,'confirm');assert.equal(await output(),outputBefore);assert.equal(JSON.stringify(await read(playlistRoute)),playlistBefore);assert.equal(await page.locator('#confirm-passage').isDisabled(),true);
  const created=(await read(libraryRoute)).items.filter(item=>!beforeIds.has(item.uuid));assert.equal(created.length,1);assert.equal(created[0].uuid,state.preparation.uuid);
  if(variant==='popup-profile')assert.equal(Number.isFinite(state.preparation.nativeStageStartedAtMs?.['save-copy-popup-profile-matched']),true,'Exact popup profile was not exercised');
  report={...report,status:'FINISHED',passed:true,uuid:state.preparation.uuid,newCopyCount:1,detectedReferencePreparedWithoutPrepareClick:true,manualLibraryPresentationCueSelection:false,nativeWorkerMs:state.preparation.nativeWorkerMs??null,nativeStageStartedAtMs:state.preparation.nativeStageStartedAtMs??{},cueCount:state.preparation.cues.length,clippingWarning:state.preparation.clippingWarning===true,coverageComplete:state.preparation.coverageComplete===true,ownerWindowMinimized:minimized,outputUnchanged:true,currentLookUnchanged:true,sundayPlaylistContentsUnchanged:true,uncheckedConfirmationBlocked:true};
 }catch(error){report={...report,status:'FAILED_INSPECT_BEFORE_ANY_RETRY',passed:false,error:error.message};if(app)await app.firstWindow().then(page=>page.evaluate(()=>window.versecue.command('stop'))).catch(()=>{});try{report.outputUnchanged=await output()===outputBefore;report.currentLookUnchanged=JSON.stringify(await read('/v1/look/current'))===lookBefore;report.sundayPlaylistContentsUnchanged=JSON.stringify(await read(playlistRoute))===playlistBefore;report.newCopyCount=(await read(libraryRoute)).items.filter(item=>!beforeIds.has(item.uuid)).length;}catch{report.postFailureInspectionUnavailable=true;}process.exitCode=1;}
 finally{await fs.writeFile(record,JSON.stringify(report,null,2));console.log(JSON.stringify(report));await app?.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
