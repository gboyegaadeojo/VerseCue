'use strict';
// NR-030 (docs/155): suggest restarting ProPresenter at a quiet moment when it is clearly slowing. Never restarts it.
const test=require('node:test');const assert=require('node:assert/strict');
const {SlowdownWatch,unresponsiveError}=require('../core/propresenter-slowdown.cjs');
const {PassageCoordinator}=require('../core/passage-coordinator.cjs');const {parse}=require('../core/parser.cjs');

test('two slow chapters out of the last three suggest a restart; one slow chapter does not',()=>{
  const w=new SlowdownWatch({clock:()=>1});
  assert.equal(w.record(3000),null);assert.equal(w.record(15000),null,'one slow chapter is not enough');assert.equal(w.record(9000),null);
  const hint=w.record(21000);assert.equal(hint.reason,'slow');assert.match(hint.text,/15 s and 21 s/);assert.match(hint.text,/Restart ProPresenter at a quiet moment/);assert.match(hint.text,/does not restart it/);
  assert.equal(w.record(13000).id,hint.id,'the same hint is not raised again while it stays slow');
});
test('a quick chapter (for example after a restart) clears the hint; bad times are ignored',()=>{
  const w=new SlowdownWatch();w.record(14000);w.record(16000);assert.ok(w.hint);
  assert.equal(w.record(NaN)?.reason,'slow');assert.equal(w.record(-1)?.reason,'slow');
  assert.equal(w.record(4000),null);assert.equal(w.hint,null);
  assert.equal(w.record(14000),null,'slow chapters before the quick one no longer count');
});
test('a "responding too slowly" stop suggests a restart straight away',()=>{
  const w=new SlowdownWatch();assert.equal(w.unresponsive().reason,'unresponsive');
  assert.equal(unresponsiveError(Error('Preparation not verified: ProPresenter is responding too slowly for VerseCue to click or type safely, so it stopped.')),true);
  assert.equal(unresponsiveError(Error('REQUESTED_EDITION_NOT_FOUND')),false);
});

function coordinator(times){
  const logs=[];const service={translation:'KJV',mode:'confirm',dryRun:true,prepareForVolunteer:true,chapterContext:true,earlyPreparation:false,stopped:false,queue:[],generation:1,referenceEpoch:1,connector:{status:{state:'connected'}},log:(code,level,detail)=>logs.push({code,level,detail}),expire(){},clock:()=>Date.now()};
  const connector={generation:7,base:'http://127.0.0.1:1025',armed:false};let calls=0;
  const controller={prepare:async()=>{const t=times[calls++];if(t instanceof Error)throw t;return {focusVisible:true,chapterVerses:31,workerElapsedMs:t};},installedVersions:async()=>null};
  const c=new PassageCoordinator({service,connector,resolver:{},savedBible:{controller,readiness:()=>({available:true}),cancel(){}},onChange(){}});
  let n=0;const prepare=async text=>{const reference=parse(text,{defaultTranslation:'KJV'}).references[0];const row={id:'r'+(++n),label:reference.label,translation:'KJV',authorized:true,generation:service.generation,reference,issues:reference.issues,recognition:'reference'};service.queue.push(row);try{return await c.prepareChapter(row.id,{acknowledgeFocusChange:true});}catch(error){return {error};}};
  return {c,service,logs,prepare};
}
test('the passage coordinator shows the hint once, in the app state, and clears it after a quick chapter',async()=>{
  const t=coordinator([2000,14000,18000,19000,3000]);
  await t.prepare('John 3:16');await t.prepare('Romans 8:28');assert.equal(t.service.proPresenterSlowdown,null);
  await t.prepare('Isaiah 40:31');const hint=t.service.proPresenterSlowdown;assert.equal(hint.reason,'slow');
  assert.equal(t.logs.filter(l=>l.code==='PROPRESENTER_SLOWING').length,1);
  await t.prepare('Psalm 23:1');assert.equal(t.service.proPresenterSlowdown.id,hint.id,'the same hint while it stays slow');assert.equal(t.logs.filter(l=>l.code==='PROPRESENTER_SLOWING').length,1,'logged once');
  const state=await t.prepare('Genesis 1:1');assert.equal(state.phase,'chapter-prepared');assert.equal(t.service.proPresenterSlowdown,null);assert.equal(state.outputRequests,0);
});
test('a responsiveness stop raises the hint; other failures do not',async()=>{
  const t=coordinator([Error('Preparation not verified: ProPresenter is responding too slowly for VerseCue to click or type safely, so it stopped.')]);
  await t.prepare('John 3:16');assert.equal(t.service.proPresenterSlowdown.reason,'unresponsive');assert.match(t.service.proPresenterSlowdown.text,/responding too slowly/);
  const other=coordinator([Error('REQUESTED_EDITION_NOT_FOUND')]);await other.prepare('John 3:16');assert.equal(other.service.proPresenterSlowdown,undefined);
});
