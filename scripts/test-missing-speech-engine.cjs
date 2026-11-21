'use strict';
// SYNTHETIC saved settings. No microphone, recognition or ProPresenter access.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
async function launch(executable,settings){
  const profile=path.resolve('test-results','missing-speech-'+randomUUID());await fs.mkdir(profile,{recursive:true});
  await fs.writeFile(path.join(profile,'settings.json'),JSON.stringify({schemaVersion:1,host:'127.0.0.1',port:1025,translation:'KJV',audioDevice:'',channel:0,speechMode:'cli',...settings}));
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+profile],env});
  const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
  const s=(await page.evaluate(()=>window.versecue.settings())).value,state=(await page.evaluate(()=>window.versecue.state())).value;
  await app.close();return {s,events:state.events.map(e=>e.code)};
}
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null;
  const gone={executable:'C:\\VerseCue-old-copy-that-no-longer-exists\\resources\\speech\\whisper-cli.exe',model:'C:\\VerseCue-old-copy-that-no-longer-exists\\resources\\speech\\ggml-base.en.bin'};
  const missing=await launch(executable,gone);
  if(executable){
    assert.equal(path.basename(missing.s.executable),'whisper-cli.exe');assert.notEqual(missing.s.executable,gone.executable,'A missing saved engine is replaced by the bundled engine');
    assert.equal(path.dirname(missing.s.executable),path.dirname(missing.s.model));assert.ok(missing.events.includes('SPEECH_ENGINE_REPLACED_MISSING'));
    const kept=path.resolve(path.dirname(executable),'resources','speech');const chosenExe=path.join(kept,'whisper-cli.exe'),chosenModel=path.join(kept,'ggml-base.en.bin');
    const existing=await launch(executable,{executable:chosenExe,model:chosenModel});assert.equal(existing.s.executable,chosenExe);assert.equal(existing.events.includes('SPEECH_ENGINE_REPLACED_MISSING'),false,'An existing chosen engine is kept');
  }else{assert.equal(missing.s.executable,gone.executable,'Without a bundled engine nothing is replaced');assert.equal(missing.events.includes('SPEECH_ENGINE_REPLACED_MISSING'),false);}
  console.log(JSON.stringify({passed:true,packaged:!!executable,missingEngineReplacedWithBundled:!!executable,existingEngineKept:!!executable,microphoneCapture:false,actualProPresenterAccess:false}));
})().catch(error=>{console.error(error);process.exitCode=1;});
