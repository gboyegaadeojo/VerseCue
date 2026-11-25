'use strict';
// SYNTHETIC: a local stand-in for GitHub's release list on 127.0.0.1. Nothing is downloaded and the browser is not opened.
// Checks the notice appears for a newer version, hides while listening, opens only VerseCue's releases page, and
// "Not now" remembers the version. The request carries only a generic user agent.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http'),{randomUUID}=require('node:crypto');
(async()=>{
  const requests=[];
  const server=http.createServer((req,res)=>{requests.push({url:req.url,headers:req.headers});res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify([{tag_name:'v99.0.0',draft:false,prerelease:true,html_url:'https://example.invalid/not-used'},{tag_name:'v0.0.1',draft:false}]));});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env,VERSECUE_AUTOMATION:'1',VERSECUE_TEST_UPDATE_URL:`http://127.0.0.1:${server.address().port}/releases`};delete env.ELECTRON_RUN_AS_NODE;
  const profile=path.resolve('test-results','update-notice-'+randomUUID());
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+profile],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await app.evaluate(({shell})=>{globalThis.opened=[];shell.openExternal=async url=>{globalThis.opened.push(url);};});
    await page.waitForFunction(()=>!document.getElementById('update-notice').hidden,null,{timeout:15000});
    assert.match(await page.locator('#update-notice-text').textContent(),/VerseCue 99\.0\.0 is available/);
    await page.screenshot({path:path.resolve('test-results',executable?'packaged-update-notice.png':'update-notice.png')});
    assert.equal(requests.length,1,'One request at start');assert.equal(requests[0].url,'/releases');
    assert.equal(requests[0].headers['user-agent'],'VerseCue');assert.equal(requests[0].headers.cookie,undefined);
    // While listening the notice is hidden and a manual check waits.
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    await page.waitForFunction(()=>document.getElementById('update-notice').hidden);
    const locked=await page.evaluate(()=>window.versecue.updateNoticeCheck());assert.equal(locked.ok,false);assert.match(locked.error,/waits until you stop listening/);
    assert.equal((await page.evaluate(()=>window.versecue.endAudio())).ok,true);
    await page.waitForFunction(()=>!document.getElementById('update-notice').hidden);
    // "See what's new" opens VerseCue's own release page, built from the version, not the response's link.
    await page.locator('#update-notice-open').click();await page.waitForFunction(()=>true);
    for(let i=0;i<20&&!(await app.evaluate(()=>globalThis.opened.length));i++)await new Promise(r=>setTimeout(r,100));
    assert.deepEqual(await app.evaluate(()=>globalThis.opened),['https://github.com/gboyegaadeojo/VerseCue/releases/tag/v99.0.0']);
    // "Not now" hides it and is remembered.
    await page.locator('#update-notice-dismiss').click();await page.waitForFunction(()=>document.getElementById('update-notice').hidden);
    const saved=JSON.parse(await fs.readFile(path.join(profile,'settings.json'),'utf8'));assert.equal(saved.dismissedUpdateVersion,'99.0.0');assert.equal(saved.updateNotice,true);
    // Settings shows the result of the last check; Check now makes one more request.
    await page.evaluate(()=>document.querySelector('[data-open-settings]')?.click());
    await page.waitForFunction(()=>/99\.0\.0|latest version/.test(document.getElementById('update-notice-status').textContent));
    const checked=await page.evaluate(()=>window.versecue.updateNoticeCheck());assert.equal(checked.ok,true);assert.equal(checked.value.available,null,'Dismissed version stays hidden');assert.equal(requests.length,2);
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,noticeShown:true,hiddenWhileListening:true,manualCheckLockedWhileListening:true,opensOwnReleasePageOnly:true,dismissRemembered:true,requests:requests.length,genericUserAgentOnly:true,nothingDownloaded:true,microphoneCapture:false,actualProPresenterAccess:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-update-notice.json':'test-results/update-notice.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
