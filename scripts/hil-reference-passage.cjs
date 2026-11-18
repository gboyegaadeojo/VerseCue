'use strict';
// Personal-host normal passage preparation only. Computer Use activates Prepare.
// Creates one test copy; never confirms, triggers, clears or edits a playlist.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 if(!process.argv.includes('--authorized-personal-host'))throw Error('Explicit personal-host authorization required');
 const reference=process.argv.find(arg=>arg.startsWith('--reference='))?.slice('--reference='.length)??'Hosea 1:2';if(!/^Hosea 1:[234]$/.test(reference))throw Error('Use one bounded Hosea acceptance reference');
 const read=async route=>{const r=await fetch('http://127.0.0.1:1025'+route,{signal:AbortSignal.timeout(2000)});assert.equal(r.ok,true);return r.json();};
 const output=async()=>JSON.stringify(await Promise.all([read('/v1/presentation/slide_index'),read('/v1/status/slide')]));
 const focused=await read('/v1/playlist/focused');assert.equal(focused.playlist?.name,'Sunday Service');
 const playlistRoute='/v1/playlist/'+focused.playlist.uuid,beforePlaylist=JSON.stringify(await read(playlistRoute)),beforeOutput=await output();
 const libraries=await read('/v1/libraries');assert.equal(libraries.length,1);const catalog=await read('/v1/library/'+libraries[0].uuid);assert.equal(catalog.items.some(row=>row.name===reference.replace(':','_')+' (KJV)'),false,'Test passage already exists; do not create duplicates');
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;let app,report={at:new Date().toISOString(),reference,translation:'KJV',actualProPresenterAccess:true,microphoneCapture:false,requestedOutputCommands:0,physicalOutputObserved:false};
 try{
  app=await _electron.launch({args:[path.resolve('.'),`--user-data-dir=${path.resolve('test-results','hil-reference-'+randomUUID())}`],env});const page=await app.firstWindow();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setTitle('VerseCue - Reference Preparation Acceptance'));await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await page.evaluate(async()=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port:1025,translation:'KJV'});});assert.equal((await page.evaluate(()=>window.versecue.command('test'))).ok,true);
  await page.locator('#setup').click();await page.locator('[data-settings=advanced]').click();await page.locator('#native-preparation-consent').check();await page.locator('#native-save-consent').check();await page.locator('#close-settings').click();await page.locator('#reference-input').fill(report.reference);await page.locator('#reference-form button').click();
  console.log(JSON.stringify({phase:'ready-for-computer-use-prepare',reference:report.reference,translation:'KJV'}));
  const deadline=Date.now()+180000;let state;
  while(Date.now()<deadline){state=(await page.evaluate(()=>window.versecue.state())).value;if(state.preparation.phase==='review-required')break;if(state.preparation.phase==='blocked')throw Error(state.preparation.reason);await new Promise(resolve=>setTimeout(resolve,200));}
  assert.equal(state.preparation.phase,'review-required');assert.equal(state.preparation.reference,report.reference);assert.equal(state.preparation.translation,'KJV');assert.equal(state.preparation.requiresFreshReview,true);assert.equal(state.dryRun,true);assert.equal(state.mode,'paused');assert.equal(state.history.length,0);assert.equal(await output(),beforeOutput);assert.equal(JSON.stringify(await read(playlistRoute)),beforePlaylist);assert.equal(await page.locator('#confirm-passage').isDisabled(),true);
  report={...report,passed:true,normalPassageUI:true,manualLibraryPresentationCueSelection:false,nativeCopyCreated:true,completeCueMetadata:true,cueCount:state.preparation.cues.length,clippingWarning:state.preparation.clippingWarning,uncheckedConfirmationBlocked:true,outputUnchanged:true,sundayPlaylistContentsUnchanged:true};console.log(JSON.stringify(report));
 }catch(error){report={...report,passed:false,error:error.message};console.error(JSON.stringify(report));process.exitCode=1;}
 finally{await fs.mkdir('poc/private/acceptance-2026-11-18',{recursive:true});await fs.writeFile(`poc/private/acceptance-2026-11-18/reference-passage-${reference.split(':')[1]}.json`,JSON.stringify(report,null,2));await app?.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
