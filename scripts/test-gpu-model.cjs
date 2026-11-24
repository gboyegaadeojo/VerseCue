'use strict';
// NR-025: on a working graphics chip the packaged app switches to Large-v3-turbo and transcribes real speech with it;
// without one it keeps base.en. Packaged builds only (needs the bundled models); warm-up is enabled for this test.
const {_electron}=require('playwright'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto'),assert=require('node:assert/strict');
(async()=>{
  const [exe,file]=process.argv.slice(2);
  if(!exe||!file){console.log(JSON.stringify({gpuModel:'skipped: needs a packaged VerseCue executable and a private recording'}));return;}
  const {decodeReplayFixture}=require('./speech-replay-fixture.cjs');const {samples}=decodeReplayFixture(await fs.readFile(file));
  const env={...process.env,VERSECUE_AUTOMATION:'1',VERSECUE_TEST_WARMUP:'1'};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({executablePath:path.resolve(exe),args:['--user-data-dir='+path.resolve('test-results','gpu-model-'+randomUUID())],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>typeof window.versecue==='object');
    const resources=await app.evaluate(()=>process.resourcesPath);await fs.access(path.join(resources,'speech','ggml-large-v3-turbo-q5_0.bin'));
    // The first graphics-chip start can compile its programs (up to a few minutes once).
    let state;for(const end=Date.now()+300000;Date.now()<end;){state=(await page.evaluate(()=>window.versecue.state())).value;if(['ready','unavailable','cpu'].includes(state.speechGpu))break;await new Promise(r=>setTimeout(r,1000));}
    const ready=state.speechGpu==='ready';
    assert.equal(state.speechEngine.gpuModelAvailable,true,'Large-v3-turbo is offered with the built-in model');
    assert.match(state.speechEngine.activeModel,ready?/large-v3-turbo/:/base\.en/,'active model follows the graphics chip');
    await page.evaluate(()=>window.versecue.command('mode','confirm'));
    assert.equal((await page.evaluate(()=>window.versecue.beginAudio({authorized:true}))).ok,true);
    const t0=Date.now();const result=await page.evaluate(samples=>window.versecue.audio(samples),samples);assert.equal(result.ok,true,result.error);assert.ok(result.value.text.length>0,'speech recognised');
    // A second phrase shows the usual speed once the model is loaded (the first includes loading it).
    const again=await page.evaluate(samples=>window.versecue.audio(samples),samples);assert.equal(again.ok,true,again.error);
    await page.evaluate(()=>window.versecue.endAudio());const after=(await page.evaluate(()=>window.versecue.state())).value;assert.equal(after.history.length,0);assert.equal(after.dryRun,true);
    console.log(JSON.stringify({gpuModel:'passed',graphicsChip:state.speechGpu,device:state.speechGpuDevice,activeModel:state.speechEngine.activeModel,firstPhraseMs:result.value.elapsedMs,loadedPhraseMs:again.value.elapsedMs,wallMs:Date.now()-t0,transcript:result.value.text.slice(0,80)},null,2));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
