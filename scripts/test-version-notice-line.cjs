'use strict';
// Version-switch notices (NR-018) must appear on the main message line, not only inside the closed Settings dialog.
// No microphone or ProPresenter: the words go through the same path speech uses.
const {_electron}=require('playwright'),path=require('node:path'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
(async()=>{
 const executable=process.argv[2]?path.resolve(process.argv[2]):null;const env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
 const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve(__dirname,'..')]),`--user-data-dir=${path.resolve(__dirname,'..','test-results','notice-'+randomUUID())}`],env});
 try{
  const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
  assert.equal(await page.evaluate(()=>document.getElementById('settings-dialog').open),false,'Settings is closed');
  const r=await page.evaluate(()=>window.versecue.command('ingest',{text:'switch to NIV'}));assert.equal(r.ok,true,r.error);assert.equal(r.value.length,0,'no reference is queued');
  await page.waitForFunction(()=>/no recent passage to switch to NIV/.test(document.getElementById('message').textContent),null,{timeout:5000});
  const visible=await page.evaluate(()=>{const m=document.getElementById('message'),r=m.getBoundingClientRect();return r.width>0&&r.height>0&&!m.closest('dialog');});
  assert.equal(visible,true,'the notice is on the visible main message line');
  console.log('Version notice shown on the main message line with Settings closed.');
 }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
