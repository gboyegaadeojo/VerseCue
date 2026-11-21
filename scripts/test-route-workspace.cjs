'use strict';
// SYNTHETIC session only. Checks the Route workspace states; no microphone or ProPresenter output.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.resolve('test-results','route-'+randomUUID())],env});
  try{
    const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const pipeline=()=>page.evaluate(()=>[...document.querySelectorAll('#auto-pipeline li')].map(li=>li.dataset.step+':'+li.dataset.state+':'+li.querySelector('.pipeline-label').textContent));
    const look=await page.evaluate(()=>({body:getComputedStyle(document.body).backgroundColor,header:getComputedStyle(document.querySelector('header')).backgroundColor,eyebrow:document.querySelector('.page-heading .eyebrow').textContent}));
    assert.equal(look.body,'rgb(255, 255, 255)');assert.equal(look.header,'rgb(0, 0, 0)');assert.equal(look.eyebrow,'LIVE SCRIPTURE');
    assert.deepEqual(await pipeline(),['heard:todo:Heard','matched:todo:Matched','ready:todo:Ready','shown:todo:On screen']);
    const [candidate]=(await page.evaluate(()=>window.versecue.command('ingest',{text:'John 3:16'}))).value;
    await page.waitForFunction(()=>document.getElementById('reference').textContent==='John 3:16');
    assert.deepEqual(await pipeline(),['heard:done:Heard','matched:done:Matched','ready:review:Needs review','shown:todo:On screen'],'A manual reference waits for review');
    const pending=await page.evaluate(async()=>{const st=(await window.versecue.state()).value;render({...st,autoStatus:{state:'pending',reason:'SYNTHETIC',dueAt:Date.now()+1000}});const hold=document.getElementById('hold-auto'),siblings=[...hold.parentElement.children].filter(e=>e.getClientRects().length);return {visible:!hold.hidden,firstVisual:siblings.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]?.id,height:hold.getBoundingClientRect().height};});
    assert.equal(pending.visible,true);assert.equal(pending.firstVisual,'hold-auto','Hold is the first action while a send is pending');assert.ok(pending.height>=44);
    assert.deepEqual((await pipeline())[2],'ready:current:Sending');
    const sent=await page.evaluate(id=>window.versecue.command('send',id),candidate.id);assert.equal(sent.ok,true,sent.error);assert.equal(sent.value.state,'simulated');
    await page.waitForFunction(()=>document.querySelector('#auto-pipeline [data-step="shown"]').dataset.state==='done');
    assert.equal((await pipeline())[3],'shown:done:Simulated','Dry run never claims physical output');
    assert.deepEqual(errors,[]);
    const report={passed:true,packaged:!!executable,routeThemeLoaded:true,pipelineStates:['todo','review','current','done'],holdFirstWhilePending:true,dryRunLabelledSimulated:true,microphoneCapture:false,actualProPresenterAccess:false};
    await fs.mkdir('test-results',{recursive:true});await fs.writeFile(executable?'test-results/packaged-route-workspace.json':'test-results/route-workspace.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
