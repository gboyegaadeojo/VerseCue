'use strict';
// Windows: VerseCue started from a lowercase drive path ("c:\...") must still trust its own window.
// Chromium reports the page as file:///C:/..., so a text comparison refused every request ("Untrusted caller").
// No microphone or ProPresenter: listening starts against the automation audio path only.
const {_electron}=require('playwright'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const lowerDrive=p=>p.replace(/^([A-Z]):/,(_,d)=>d.toLowerCase()+':');
(async()=>{
 if(process.platform!=='win32'){console.log('Drive-letter case check applies to Windows only; skipped.');return;}
 const executable=process.argv[2]?lowerDrive(path.resolve(process.argv[2])):null,source=lowerDrive(path.resolve(__dirname,'..'));
 assert.match(executable??source,/^[a-z]:/,'the launch path starts with a lowercase drive letter');
 const env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
 const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[source]),`--user-data-dir=${path.resolve(__dirname,'..','test-results','drive-case-'+randomUUID())}`],env});
 try{
  const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
  assert.doesNotMatch(await page.textContent('#message'),/Untrusted caller/);
  const settings=await page.evaluate(()=>window.versecue.settings());assert.equal(settings.ok,true,settings.error);
  const begin=await page.evaluate(()=>window.versecue.beginAudio({authorized:true}));assert.equal(begin.ok,true,begin.error);
  console.log('Started from a lowercase drive path: the window is trusted and listening can start.');
 }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
