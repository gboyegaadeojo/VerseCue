'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),settings=require('../core/settings.cjs');
test('text size defaults to Standard, accepts Large (booth) and rejects anything else',()=>{
  assert.equal(settings.defaults().textSize,'standard');assert.equal(settings.validateSettings({schemaVersion:1}).textSize,'standard');
  assert.equal(settings.validateSettings({...settings.defaults(),textSize:'booth'}).textSize,'booth');
  for(const bad of ['large',18,null,''])assert.throws(()=>settings.validateSettings({...settings.defaults(),textSize:bad}));
});
