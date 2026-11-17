'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {parse,normalize}=require('../core/parser.cjs');
const corpus=JSON.parse(fs.readFileSync('docs/test-data/versecue-utterances.json','utf8').replace(/^\uFEFF/,''));
const now=1000000;
function contextFor(row){
  const setup=row.contextual_setup;
  if(/no |expired|older than|stale|reset|manual.*change|target.*change|unverified/i.test(setup))return null;
  const m=setup.match(/John (\d+):(\d+)/);if(!m)return null;
  return {book:'John',chapter:+m[1],verse:+m[2],verified:true,verifiedAt:now-10000};
}
for(const row of corpus)test(`${row.id}: ${row.utterance}`,()=>{
  // Fixture-only chapter lengths for the two explicitly proposed boundary cases;
  // not a shipped versification database or an installation capability claim.
  const p=parse(row.utterance,{context:contextFor(row),now,bounds:['UT-050','UT-051'].includes(row.id)?{John:[51,25,36,54]}:null});
  assert.equal(p.references.map(r=>r.label).join(';'),row.expected_reference);
  assert.ok(p.references.every(r=>r.autoEligible===false),'All results remain review-only');
});
test('bounds reject nonexistent verses when verified metadata supplied',()=>{const r=parse('John 3:99',{bounds:{John:[51,25,36]}}).references[0];assert.ok(r.issues.includes('Verse outside verified versification'));});
test('invalid ordinal cannot become an unnumbered book',()=>{assert.equal(parse('4 Samuel 3:1').references.length,0);});
test('full translation names are normalized without substitution',()=>{assert.equal(parse('John 3:16 in New King James').references[0].translation,'NKJV');assert.equal(parse('John 3:16 in Amplified classic').references[0].translation,'AMPC');});
test('correction discards the negated reference',()=>{assert.deepEqual(parse('I meant John 4:16, not John 3:16').references.map(r=>r.label),['John 4:16']);});
test('untrusted and expired context never resolves relative verses',()=>{for(const context of [{book:'John',chapter:3,verse:16,verified:false,verifiedAt:now},{book:'John',chapter:3,verse:16,verified:true,verifiedAt:now-121000}])assert.equal(parse('verse 17',{context,now}).references.length,0);});
test('oversized transcript rejected',()=>assert.equal(parse('x'.repeat(8193)).references.length,0));
test('invalid explicit book must not borrow previous passage context',()=>{const context={book:'John',chapter:3,verse:16,verified:true,verifiedAt:now};for(const text of ['4 Samuel chapter 3 verse 1','Hezekiah chapter 1 verse 1'])assert.equal(parse(text,{context,now}).references.length,0);});
test('spoken numbers preserve chapter verse segmentation',()=>{assert.equal(normalize('Psalm one hundred and nineteen verse one hundred and five'),'psalm 119 verse 105');});
