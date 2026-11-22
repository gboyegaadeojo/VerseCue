'use strict';
// NR-019: help mode explains the controls of each page and the Settings sections; the guided tour runs on first launch
// (never in automated runs). Help only explains: it never sends, arms or changes settings.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const exe=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(exe?{executablePath:exe}:{}),args:[...(exe?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','help-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.setViewportSize({width:1440,height:900});await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await page.waitForTimeout(2000);assert.equal(await page.locator('.tour-card').count(),0,'no tour in automated runs');
    const before=JSON.stringify((await page.evaluate(()=>window.versecue.settings())).value);
    await page.locator('.header-actions .help-toggle').click();
    const workspace=await page.locator('.help-marker').count();assert.ok(workspace>=6,'workspace markers: '+workspace);
    assert.match(await page.locator('.help-panel').textContent(),/Emergency stop/);
    await page.locator('.help-marker').nth(1).click();assert.match(await page.locator('.help-pop').textContent(),/Live/);
    await page.locator('.help-panel .help-close').click();assert.equal(await page.locator('.help-marker').count(),0);
    const sections={};
    await page.locator('#setup').click();await page.locator('#settings-dialog .help-toggle').click();
    for(const key of ['profiles','propresenter','audio','speech','output','quotes','advanced']){await page.locator(`[data-settings="${key}"]`).click();await page.waitForTimeout(800);sections[key]=await page.locator('#settings-dialog .help-marker').count();assert.ok(sections[key]>=1,key+' has explanations');}
    await page.locator('#close-settings').click();
    await page.evaluate(()=>window.versecueHelp.tour());await page.waitForSelector('.tour-card');
    let steps=0;while(await page.locator('.tour-card').count()){steps++;await page.locator('.tour-next').click();if(steps>12)break;}
    assert.ok(steps>=4&&steps<=6,'tour steps '+steps);assert.equal(await page.evaluate(()=>localStorage.getItem('versecue.tourSeen')),'1');
    const state=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(state.history.length,0);assert.equal(state.dryRun,true);
    assert.equal(JSON.stringify((await page.evaluate(()=>window.versecue.settings())).value),before,'help never changes settings');
    console.log(JSON.stringify({passed:true,packaged:!!exe,workspaceMarkers:workspace,settingsMarkers:sections,tourSteps:steps,noTourInAutomation:true,outputRequests:0},null,2));
  }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
