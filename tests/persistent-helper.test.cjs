'use strict';
// Kept-running Bible helper (NR-020): one helper process serves the whole service; any failure starts a new one.
const test=require('node:test');const assert=require('node:assert/strict');const {EventEmitter}=require('node:events');
const {BiblePreparation}=require('../core/bible-preparation.cjs');
const ok=request=>({ok:true,state:'chapter-prepared-no-output',reference:request.reference,translation:request.translation,focusVerse:request.focusVerse,focusVisible:true,referenceLabels:35,clippingWarning:false,saveCopyRequested:false,outputRequests:0});
function fakeHelpers(reply){
  const spawns=[];
  return {spawns,spawnImpl(file,args){
    const child=new EventEmitter();child.args=args;child.requests=[];child.exitCode=null;child.killed=false;child.stdout=new EventEmitter();child.stderr=new EventEmitter();
    child.kill=()=>{if(child.killed)return;child.killed=true;setImmediate(()=>{child.exitCode=1;child.emit('close',1);});};
    const answer=line=>{const request=JSON.parse(line);child.requests.push(request);const r=reply(request,child);if(r===undefined)return;setImmediate(()=>{if(child.killed)return;child.stdout.emit('data',Buffer.from(JSON.stringify(r)+'\n'));if(!args.includes('--serve')){child.exitCode=0;child.emit('close',r.ok?0:2);}});};
    child.stdin=Object.assign(new EventEmitter(),{write:answer,end:answer});spawns.push(child);return child;}};
}
const make=(helpers,extra={})=>new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:helpers.spawnImpl,persistent:true,...extra});
test('one kept-running helper serves several chapters in turn',async()=>{
  const helpers=fakeHelpers(ok),prep=make(helpers);
  await prep.prepare('Proverbs 3','KJV',{focusVerse:5});await prep.prepare('Psalm 23','KJV',{focusVerse:1});
  assert.equal(helpers.spawns.length,1);assert.deepEqual(helpers.spawns[0].args,['--serve']);assert.equal(helpers.spawns[0].requests.length,2);
  prep.dispose();assert.equal(helpers.spawns[0].killed,true);
});
test('cancel ends the request in flight; the next request starts a new helper',async()=>{
  const helpers=fakeHelpers((r,child)=>child.requests.length===1&&helpers.spawns.length===1?undefined:ok(r)),prep=make(helpers);
  const pending=prep.prepare('Proverbs 3','KJV',{focusVerse:5});setTimeout(()=>prep.cancel(),20);
  await assert.rejects(pending,/canceled/);assert.equal(helpers.spawns[0].killed,true);
  await prep.prepare('Proverbs 3','KJV',{focusVerse:5});assert.equal(helpers.spawns.length,2);prep.dispose();
});
test('an idle cancel keeps the helper ready',async()=>{
  const helpers=fakeHelpers(ok),prep=make(helpers);await prep.prepare('Proverbs 3','KJV',{focusVerse:5});
  prep.cancel();await prep.prepare('Psalm 23','KJV',{focusVerse:1});assert.equal(helpers.spawns.length,1);prep.dispose();
});
test('refused focus (before any typing) is retried once by a newly started helper; other failures are not retried',async()=>{
  const focus=fakeHelpers((r,child)=>child.args.includes('--serve')?{ok:false,code:'COULD_NOT_FOCUS_PROPRESENTER',outputRequests:0}:ok(r)),prep=make(focus);
  const result=await prep.prepare('Proverbs 3','KJV',{focusVerse:5});assert.equal(result.state,'chapter-prepared-no-output');
  assert.deepEqual(focus.spawns.map(c=>c.args),[['--serve'],[]]);prep.dispose();
  const other=fakeHelpers(()=>({ok:false,code:'FOCUS_CHANGED_BEFORE_ENTER',outputRequests:0})),second=make(other);
  await assert.rejects(second.prepare('Proverbs 3','KJV',{focusVerse:5}),/keyboard focus/);assert.equal(other.spawns.length,1);second.dispose();
});
test('a helper that exits mid-request is reported as unverified and replaced',async()=>{
  const helpers=fakeHelpers((r,child)=>{if(helpers.spawns.length===1){setImmediate(()=>child.kill());return undefined;}return ok(r);}),prep=make(helpers);
  await assert.rejects(prep.prepare('Proverbs 3','KJV',{focusVerse:5}),/not verified/);
  await prep.prepare('Proverbs 3','KJV',{focusVerse:5});assert.equal(helpers.spawns.length,2);prep.dispose();
});
test('the idle helper is ended after the idle time',async()=>{
  const helpers=fakeHelpers(ok),prep=make(helpers,{idleMs:30});await prep.prepare('Proverbs 3','KJV',{focusVerse:5});
  await new Promise(r=>setTimeout(r,80));assert.equal(helpers.spawns[0].killed,true);
});
