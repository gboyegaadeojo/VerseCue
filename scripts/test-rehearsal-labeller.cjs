'use strict';
// Recording labeller end to end (docs/157): a synthetic WAV, the real labeller window driven by keyboard, the saved
// labels file, resume, a refused clash, no network, WCAG 2.2 AA via axe-core, then the labels applied to a synthetic
// stream and scored by the Auto rehearsal. No microphone, no ProPresenter, no real recording.
const {_electron}=require('playwright'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),work=path.join(root,'test-results','labeller-'+randomUUID()),labelsDir=path.join(work,'labels'),streams=path.join(work,'streams');
const axeSource=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
function wav(file,seconds,seed){const n=seconds*16000,b=Buffer.alloc(44+n*2);b.write('RIFF',0,'ascii');b.writeUInt32LE(36+n*2,4);b.write('WAVE',8,'ascii');b.write('fmt ',12,'ascii');b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36,'ascii');b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(Math.sin(i*seed/16000*2*Math.PI)*2000),44+i*2);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,b);}
async function launch(recording){
  const env={...process.env,VERSECUE_AUTOMATION:'1',VERSECUE_LABELLER_RECORDING:recording,VERSECUE_LABELLER_DIR:labelsDir};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({args:[path.join(root,'labeller','main.cjs'),`--user-data-dir=${path.join(work,'profile-'+randomUUID())}`],env});
  const page=await app.firstWindow();await page.waitForSelector('#open');return {app,page};
}
const statusText=page=>page.textContent('#status');
async function mark(page,at,typed,intentKey){
  await page.evaluate(t=>{document.getElementById('audio').currentTime=t;},at);await page.waitForFunction(t=>Math.abs(document.getElementById('audio').currentTime-t)<0.05,at);
  await page.focus('#mark');await page.keyboard.press('m');await page.waitForSelector('#form-section:not([hidden])');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'reference','the reference box has focus');
  await page.keyboard.type(typed);await page.waitForFunction(()=>/Will be saved as|does not|Add a verse|one reference/.test(document.getElementById('preview').textContent));
  if(intentKey)await page.keyboard.press('Alt+'+intentKey);
  await page.keyboard.press('Enter');
}
(async()=>{
  const recording=path.join(work,'audio','PILOT-A.wav');wav(recording,30,220);
  let {app,page}=await launch(recording);
  try{
    await page.click('#open');await page.waitForFunction(()=>/PILOT-A\.wav/.test(document.getElementById('file-line').textContent));
    assert.equal(await page.inputValue('#recording-id'),'PILOT-A');
    assert.equal(await page.isChecked('#authorized'),false,'authorization is not pre-ticked');assert.equal(await page.isChecked('#reviewed'),false,'review is not pre-ticked');
    // Saving without choosing show/mention is refused.
    await mark(page,12,'jn 3 16',null);
    assert.match(await statusText(page),/Choose whether the pastor wanted it shown/);assert.equal(await page.isVisible('#form-section'),true);
    assert.match(await page.textContent('#preview'),/Will be saved as John 3:16 \(KJV\)/);
    await page.focus('#reference');await page.keyboard.press('Alt+1');await page.keyboard.press('Enter');
    await page.waitForFunction(()=>/Saved 1 label/.test(document.getElementById('status').textContent));
    // A chapter-only reference is explained and not saved; Escape cancels.
    await mark(page,15,'Psalm 23','1');assert.match(await page.textContent('#preview'),/Add a verse/);
    await page.keyboard.press('Escape');assert.equal(await page.isHidden('#form-section'),true);
    await mark(page,20,'Romans 8:28 NIV','2');await page.waitForFunction(()=>/Saved 2 labels/.test(document.getElementById('status').textContent));
    const rows=await page.$$eval('#rows tr',trs=>trs.map(tr=>[...tr.cells].slice(0,4).map(c=>c.textContent)));
    assert.deepEqual(rows,[['0:12.0','John 3:16','KJV','Show on screen'],['0:20.0','Romans 8:28','NIV','Only mentioned']]);
    await page.check('#authorized');await page.check('#reviewed');await page.waitForFunction(()=>/Saved 2 labels/.test(document.getElementById('status').textContent)&&document.body.dataset.saved);
    await page.waitForTimeout(400);
    const saved=JSON.parse(fs.readFileSync(path.join(labelsDir,'PILOT-A.labels.json'),'utf8'));
    assert.deepEqual(saved.labels,[{atSeconds:12,reference:'John 3:16',translation:'KJV',intent:'display'},{atSeconds:20,reference:'Romans 8:28',translation:'NIV',intent:'mention'}]);
    assert.equal(saved.dataUseAuthorized,true);assert.equal(saved.labelsReviewed,true);assert.equal(saved.durationSeconds,30);
    assert.deepEqual(Object.keys(saved).sort(),['audioSha256','dataUseAuthorized','durationSeconds','kind','labels','labelsReviewed','recordingId','schemaVersion']);
    // Edit the first label's time with the nudge buttons.
    await page.click('#rows tr:first-child button:has-text("Edit")');await page.click('#earlier');await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('#rows tr:first-child td').textContent==='0:11.0');
    // No network.
    assert.equal(await page.evaluate(()=>fetch('https://example.com/').then(()=>'reached',()=>'blocked')),'blocked');
    // WCAG 2.2 AA with the form open.
    await page.click('#mark');await page.evaluate(axeSource);
    const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa']},resultTypes:['violations']})).violations.map(v=>`${v.id}: ${v.nodes.map(n=>n.target.join(' ')).join(', ')}`));
    assert.deepEqual(violations,[],'axe-core WCAG 2.2 AA violations');
    await page.keyboard.press('Escape');await page.waitForTimeout(400);
  }finally{await app.close();}
  // Reopening the same recording continues from the saved labels.
  ({app,page}=await launch(recording));
  try{
    await page.click('#open');await page.waitForFunction(()=>/Continuing: loaded 2 saved labels/.test(document.getElementById('status').textContent));
    assert.equal(await page.isChecked('#authorized'),true);
  }finally{await app.close();}
  // A different recording with the same name must not overwrite those labels.
  const other=path.join(work,'other','PILOT-A.wav');wav(other,30,330);
  ({app,page}=await launch(other));
  try{
    await page.click('#open');await page.waitForFunction(()=>/belongs to a different recording/.test(document.getElementById('status').textContent));
    await mark(page,5,'John 1:1','1');await page.waitForFunction(()=>/Not saved: .*different recording/.test(document.getElementById('status').textContent));
    assert.equal(JSON.parse(fs.readFileSync(path.join(labelsDir,'PILOT-A.labels.json'),'utf8')).labels.length,2,'the first recording\'s labels are unchanged');
  }finally{await app.close();}
  // Apply to a synthetic stream and score it.
  fs.mkdirSync(streams,{recursive:true});
  const windows=[{endSeconds:12,durationSeconds:3,text:'Please show John chapter three verse sixteen.',endEvidence:'silence',elapsedMs:500,droppedSamples:0},{endSeconds:21,durationSeconds:3,text:'As Romans 8:28 tells us, all things work together.',endEvidence:'silence',elapsedMs:500,droppedSamples:0}];
  fs.writeFileSync(path.join(streams,'PILOT-A.json'),JSON.stringify({schemaVersion:1,recordingId:'PILOT-A',source:'SYNTHETIC-TEXT',split:'held-out',durationSeconds:30,dataUseAuthorized:false,labelsReviewed:false,windows,labels:[]}));
  const env={...process.env,VERSECUE_REHEARSAL_DIR:streams};
  const out=JSON.parse(execFileSync(process.execPath,[path.join(root,'scripts','apply-rehearsal-labels.cjs'),'PILOT-A.json',path.join(labelsDir,'PILOT-A.labels.json'),'PILOT-A-labelled.json'],{env,encoding:'utf8'}));
  assert.equal(out.labels,2);assert.equal(out.display,1);assert.match(out.annotationSha256,/^[a-f0-9]{64}$/);assert.equal(out.countsTowardTrustGate,false,'synthetic streams never count');
  assert.throws(()=>execFileSync(process.execPath,[path.join(root,'scripts','apply-rehearsal-labels.cjs'),'PILOT-A.json',path.join(labelsDir,'PILOT-A.labels.json'),'PILOT-A-labelled.json'],{env,stdio:'pipe'}),'refuses to overwrite');
  const {rehearse}=require('../core/auto-rehearsal.cjs');
  const report=await rehearse([JSON.parse(fs.readFileSync(path.join(streams,'PILOT-A-labelled.json'),'utf8'))]);
  assert.deepEqual({sends:report.recordings[0].automaticSends,correct:report.recordings[0].correctAutomaticSends,wrong:report.recordings[0].wrongOutputs},{sends:1,correct:1,wrong:0});
  fs.rmSync(work,{recursive:true,force:true});
  console.log('Labeller: keyboard marking, show/mention choice required, canonical check, autosave, resume, clash refused, no network, WCAG 2.2 AA clean, labels applied and scored (1 correct send, 0 wrong).');
})().catch(error=>{console.error(error);process.exitCode=1;});
