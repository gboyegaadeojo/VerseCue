'use strict';
const {_electron}=require('playwright');const fs=require('node:fs/promises');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
  const [exe,file,mode]=process.argv.slice(2);if(!exe||!file||(mode&&mode!=='--resident'))throw new Error('Usage: node scripts/test-packaged-speech.cjs <VerseCue.exe> <authorized-private-wav> [--resident]');
  const b=await fs.readFile(file);assert.equal(b.readUInt32LE(24),16000);assert.equal(b.readUInt16LE(22),1);let offset=12,pcm;
  while(offset+8<=b.length){const size=b.readUInt32LE(offset+4);if(b.toString('ascii',offset,offset+4)==='data'){pcm=b.subarray(offset+8,offset+8+size);break;}offset+=8+size+size%2;}assert.ok(pcm);const samples=[];for(let i=0;i<Math.min(pcm.length,384000);i+=2)samples.push(pcm.readInt16LE(i)/32768);
  const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;const electron=await _electron.launch({executablePath:path.resolve(exe),args:[`--user-data-dir=${path.resolve('test-results/packaged-speech-profile')}`],env});
  try{
    const page=await electron.firstWindow();await page.waitForFunction(()=>typeof window.versecue==='object');
    const resources=await electron.evaluate(()=>process.resourcesPath);const executable=path.join(resources,'speech','whisper-cli.exe'),model=path.join(resources,'speech','ggml-base.en.bin');await fs.access(executable);await fs.access(model);
    const settingResult=await page.evaluate(async options=>{const current=await window.versecue.settings();return window.versecue.saveSettings({...current.value,...options});},{speechMode:mode==='--resident'?'resident':'cli',executable,model});assert.equal(settingResult.ok,true,settingResult.error);
    const capture=await page.evaluate(()=>window.versecue.beginAudio({authorized:true}));assert.equal(capture.ok,true,capture.error);
    const result=await page.evaluate(samples=>window.versecue.audio(samples),samples);assert.equal(result.ok,true,result.error);assert.ok(result.value.text.length>0);
    await page.evaluate(()=>window.versecue.endAudio());
    const state=await page.evaluate(()=>window.versecue.state());assert.equal(state.value.dryRun,true);assert.equal(state.value.history.length,0);
    const report={appVersion:await electron.evaluate(({app})=>app.getVersion()),at:new Date().toISOString(),passed:true,packaged:true,bundledLocalWorker:true,speechMode:mode==='--resident'?'resident':'cli',audioSource:'authorized private PCM fixture through IPC; no microphone',audioSeconds:samples.length/16000,elapsedMs:result.value.elapsedMs,transcriptNonempty:true,outputHistoryEntries:state.value.history.length,accuracyScored:false,liveLatencyScored:false};await fs.writeFile(mode==='--resident'?'test-results/packaged-resident-integration.json':'test-results/packaged-speech-integration.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }finally{await electron.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
