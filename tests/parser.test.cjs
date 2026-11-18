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
test('KJV numbering blocks nonexistent verses and bounds both range endpoints',()=>{for(const text of ['John 3:99','3 John 1:15','Romans 8:28-99','John 3:36-4:99'])assert.equal(parse(text).references[0].valid,false);assert.equal(parse('3 John 1:14').references[0].valid,true);});
test('unknown translation is not silently assigned KJV numbering',()=>{const r=parse('3 John 1:15 in AMP').references[0];assert.equal(r.numberingSystem,null);assert.ok(r.issues.some(s=>/numbering/.test(s)));});
test('relative KJV navigation crosses chapter boundaries using numeric metadata',()=>{const context={book:'John',chapter:3,verse:36,translation:'KJV',verified:true,verifiedAt:now};assert.equal(parse('next verse',{context,now}).references[0].label,'John 4:1');context.chapter=4;context.verse=1;assert.equal(parse('previous verse',{context,now}).references[0].label,'John 3:36');});
test('range review cap includes cross-chapter verses',()=>{assert.equal(parse('John 3:16-4:2').references[0].overLimit,true);assert.equal(parse('John 3:35-4:2').references[0].overLimit,false);});

// SYNTHETIC-TEXT regression cases from the operator's reported preaching forms.
const preachingForms=[
['Revelations 1 1','Revelation 1:1'],['Revelaations 1 vs 1','Revelation 1:1'],
['Revelations 1 and verse 1','Revelation 1:1'],['Revelations 1 starting from verse 1','Revelation 1:1'],
['Jeremiah 2 vs 5','Jeremiah 2:5'],['Jeremiah two verse five','Jeremiah 2:5'],
['Jeremiah chapter two and verse five','Jeremiah 2:5'],['Jeremiah 2 beginning at verse 5','Jeremiah 2:5'],
['Jeremiah 2 from verse 5','Jeremiah 2:5'],['Jeremiah chapter number 2 verse number 5','Jeremiah 2:5'],
['Gen 1:1','Genesis 1:1'],['Gen. 1:1','Genesis 1:1'],['Genesis1:1','Genesis 1:1'],
['Rev. 1 v. 1','Revelation 1:1'],['Jer. 2 vs. 5','Jeremiah 2:5'],['Phil 4:19','Philippians 4:19'],
['1 Cor 13:4','1 Corinthians 13:4'],['First Cor 13 vs 4','1 Corinthians 13:4'],['2 Tim 1:7','2 Timothy 1:7'],
['Ps. 23 verse 1','Psalm 23:1'],['John ch. 3 vv. 16 through 18','John 3:16-18'],
['John 3 verses 16 to verse 18','John 3:16-18'],['John 3 starting from verse 16 through verse 18','John 3:16-18'],
['The gospel according to John chapter three verse sixteen','John 3:16'],
['Please turn to the book of Revelation chapter one and verse one','Revelation 1:1']
];
for(const [text,expected]of preachingForms)test('preaching form: '+text,()=>{const p=parse(text);assert.deepEqual(p.references.map(r=>r.label),[expected]);assert.equal(p.references[0].valid,true);});
test('transcribed punctuation becomes reviewable chapter/verse, never an Auto-ready guess',()=>{for(const text of ['John 1-1.','Genesis 1.1','Philippians 4-19']){const r=parse(text).references[0];assert.equal(r.valid,true);assert.notEqual(r.verse,null);assert.ok(r.issues.some(i=>/punctuation/.test(i)));}});
test('reported impossible Philippians transcription is retained as invalid, never guessed as 4:9 or 4:19',()=>{const r=parse('Philippians 4.92').references[0];assert.equal(r.label,'Philippians 4:92');assert.equal(r.valid,false);});
test('chapter-only explanation asks for missing verse; wrong books are not silently rewritten',()=>{assert.match(parse('Genesis 1').references[0].issues.join(' '),/Verse number missing/);assert.equal(parse('John 1-1').references[0].book,'John');assert.equal(parse('Philippians 419').references[0].valid,false);});

for(const [spoken,code]of [['Amplified version','AMP'],['Amplified Bible','AMP'],['Amplified Classic','AMPC'],['Amplified Bible, Classic Edition','AMPC'],['New International Version','NIV'],['New King James Version','NKJV'],['King James Version','KJV'],['The Message','MSG']])test('spoken translation: '+spoken,()=>{const r=parse('John 5:10 in the '+spoken).references[0];assert.equal(r.label,'John 5:10');assert.equal(r.translation,code);if(code!=='KJV')assert.equal(r.numberingSystem,null);});
