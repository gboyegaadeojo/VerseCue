'use strict';
// Prepare for volunteer opens the whole chapter at the spoken verse (NR-014). No saved copy and no output.
const test=require('node:test');const assert=require('node:assert/strict');const {EventEmitter}=require('node:events');
const {BiblePreparation}=require('../core/bible-preparation.cjs');const {ReferencePreparation}=require('../core/reference-preparation.cjs');const {parse}=require('../core/parser.cjs');const settings=require('../core/settings.cjs');
function fakeHelper(reply){const sent=[];return {sent,spawnImpl(){const child=new EventEmitter();child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};child.stdin=Object.assign(new EventEmitter(),{end(text){const request=JSON.parse(text);sent.push(request);setImmediate(()=>{child.stdout.emit('data',Buffer.from(JSON.stringify(reply(request))));child.emit("close",0);});}});return child;}};}
const ok=request=>({ok:true,state:'chapter-prepared-no-output',reference:request.reference,translation:request.translation,focusVerse:request.focusVerse,focusVisible:true,referenceLabels:35,clippingWarning:false,saveCopyRequested:false,outputRequests:0});
test('chapter preparation sends the chapter, the spoken verse and the verse count, never a saved copy',async()=>{
  const helper=fakeHelper(ok),prep=new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:helper.spawnImpl});
  const result=await prep.prepare('Proverbs 3','KJV',{focusVerse:5});
  assert.deepEqual(helper.sent[0],{operation:'prepare-chapter',reference:'Proverbs 3',translation:'KJV',focusVerse:5,chapterVerses:35});
  assert.equal(result.state,'chapter-prepared-no-output');assert.equal(result.focusVisible,true);assert.equal(result.chapterVerses,35);assert.equal(result.outputRequests,0);assert.equal(result.saveCopyRequested,false);
  await prep.prepare('Psalm 119','KJV',{focusVerse:176});assert.equal(helper.sent[1].chapterVerses,176);
});
test('the first chapter can read installed versions in the same run; bad lists are ignored (NR-020)',async()=>{
  const helper=fakeHelper(r=>({...ok(r),installed:r.listVersions?['King James Version','American Standard Version']:null})),prep=new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:helper.spawnImpl});
  const first=await prep.prepare('Proverbs 3','KJV',{focusVerse:5,listVersions:true});
  assert.equal(helper.sent[0].listVersions,true);assert.deepEqual(first.installed,['King James Version','American Standard Version']);
  const second=await prep.prepare('Proverbs 3','KJV',{focusVerse:5});assert.equal('listVersions' in helper.sent[1],false);assert.equal(second.installed,undefined);
  const bad=new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:fakeHelper(r=>({...ok(r),installed:[42]})).spawnImpl});
  assert.equal((await bad.prepare('Proverbs 3','KJV',{focusVerse:5,listVersions:true})).installed,undefined);
});
test('chapter preparation rejects a verse outside the chapter, a verse reference, a saved copy or a mismatched reply',async()=>{
  const helper=fakeHelper(ok),prep=new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:helper.spawnImpl});
  await assert.rejects(prep.prepare('Proverbs 3','KJV',{focusVerse:36}),/whole chapter/);
  await assert.rejects(prep.prepare('Proverbs 3:5','KJV',{focusVerse:5}),/whole chapter/);
  await assert.rejects(prep.prepare('Proverbs 3','KJV',{focusVerse:5,saveCopy:true}),/whole chapter/);
  assert.equal(helper.sent.length,0);
  const wrong=new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:fakeHelper(r=>({...ok(r),focusVerse:6})).spawnImpl});
  await assert.rejects(wrong.prepare('Proverbs 3','KJV',{focusVerse:5}),/not verified/);
  const output=new BiblePreparation({helper:'bridge.exe',platform:'win32',spawnImpl:fakeHelper(r=>({...ok(r),outputRequests:1})).spawnImpl});
  await assert.rejects(output.prepare('Proverbs 3','KJV',{focusVerse:5}),/not verified/);
});
function preparation(service){const calls=[];const r=new ReferencePreparation({service,coordinator:{cancel(){}},prepare:async(id,owner,options)=>{calls.push({id,options});}});r.enabled=true;return {r,calls};}
const service=extra=>({mode:'confirm',stopped:false,connector:{status:{state:'connected'}},referenceEpoch:1,log(){},...extra});
const candidate=text=>{const reference=parse(text,{maxVerses:10}).references[0];return {id:text,authorized:true,reference,issues:reference.issues};};
test('Prepare for volunteer routes chapter-only and long references to the whole chapter',async()=>{
  const {r,calls}=preparation(service({prepareForVolunteer:true}));
  r.consider([candidate('Proverbs chapter 3')],1);await new Promise(setImmediate);
  r.consider([candidate('Proverbs 3:5-30')],1);await new Promise(setImmediate);
  assert.deepEqual(calls.map(c=>[c.id,c.options.chapter]),[['Proverbs chapter 3',true],['Proverbs 3:5-30',true]]);
});
test('Confirm and Auto keep the exact-passage rules; the chapter choice can be turned off',async()=>{
  const confirm=preparation(service({prepareForVolunteer:false}));confirm.r.consider([candidate('Proverbs chapter 3')],1);confirm.r.consider([candidate('Proverbs 3:5-30')],1);await new Promise(setImmediate);assert.equal(confirm.calls.length,0);
  confirm.r.consider([candidate('Proverbs 3:5')],1);await new Promise(setImmediate);assert.equal(confirm.calls[0].options.chapter,undefined);
  const off=preparation(service({prepareForVolunteer:true,chapterContext:false}));off.r.consider([candidate('Proverbs 3:5')],1);await new Promise(setImmediate);assert.equal(off.calls[0].options.chapter,undefined);
});
test('settings: whole chapter on by default, verse limit reaches 176',()=>{
  assert.equal(settings.defaults().chapterContext,true);assert.equal(settings.validateSettings({...settings.defaults(),maxPassageVerses:176}).maxPassageVerses,176);
  assert.throws(()=>settings.validateSettings({...settings.defaults(),maxPassageVerses:177}));assert.throws(()=>settings.validateSettings({...settings.defaults(),chapterContext:'yes'}));
  assert.equal(parse('Psalm 119:1-176',{maxVerses:176}).references[0].overLimit,false);
});
test('a relative reference ("next verse") keeps the exact-passage path in Prepare for volunteer',async()=>{
  const {r,calls}=preparation(service({prepareForVolunteer:true}));
  const reference=parse('next verse',{context:{...parse('Hosea 1:1').references[0],translation:'KJV',verified:true,verifiedAt:Date.now()},now:Date.now()}).references[0];
  assert.equal(reference.relative,true);
  r.consider([{id:'next',authorized:true,reference,issues:reference.issues}],1);await new Promise(setImmediate);
  assert.equal(calls.length,1);assert.equal(calls[0].options.chapter,undefined);
});
