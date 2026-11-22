'use strict';
// NR-018: version requests for the passage just used, checked against the versions installed in ProPresenter.
const test=require('node:test'),assert=require('node:assert/strict');
const {parse}=require('../core/parser.cjs');const {Session}=require('../core/session.cjs');const {codesFromNames,versionName}=require('../core/bible-versions.cjs');const {PassageCoordinator}=require('../core/passage-coordinator.cjs');
test('spoken version requests become a version command; talk about versions does not',()=>{
  const cases={'can you give me NIV':'NIV','read that in New King James':'NKJV','can I have it in the Amplified':'AMP','give me that in ESV please':'ESV','Pastor can we have that in the New International Version':'NIV','can you give me the message':'MSG','NKJV please':'NKJV','switch to the English Standard Version':'ESV','read it in King James':'KJV'};
  for(const [text,code] of Object.entries(cases))assert.deepEqual(parse(text).command,{kind:'version',translation:code},text);
  for(const text of ['the NIV is a good translation for new believers','I love the King James','my grandmother read the King James every morning'])assert.equal(parse(text).command,null,text);
  assert.deepEqual(parse('1st Timothy 1 verse 2 in NIV').references.map(r=>[r.label,r.translation]),[['1 Timothy 1:2','NIV']]);
});
test('a version request reopens the passage just used, never as an automatic send',()=>{
  const s=new Session({},{});s.configure({dryRun:true,translation:'KJV'});
  s.ingest('Please turn to 1st Timothy chapter 1 verse 2',{id:'a'});
  const [c]=s.ingest('can you give me NIV',{id:'b'});
  assert.equal(c.label,'1 Timothy 1:2');assert.equal(c.translation,'NIV');assert.equal(c.recognition,'version-switch');assert.equal(c.reference.autoEligible,false);assert.deepEqual(c.versionSwitch,{label:'1 Timothy 1:2',from:'KJV',to:'NIV'});
  assert.equal(s.ingest('read that in NIV',{id:'c'}).length,0);assert.match(s.snapshot().versionNotice.text,/already in NIV/);
  const empty=new Session({},{});empty.configure({dryRun:true});assert.equal(empty.ingest('can you give me ESV',{id:'d'}).length,0);assert.match(empty.snapshot().versionNotice.text,/no recent passage/);
});
test('ProPresenter menu names map to version codes',()=>{
  assert.deepEqual(codesFromNames(['American Standard Version','King James Version','Some Other Bible']),['ASV','KJV']);
  assert.deepEqual(codesFromNames(['New International Version','The Message','Amplified Bible, Classic Edition']),['NIV','MSG','AMPC']);
  assert.equal(versionName('NKJV'),'New King James Version');
});
function coordinator(installed){
  const service={translation:'KJV',queue:[],stopped:false,log(){},clock:()=>Date.now()};
  const controller={installedVersions:async()=>installed};
  const c=new PassageCoordinator({service,connector:{},resolver:{},savedBible:{controller,readiness:()=>({available:true}),cancel(){}},onChange(){}});
  return {c,service};
}
test('a version that is not installed is refused plainly; an installed one goes ahead',async()=>{
  const candidate={id:'x',label:'1 Timothy 1:2',translation:'NIV',recognition:'version-switch',versionSwitch:{from:'KJV',to:'NIV'}};
  let {c,service}=coordinator({names:['American Standard Version','King James Version'],codes:['ASV','KJV']});service.queue=[candidate];
  assert.equal(await c.versionInstalled(candidate),false);assert.equal(service.queue.length,0);
  assert.match(service.versionNotice.text,/^NIV isn't installed in ProPresenter, so VerseCue is keeping KJV\. Installed: ASV, KJV\.$/);assert.equal(c.state.phase,'version-not-installed');assert.equal(c.state.outputRequests,0);
  ({c,service}=coordinator({names:['King James Version','American Standard Version'],codes:['KJV','ASV']}));assert.equal(await c.versionInstalled({...candidate,translation:'ASV'}),true);
  ({c,service}=coordinator(null));assert.equal(await c.versionInstalled(candidate),true,'cannot check here: the saved-passage route decides');
  ({c,service}=coordinator({names:['King James Version'],codes:['KJV']}));assert.equal(await c.versionInstalled({id:'y',label:'John 3:16',translation:'KJV',recognition:'reference'}),true);
});
