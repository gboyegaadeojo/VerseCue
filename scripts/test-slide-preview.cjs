'use strict';
// SYNTHETIC saved text/image and target. No actual ProPresenter or microphone.
const {_electron}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto'),png=require('../tests/support/synthetic-thumbnail.cjs');
(async()=>{
 const executable=process.argv[2]?path.resolve(process.argv[2]):null,uuid='75631f63-da79-419c-b862-c9b8338081f9',library='5e4da747-cf19-4810-8d4d-b6fe1a7d9350';let triggers=0,thumbnailReads=0,changed=false;
 const server=http.createServer((req,res)=>{
  if(req.url.startsWith('/v1/presentation/'+uuid+'/thumbnail/')){thumbnailReads++;res.setHeader('Content-Type','image/png');return res.end(png);}
  res.setHeader('Content-Type','application/json');if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter SYNTHETIC previews'}));
  if(req.url==='/v1/libraries')return res.end(JSON.stringify([{uuid:library,name:'SYNTHETIC'}]));
  if(req.url==='/v1/library/'+library)return res.end(JSON.stringify({update_type:'all',items:[{uuid,name:'Hosea 1_1 (KJV)'}]}));
  if(req.url==='/v1/presentation/'+uuid)return res.end(JSON.stringify({presentation:{id:{uuid,name:'Hosea 1_1 (KJV)'},destination:'presentation',has_timeline:false,groups:[{slides:[0,1].map(index=>({enabled:true,label:'Hosea 1:1',text:changed?'CHANGED METADATA':'SYNTHETIC part '+(index+1)}))}]}}));
  if(req.url.endsWith('/trigger')){triggers++;res.writeHead(204);return res.end();}res.writeHead(404);res.end('{}');
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;let app;
 try{
  app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${path.resolve('test-results','slide-preview-'+randomUUID())}`],env});
  const page=await app.firstWindow(),errors=[];let rendererHttp=0;page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))rendererHttp++;});
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await page.evaluate(async port=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port});await window.versecue.command('test');},server.address().port);
  await page.locator('#reference-input').fill('Hosea 1:1');await page.locator('#reference-form button').click();await page.locator('#prepare-passage').click();await page.waitForSelector('#saved-preview-load',{state:'visible'});
  assert.equal(thumbnailReads,0);await page.locator('#saved-preview-load').click();await page.waitForFunction(()=>document.getElementById('saved-slide-image').naturalWidth===16);
  assert.equal(await page.locator('#saved-slide-preview').isVisible(),true);assert.match(await page.locator('#saved-slide-preview figcaption').innerText(),/Check actual screens and Looks/);assert.equal(triggers,0);assert.equal(rendererHttp,0);assert.equal(await page.locator('#confirm-passage').isEnabled(),false);
  await page.locator('#saved-preview-part').selectOption('1');assert.equal(await page.locator('#saved-slide-preview').isVisible(),false);await page.locator('#saved-preview-load').click();await page.waitForFunction(()=>document.getElementById('saved-slide-image').naturalWidth===16);assert.equal(thumbnailReads,2);
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(2));await page.waitForTimeout(150);assert.equal(await page.locator('#passage-workflow').evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
  changed=true;await page.locator('#saved-preview-load').click();await page.waitForFunction(()=>document.getElementById('passage-ready-status').textContent.includes('Saved passage changed'));assert.equal(await page.locator('#saved-slide-preview').isVisible(),false);assert.equal(thumbnailReads,2);assert.equal(triggers,0);assert.deepEqual(errors,[]);
  const report={at:new Date().toISOString(),version:await app.evaluate(({app})=>app.getVersion()),passed:true,packaged:!!executable,previewFromSyntheticProPresenter:true,readOnlyOnDemand:true,partSelectionWorks:true,changedMetadataInvalidatedReview:true,previewDoesNotGrantConfirmation:true,reviewAt200PercentFits:true,rendererHttpRequests:rendererHttp,thumbnailReads,outputTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};
  await fs.writeFile(`test-results/${executable?'packaged-':''}slide-preview.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
