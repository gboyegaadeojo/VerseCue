'use strict';
const {_electron}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');
(async()=>{
  const packagedIndex=process.argv.indexOf('--packaged');const executable=packagedIndex>=0?path.resolve(process.argv[packagedIndex+1]):null;
  const profile=path.resolve(executable?'test-results/packaged-profile':'test-results/desktop-profile');await fs.mkdir(profile,{recursive:true});
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const electron=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),`--user-data-dir=${profile}`],env,timeout:30000});
  const errors=[];let network=[];
  try{
    const page=await electron.firstWindow();page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
    await page.waitForFunction(()=>document.querySelector('#message').textContent.length>0);
    assert.match(await page.title(),/VerseCue/);
    const initial=await page.evaluate(()=>window.versecue.state());assert.equal(initial.ok,true);assert.equal(initial.value.dryRun,true);
    await page.locator('#reference-input').fill('John chapter three verse sixteen');await page.locator('#reference-form button').click();
    await page.waitForFunction(()=>document.querySelector('#reference').textContent==='John 3:16');
    await page.screenshot({path:'test-results/desktop-candidate.png',fullPage:true});
    await page.locator('#show').click();await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('zero output requests'));
    assert.match(await page.locator('#history').innerText(),/Simulated/);
    await page.locator('#reference-input').fill('John 3:99');await page.locator('#reference-form button').click();
    await page.waitForFunction(()=>document.querySelector('#reference').textContent==='John 3:99');
    assert.equal(await page.locator('#show').isDisabled(),true);assert.equal(await page.locator('#prepare-candidate').isDisabled(),true);
    await page.locator('#reference-input').fill('Romans 8:28');await page.locator('#reference-form button').click();
    await page.waitForFunction(()=>document.querySelector('#reference').textContent==='Romans 8:28');
    await page.locator('#next-verse').click();await page.waitForFunction(()=>document.querySelector('#reference').textContent==='Romans 8:29');
    await page.locator('#previous-verse').click();await page.waitForFunction(()=>document.querySelector('#reference').textContent==='Romans 8:28');
    await page.locator('#stop').click();await page.waitForFunction(()=>!document.querySelector('#resume').hidden);
    assert.equal((await page.evaluate(()=>window.versecue.state())).value.stopped,true);
    await page.locator('#resume').click();await page.locator('#setup').click();
    await page.waitForFunction(()=>document.querySelector('#settings-dialog').open);
    await page.screenshot({path:'test-results/desktop-setup.png',fullPage:true});
    await page.locator('#profile-name').fill('SYNTHETIC UI Smoke');await page.locator('#profile-save').click();
    await page.waitForFunction(()=>[...document.querySelector('#profile-select').options].some(option=>option.text==='SYNTHETIC UI Smoke'));
    await page.locator('#profile-select').selectOption({label:'SYNTHETIC UI Smoke'});
    const enabled=await page.evaluate(()=>window.versecue.startPrivateApi({allowPreparedSend:false}));assert.equal(enabled.ok,true);
    await page.locator('#profile-load').click();await page.waitForFunction(()=>document.querySelector('#setup-message').textContent.startsWith('Profile loaded.'));
    const loadedProfile=await page.evaluate(()=>window.versecue.state());assert.equal(loadedProfile.value.mode,'paused');assert.equal(loadedProfile.value.dryRun,true);assert.equal((await page.evaluate(()=>window.versecue.privateApiStatus())).value.enabled,false);
    await page.locator('#profile-remove').click();await page.waitForFunction(()=>![...document.querySelector('#profile-select').options].some(option=>option.text==='SYNTHETIC UI Smoke'));
    const props=await electron.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().map(w=>w.webContents.getLastWebPreferences()));
    assert.ok(props.every(p=>p.contextIsolation&&p.sandbox&&!p.nodeIntegration));
    assert.equal(await page.evaluate(()=>typeof window.require),'undefined');
    await page.locator('#close-settings').click();
    const compactPromise=electron.waitForEvent('window');await page.locator('#compact').click();
    const compact=await compactPromise;await compact.waitForLoadState();
    await compact.waitForFunction(()=>document.body.classList.contains('compact'));
    await page.locator('#reference-input').fill('Romans 8:29');await page.locator('#reference-form button').click();
    await compact.waitForFunction(()=>document.querySelector('#reference').textContent==='Romans 8:29');
    await compact.screenshot({path:'test-results/desktop-compact.png',fullPage:true});
    await compact.locator('#stop').click();await page.waitForFunction(()=>!document.querySelector('#resume').hidden);
    await page.locator('#setup').click();await page.locator('[data-settings=advanced]').click();await page.locator('#private-api-enable').click();
    const localApi=await page.evaluate(()=>window.versecue.privateApiStatus());assert.equal(localApi.value.enabled,true);assert.equal(localApi.value.allowPreparedSend,false);
    assert.equal((await fetch(`http://127.0.0.1:${localApi.value.port}/v1/status`)).status,401);
    await page.locator('#private-api-disable').click();assert.equal((await page.evaluate(()=>window.versecue.privateApiStatus())).value.enabled,false);
    await page.locator('#close-settings').click();await page.evaluate(()=>window.versecue.command('resume'));
    const captureOwner=await page.evaluate(()=>window.versecue.beginAudio({authorized:true}));assert.equal(captureOwner.ok,true);
    assert.equal((await compact.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,false);
    assert.equal((await compact.evaluate(()=>window.versecue.audio(new Array(3200).fill(0)))).ok,false);
    await compact.evaluate(()=>window.versecue.endAudio());assert.equal((await page.evaluate(()=>window.versecue.state())).value.capture.active,true);
    await compact.evaluate(()=>window.versecue.command('stop'));assert.equal((await page.evaluate(()=>window.versecue.state())).value.capture.active,false);
    await page.evaluate(()=>window.versecue.command('resume'));assert.equal((await compact.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    await compact.close();await page.waitForFunction(async()=>!(await window.versecue.state()).value.capture.active);
    // SYNTHETIC oscillator checks worklet transport only. No mic permission or
    // speaker playback; a zero-gain destination keeps this signal inaudible.
    const worklet=await page.evaluate(async()=>{
      const context=new AudioContext({sampleRate:48000});await context.audioWorklet.addModule('capture-worklet.js');
      const source=context.createOscillator();source.frequency.value=440;const capture=new AudioWorkletNode(context,'versecue-capture',{processorOptions:{channel:0}});const mute=context.createGain();mute.gain.value=0;source.connect(capture);capture.connect(mute);mute.connect(context.destination);source.start();
      try{return await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Worklet timeout')),3000);capture.port.onmessage=e=>{clearTimeout(timer);resolve({count:e.data.samples?.length,rms:e.data.rms,error:e.data.error??null});};});}finally{source.stop();await context.close();}
    });assert.equal(worklet.error,null);assert.ok(worklet.count>=1600&&worklet.count<1700);assert.ok(worklet.rms>.1);
    await page.evaluate(()=>{document.body.style.zoom='2';});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);assert.equal(overflow,false,'Full UI must not overflow horizontally at 200% text zoom');
    await page.locator('#setup').click();await page.waitForFunction(()=>document.querySelector('#settings-dialog').open);
    const dialogOverflow=await page.evaluate(()=>{const dialog=document.querySelector('#settings-dialog');return dialog.scrollWidth>dialog.clientWidth+2;});assert.equal(dialogOverflow,false,'Setup must not overflow horizontally at 200% text zoom');
    assert.equal(network.length,0);assert.deepEqual(errors,[]);
    const report={appVersion:await electron.evaluate(({app})=>app.getVersion()),passed:true,at:new Date().toISOString(),runtime:await electron.evaluate(()=>({...process.versions})),checks:['startup dry run','manual canonical reference','simulated send','history receipt wording','emergency stop/rearm','setup dialog','context isolation/sandbox/no Node','compact shared state/stop','zero renderer HTTP requests','SYNTHETIC silent worklet transport','200% full-window horizontal fit'],pageErrors:errors,rendererHttpRequests:network.length};
    report.checks.push('invalid KJV action blocking','latest candidate selection','review-only previous/next verse','profile save/load/delete and API revocation','exclusive full/compact capture ownership','nonowner audio rejection','owner close and cross-window stop revoke capture','200% setup dialog horizontal fit');
    report.packaged=Boolean(executable);if(executable){const setup=await page.evaluate(()=>window.versecue.settings());assert.ok(setup.value.executable.endsWith('whisper-cli.exe'));assert.ok(setup.value.model.endsWith('ggml-base.en.bin'));report.bundledSpeechDetected=true;}
    await fs.writeFile(executable?'test-results/packaged-smoke.json':'test-results/desktop-smoke.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }finally{await electron.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
