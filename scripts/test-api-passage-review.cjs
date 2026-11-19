'use strict';
// Own Electron app and SYNTHETIC target only. No real clipboard, microphone or ProPresenter.
const {_electron}=require('playwright'),http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 const executable=process.argv[2]?path.resolve(process.argv[2]):null,uuid='75631f63-da79-419c-b862-c9b8338081f9',library='5e4da747-cf19-4810-8d4d-b6fe1a7d9350';
 let triggers=0;
 const server=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url==='/version')return res.end(JSON.stringify({host_description:'ProPresenter SYNTHETIC API review'}));
  if(req.url==='/v1/libraries')return res.end(JSON.stringify([{uuid:library,name:'SYNTHETIC'}]));
  if(req.url==='/v1/library/'+library)return res.end(JSON.stringify({update_type:'all',items:[{uuid,name:'Hosea 1_1 (KJV)'}]}));
  if(req.url==='/v1/presentation/'+uuid)return res.end(JSON.stringify({presentation:{id:{uuid,name:'Hosea 1_1 (KJV)'},destination:'presentation',has_timeline:false,groups:[{slides:[{enabled:true,label:'Hosea 1:1',text:'SYNTHETIC passage for API review'}]}]}}));
  if(req.url==='/v1/presentation/'+uuid+'/0/trigger'){triggers++;res.writeHead(204);return res.end();}
  if(req.url.endsWith('/slide_index'))return res.end(JSON.stringify({presentation_index:triggers?{presentation_id:{uuid},index:0}:null}));
  if(req.url.endsWith('/status/slide'))return res.end(JSON.stringify({current:{text:triggers?'SYNTHETIC passage for API review':''}}));
  res.writeHead(404);res.end('{}');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;let app;
 try{
  app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${path.resolve('test-results','api-review-'+randomUUID())}`],env});
  // Intercept this isolated app's token-copy sink; never touch or read the OS clipboard.
  await app.evaluate(({clipboard})=>{clipboard.writeText=text=>{global.__apiReviewTestToken=text;};});
  const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.waitForSelector('#prepare-passage',{state:'attached'});
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await page.evaluate(async port=>{const settings=await window.versecue.settings();const saved=await window.versecue.saveSettings({...settings.value,host:'127.0.0.1',port});if(!saved.ok)throw Error(saved.error);const tested=await window.versecue.command('test');if(!tested.ok)throw Error(tested.error);},server.address().port);
  const api=await page.evaluate(()=>window.versecue.startPrivateApi({}));assert.equal(api.ok,true);
  await page.evaluate(()=>window.versecue.copyPrivateApiToken());
  const token=await app.evaluate(()=>global.__apiReviewTestToken),base=`http://127.0.0.1:${api.value.port}`;
  const request=(route,body)=>fetch(base+route,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  assert.equal((await (await request('/v1/status')).json()).capabilities.savedPassageReview,true);
  const submitted=await request('/v1/references',{text:'Hosea 1:1'});assert.equal(submitted.status,201);
  const {candidates}=await submitted.json(),reviewed=await request('/v1/passages/review',{candidateId:candidates[0].id});assert.equal(reviewed.status,200);
  const review=await reviewed.json();assert.equal(review.phase,'review-required');assert.equal(review.confirmationOrigin,'desktop-only');assert.equal(review.outputRequests,0);assert.equal(triggers,0);
  await page.waitForFunction(()=>document.getElementById('passage-previews').textContent.includes('SYNTHETIC passage for API review'));
  assert.equal(await page.locator('#confirm-passage').isEnabled(),false);
  assert.equal((await request('/v1/passages/confirm',{reviewToken:review.reviewToken,confirm:true})).status,404);
  assert.equal((await request('/v1/send',{candidateId:candidates[0].id,confirmReference:'Hosea 1:1',confirm:true})).status,403);
  assert.equal(triggers,0);
  await page.locator('#passage-verified').check();await page.locator('#passage-test-consent').check();await page.locator('#confirm-passage').click();
  await page.waitForFunction(()=>document.getElementById('passage-ready-status').textContent.includes('matching readback was received'));assert.equal(triggers,1);
  const again=await request('/v1/references',{text:'Hosea 1:1'}),next=await again.json();
  assert.equal((await request('/v1/passages/review',{candidateId:next.candidates[0].id})).status,200);
  await page.reload();await page.waitForSelector('#prepare-passage',{state:'attached'});
  const state=(await page.evaluate(()=>window.versecue.state())).value;
  assert.equal(state.mode,'paused');assert.equal(state.preparation.phase,'canceled');
  assert.equal((await page.evaluate(()=>window.versecue.privateApiStatus())).value.enabled,false);
  await assert.rejects(request('/v1/status'));assert.equal(triggers,1);assert.deepEqual(errors,[]);
  const report={at:new Date().toISOString(),version:await app.evaluate(({app})=>app.getVersion()),passed:true,packaged:!!executable,sharedCoordinatorReview:true,noNativeFocusOrCopyConsentViaApi:true,desktopAppearanceAndTargetConfirmationRequired:true,reviewOwnerReloadRevokedApi:true,realClipboardAccess:false,fakeTargetTriggers:triggers,actualProPresenterAccess:false,microphoneCapture:false};
  await fs.writeFile(`test-results/${executable?'packaged-':''}api-passage-review.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
