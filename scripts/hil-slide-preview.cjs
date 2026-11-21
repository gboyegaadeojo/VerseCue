'use strict';
// Personal-host READ-ONLY saved-slide preview. No native preparation, output or mic.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID,createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
(async()=>{
 if(!process.argv.includes('--authorized-personal-host'))throw Error('Personal-host authorization required');
 const dir='poc/private/acceptance-2026-11-19',reportPath=path.join(dir,'saved-slide-preview.json');try{await fs.access(reportPath);throw Error('Read-only preview attempt already recorded');}catch(error){if(error.code!=='ENOENT')throw error;}
 const read=async route=>{const r=await fetch('http://127.0.0.1:1025'+route,{signal:AbortSignal.timeout(2000)});assert.equal(r.ok,true);return r.json();};
 const output=async()=>JSON.stringify(await Promise.all([read('/v1/presentation/slide_index'),read('/v1/status/slide')]));
 const before=await output(),focused=await read('/v1/playlist/focused');assert.equal(focused.playlist?.name,'Sunday Service');const playlistRoute='/v1/playlist/'+focused.playlist.uuid,playlist=JSON.stringify(await read(playlistRoute));
 let app,report={at:new Date().toISOString(),reference:'Nahum 1:7',translation:'KJV',sourceRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),actualProPresenterAccess:true,microphoneCapture:false,requestedOutputCommands:0,nativePreparationRequested:false,physicalOutputObserved:false};
 try{
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;app=await _electron.launch({args:[path.resolve('.'),`--user-data-dir=${path.resolve('test-results','hil-preview-'+randomUUID())}`],env});const page=await app.firstWindow();
  const errors=[];let rendererHttp=0;page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))rendererHttp++;});
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);await page.evaluate(async()=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port:1025,translation:'KJV'});await window.versecue.command('test');});
  await page.locator('#reference-input').fill(report.reference);await page.locator('#reference-form button').click();await page.locator('#prepare-passage').click();await page.waitForSelector('#saved-preview-load',{state:'visible'});await page.locator('#saved-preview-load').click();await page.waitForFunction(()=>document.getElementById('saved-slide-image').naturalWidth>0);
  const image=await page.locator('#saved-slide-image').evaluate(node=>({width:node.naturalWidth,height:node.naturalHeight,dataUrl:node.src}));assert.equal(image.dataUrl.startsWith('data:image/png;base64,'),true);
  const state=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(state.capture.active,false);assert.equal(state.history.length,0);assert.equal(state.dryRun,true);assert.equal(state.events.some(event=>event.code==='NATIVE_BIBLE_PREPARED_REVIEW'),false);assert.equal(await page.locator('#confirm-passage').isEnabled(),false);assert.equal(await output(),before);assert.equal(JSON.stringify(await read(playlistRoute)),playlist);assert.equal(rendererHttp,0);assert.deepEqual(errors,[]);
  await fs.mkdir(dir,{recursive:true});await page.locator('#saved-slide-preview').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,'saved-slide-preview-ui.png')});
  report={...report,passed:true,previewFromInstalledProPresenter:true,pngWidth:image.width,pngHeight:image.height,pngSha256:createHash('sha256').update(Buffer.from(image.dataUrl.slice('data:image/png;base64,'.length),'base64')).digest('hex'),rendererHttpRequests:rendererHttp,outputUnchanged:true,sundayPlaylistContentsUnchanged:true,uncheckedConfirmationBlocked:true,appearanceOrPhysicalFidelityVerified:false};
 }catch(error){report={...report,passed:false,error:error.message};process.exitCode=1;}
 finally{await fs.mkdir(dir,{recursive:true});await fs.writeFile(reportPath,JSON.stringify(report,null,2),{flag:'wx'});console.log(JSON.stringify(report));await app?.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
