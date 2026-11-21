'use strict';
// SYNTHETIC device list only. No microphone capture, routing change or ProPresenter access.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','loopback-guidance-'+randomUUID())],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    await page.evaluate(()=>{
      const devices=[{kind:'audioinput',deviceId:'synthetic-loopback',label:'Stereo Mix (SYNTHETIC)'},{kind:'audioinput',deviceId:'synthetic-mic',label:'In 1-2 (SYNTHETIC M4)'}];
      navigator.mediaDevices.enumerateDevices=async()=>devices;window.beginAudioCalls=0;const begin=window.versecue.beginAudio;
      const select=document.getElementById('audio-device');for(const d of devices){const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label;select.append(o);}
    });
    assert.equal(await page.evaluate(()=>document.getElementById('audio-route-ack-label').hidden),true);
    await page.locator('#audio-device').selectOption('synthetic-loopback',{force:true});
    assert.match(await page.locator('#audio-route-info').textContent(),/System loopback input/);
    assert.equal(await page.evaluate(()=>document.getElementById('audio-route-ack-label').hidden),false,'Loopback selection asks for a routing check');
    const saved=await page.evaluate(async()=>{const s=(await window.versecue.settings()).value;const r=await window.versecue.saveSettings({...s,audioDevice:'synthetic-loopback'});fillSettings((await window.versecue.settings()).value);return r.ok;});
    assert.equal(saved,true);
    await page.evaluate(()=>{document.getElementById('audio-consent').checked=true;document.getElementById('listen').click();});
    await page.waitForFunction(()=>/system loopback route/.test(document.getElementById('message').textContent));
    assert.equal((await page.evaluate(()=>window.versecue.state())).value.capture.active,false,'Not-ready route never opens capture');
    await page.evaluate(()=>{const ack=document.getElementById('audio-route-ack');ack.checked=true;ack.dispatchEvent(new Event('change'));document.getElementById('listen').click();});
    // Past the routing gate the next step differs: source builds lack a speech engine, packaged builds try the synthetic device.
    await page.waitForFunction(()=>{const text=document.getElementById('message').textContent;return text.length>0&&!/system loopback route/.test(text);});
    await page.evaluate(()=>window.versecue.endAudio());
    await page.locator('#audio-device').selectOption('synthetic-mic',{force:true});
    assert.equal(await page.locator('#audio-route-ack').isChecked(),false,'Changing the input clears the routing check');
    assert.equal(await page.evaluate(()=>document.getElementById('audio-route-ack-label').hidden),true);
    assert.match(await page.locator('#audio-route-info').textContent(),/cannot verify/);
    await page.locator('#audio-device').selectOption('synthetic-loopback',{force:true});
    await page.evaluate(()=>{const ack=document.getElementById('audio-route-ack');ack.checked=true;ack.dispatchEvent(new Event('change'));});
    assert.equal((await page.evaluate(()=>window.versecue.command('reset'))).ok,true);
    await page.waitForFunction(()=>!document.getElementById('audio-route-ack').checked);
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,loopbackGuidanceShown:true,listenBlockedUntilRoutingChecked:true,captureNotOpenedWhileBlocked:true,inputChangeClearsCheck:true,ordinaryInputMakesNoHardwareClaim:true,resetClearsCheck:true,routingChanged:false,driverInstalled:false,microphoneCapture:false,actualProPresenterAccess:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-loopback-input-guidance.json':'test-results/loopback-input-guidance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
