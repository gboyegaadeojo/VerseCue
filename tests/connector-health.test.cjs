'use strict';
// SYNTHETIC connector state; no network request is made.
const test=require('node:test'),assert=require('node:assert/strict');const {Connector}=require('../core/connector.cjs');
test('an armed send is refused while ProPresenter is slow to respond, before any request',async()=>{
  const c=new Connector();let requests=0;c.fetch=async()=>{requests++;throw Error('no network in this test');};c.configure('127.0.0.1',1025);c.armed=true;c.status={state:'degraded',version:'ProPresenter synthetic'};
  await assert.rejects(c.send({label:'John 3:16',translation:'KJV'},{dryRun:false,guard:()=>true}),/not responding/);assert.equal(requests,0);
});
