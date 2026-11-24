'use strict';
// VerseCue keeps working while minimized or hidden (2026-11-24): the window's timers keep their full rate and the page
// stays visible to itself, so audio windows, Hold timers, Auto and preparation keep running. Speech while minimized is
// covered by test-background-quotes.cjs.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const exe=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(exe?{executablePath:exe}:{}),args:[...(exe?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','minimized-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const measure=()=>page.evaluate(()=>new Promise(resolve=>{let ticks=0;const t=setInterval(()=>ticks++,50);setTimeout(()=>{clearInterval(t);resolve({ticks,hidden:document.hidden});},2000);}));
    const normal=await measure();
    await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].minimize());await new Promise(r=>setTimeout(r,800));
    const minimized=await measure();
    await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.restore();w.hide();});await new Promise(r=>setTimeout(r,800));
    const hidden=await measure();
    await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].show());
    for(const [name,m] of Object.entries({minimized,hidden})){assert.equal(m.hidden,false,name+': page stays visible to itself');assert.ok(m.ticks>=normal.ticks*0.8,name+': timers keep their rate ('+m.ticks+' vs '+normal.ticks+')');}
    const switches=await app.evaluate(({app})=>['disable-backgrounding-occluded-windows','disable-renderer-backgrounding'].filter(s=>app.commandLine.hasSwitch(s)));
    assert.deepEqual(switches,['disable-backgrounding-occluded-windows','disable-renderer-backgrounding']);
    console.log(JSON.stringify({minimizedOperation:'passed',ticksPer2s:{normal:normal.ticks,minimized:minimized.ticks,hidden:hidden.ticks}},null,2));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
