'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),settings=require('../core/settings.cjs');const {Session}=require('../core/session.cjs');
test('Prepare for volunteer is a valid start mode that starts and resets in Confirm, never Auto',()=>{
  assert.equal(settings.validateSettings({...settings.defaults(),startMode:'prepare'}).startMode,'prepare');
  const s=new Session({});s.startMode='prepare';assert.equal(s.applyStartMode(),false);assert.equal(s.mode,'confirm');assert.equal(s.prepareForVolunteer,true);
  s.reset();assert.equal(s.mode,'confirm','Reset stays in Confirm');assert.equal(s.dryRun,true);
  s.stop();s.applyStartMode();assert.equal(s.prepareForVolunteer,false,'Not after Emergency stop');
});
