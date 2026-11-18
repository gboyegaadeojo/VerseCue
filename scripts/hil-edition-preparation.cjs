'use strict';
// Authorized personal-host preparation only. Activate the product action with
// Computer Use after reviewing its visible reference and edition. No output.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID,createHash}=require('node:crypto');
(async()=>{
 if(!process.argv.includes('--authorized-personal-host'))throw Error('Explicit personal-host authorization required');
 const translation=process.argv.find(arg=>arg.startsWith('--translation='))?.split('=')[1]??'ASV';if(!['ASV','KJV'].includes(translation))throw Error('This acceptance fixture covers installed ASV/KJV only');
 const read=async route=>{const r=await fetch('http://127.0.0.1:1025'+route,{signal:AbortSignal.timeout(2000)});assert.equal(r.ok,true);return r.json();};
 const output=async()=>JSON.stringify(await Promise.all([read('/v1/presentation/slide_index'),read('/v1/status/slide')]));
 const before=await output(),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 let app,report={at:new Date().toISOString(),translation,reference:'Hosea 1:1',actualProPresenterAccess:true,microphoneCapture:false,requestedOutputCommands:0,physicalOutputObserved:false};
 try{
  app=await _electron.launch({args:[path.resolve('.'),`--user-data-dir=${path.resolve('test-results','hil-edition-'+randomUUID())}`],env});
  const page=await app.firstWindow();await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setTitle('VerseCue - Edition Preparation Acceptance'));
  await page.waitForFunction(()=>document.getElementById('message').textContent.length>0);
  await page.evaluate(async translation=>{const s=await window.versecue.settings();await window.versecue.saveSettings({...s.value,host:'127.0.0.1',port:1025,translation});},translation);
  assert.equal((await page.evaluate(()=>window.versecue.command('test'))).ok,true);
  await page.locator('#setup').click();await page.locator('[data-settings=advanced]').click();await page.locator('#native-preparation-consent').check();await page.locator('#native-preparation-reference').fill(report.reference);
  console.log(JSON.stringify({phase:'ready-for-computer-use-preparation',translation,reference:report.reference}));
  const deadline=Date.now()+180000;let complete=false;
  while(Date.now()<deadline){const state=(await page.evaluate(()=>window.versecue.state())).value;if(state.events.some(row=>row.code==='NATIVE_BIBLE_PREPARED_REVIEW')){complete=true;break;}const text=await page.locator('#setup-message').textContent();if(/Preparation not verified|timed out|could not/i.test(text))throw Error(text);await new Promise(resolve=>setTimeout(resolve,200));}
  assert.equal(complete,true,'Product preparation completed');const state=(await page.evaluate(()=>window.versecue.state())).value;
  assert.equal(state.mode,'paused');assert.equal(state.dryRun,true);assert.equal(await output(),before,'Preparation must leave API output identity and text unchanged');
  report={...report,passed:true,pausedDisarmedDryRun:true,outputUnchanged:true,outputBeforeSha256:createHash('sha256').update(before).digest('hex')};console.log(JSON.stringify(report));
 }catch(error){report={...report,passed:false,error:error.message};console.error(JSON.stringify(report));process.exitCode=1;}
 finally{await fs.mkdir('poc/private/acceptance-2026-11-18',{recursive:true});await fs.writeFile(`poc/private/acceptance-2026-11-18/edition-${translation}.json`,JSON.stringify(report,null,2));await app?.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
