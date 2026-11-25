'use strict';
// Early chapter (NR-020): Prepare for volunteer opens the chapter from unfinished speech; preparation only, never output.
const test=require('node:test');const assert=require('node:assert/strict');
const {PassageCoordinator}=require('../core/passage-coordinator.cjs');const {PreparationController}=require('../core/preparation-controller.cjs');const {parse}=require('../core/parser.cjs');
const ref=text=>parse(text,{defaultTranslation:'KJV',maxVerses:176}).references[0];
function setup({service:extra={},connector:connectorExtra={}}={}){
  const service={translation:'KJV',mode:'confirm',dryRun:true,prepareForVolunteer:true,chapterContext:true,stopped:false,queue:[],generation:1,referenceEpoch:1,connector:{status:{state:'connected'}},log(){},expire(){},clock:()=>Date.now(),...extra};
  const connector={generation:7,base:'http://127.0.0.1:1025',armed:false,...connectorExtra};
  const calls=[];let release=null;
  const controller={prepare:(chapter,translation,guard,options)=>{calls.push({chapter,translation,options});return new Promise(resolve=>{release=()=>resolve({focusVisible:true,chapterVerses:6,workerElapsedMs:900});if(!options.early)release();});},installedVersions:async()=>null};
  const c=new PassageCoordinator({service,connector,resolver:{},savedBible:{controller,readiness:()=>({available:true}),cancel(){}},onChange(){}});
  const candidate=(text,id=text)=>{const reference=ref(text);const row={id,label:reference.label,translation:reference.translation??'KJV',authorized:true,generation:service.generation,reference,issues:reference.issues,recognition:'reference'};service.queue.push(row);return row;};
  return {c,service,connector,calls,candidate,finish:()=>release()};
}
test('the finished sentence reuses the chapter opened early: one helper run, nothing sent',async()=>{
  const t=setup();const early=t.c.prepareEarly(ref('Psalm 23:1'),'KJV');
  assert.equal(t.c.busy,true);assert.equal(t.calls[0].options.early,true);assert.equal(t.calls[0].chapter,'Psalm 23');
  const row=t.candidate('Psalm 23:1');assert.equal(t.c.matchesEarly(row),true);
  const final=t.c.prepareChapter(row.id,{acknowledgeFocusChange:true});t.finish();await early;const state=await final;
  assert.equal(t.calls.length,1);assert.equal(state.phase,'chapter-prepared');assert.equal(state.early,true);assert.equal(state.reference,'Psalm 23:1');assert.equal(state.outputRequests,0);assert.equal(t.c.busy,false);
});
test('a different verse in the same chapter is prepared again; a different chapter does not match',async()=>{
  const t=setup();const early=t.c.prepareEarly(ref('Psalm 23:1'),'KJV');
  assert.equal(t.c.matchesEarly(t.candidate('Psalm 24:1')),false);
  const row=t.candidate('Psalm 23:4');const final=t.c.prepareChapter(row.id,{acknowledgeFocusChange:true});t.finish();await early;const state=await final;
  assert.equal(t.calls.length,2);assert.equal(t.calls[1].options.focusVerse,4);assert.equal(t.calls[1].options.early,undefined);assert.equal(state.focusVerse,4);
});
test('early preparation only runs in Prepare for volunteer, dry run, outputs off, the current version and a complete reference',async()=>{
  for(const extra of [{prepareForVolunteer:false},{chapterContext:false},{earlyPreparation:false},{dryRun:false},{mode:'auto'},{stopped:true}]){const t=setup({service:extra});assert.equal(await t.c.prepareEarly(ref('Psalm 23:1'),'KJV'),null,JSON.stringify(extra));assert.equal(t.calls.length,0);}
  const armed=setup({connector:{armed:true}});assert.equal(await armed.c.prepareEarly(ref('Psalm 23:1'),'KJV'),null);
  const t=setup();assert.equal(await t.c.prepareEarly(ref('Psalm 23:1 in NIV'),'NIV'),null,'other version waits for the finished words');
  assert.equal(await t.c.prepareEarly(ref('Psalm 23'),'KJV'),null,'no verse yet');assert.equal(t.calls.length,0);
});
test('cancel stops the early chapter; the same chapter and verse is not started twice',async()=>{
  const t=setup();const early=t.c.prepareEarly(ref('Psalm 23:1'),'KJV');assert.equal(await t.c.prepareEarly(ref('Psalm 23:1'),'KJV'),null);assert.equal(t.calls.length,1);
  t.c.cancel();assert.equal(t.c.early,null);t.finish();assert.equal(await early,null);assert.equal(t.c.busy,false);
});
test('the controller keeps session state and listening for an early chapter, and refuses one outside dry run',async()=>{
  const service={mode:'confirm',dryRun:true,stopped:false,generation:3,capture:{active:true},maxPassageVerses:176,configure(){throw Error('configure must not run');},setMode(){throw Error('mode must not change');},log(){},notify(){}};
  let canceled=0;const connector={base:'http://127.0.0.1:1025',armed:false,read:async()=>({host_description:'ProPresenter 21.4.2',platform:'win'}),arm(){}};
  const preparation={available:()=>true,busy:false,prepare:async(reference,translation,options)=>{service.generation++;assert.equal(options.guard(),true,'a new session generation does not stop it');return {ok:true,workerElapsedMs:5};}};
  const controller=new PreparationController({service,connector,speech:{cancel(){canceled++;}},preparation,getTranslation:()=>'KJV',cancelRecognition:()=>canceled++});
  await controller.prepare('Psalm 23','KJV',()=>true,{keepListening:true,focusVerse:1,early:true});assert.equal(canceled,0);
  service.dryRun=false;await assert.rejects(controller.prepare('Psalm 23','KJV',()=>true,{keepListening:true,focusVerse:1,early:true}),/dry run/);
});
test('preparing a passage drops the phrase in flight but keeps the loaded speech model',()=>{
  const {LocalSpeech}=require('../core/stt.cjs');const speech=new LocalSpeech();const calls=[];speech.resident={abort:()=>calls.push('abort'),stop:()=>calls.push('stop')};
  speech.mode='resident';speech.interrupt();speech.mode='cli';speech.interrupt();speech.cancel();assert.deepEqual(calls,['abort','stop','stop']);
});

test('the "from the spoken verse" setting reaches early and final preparation; the whole chapter stays the default',async()=>{
  const t=setup({service:{volunteerRange:'from-verse'}});const early=t.c.prepareEarly(ref('Psalm 23:1'),'KJV');
  assert.equal(t.calls[0].options.fromVerse,true);
  const row=t.candidate('Psalm 23:4');const final=t.c.prepareChapter(row.id,{acknowledgeFocusChange:true});t.finish();await early;await final;
  assert.equal(t.calls[1].options.fromVerse,true);
  const plain=setup();const row2=plain.candidate('Psalm 23:4');await plain.c.prepareChapter(row2.id,{acknowledgeFocusChange:true});assert.equal(plain.calls[0].options.fromVerse,false);
});
