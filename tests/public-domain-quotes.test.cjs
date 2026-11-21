'use strict';
// Bundled public-domain wordings (KJV, WEB). Recognition only; no output.
const test=require('node:test'),assert=require('node:assert/strict');
const {publicDomainQuoteMatcher}=require('../core/public-domain-quotes.cjs');const {QuoteMatcher,MultiQuoteMatcher}=require('../core/quote-matcher.cjs');const {Session}=require('../core/session.cjs');
test('well-known quotes in old and modern wording match; ordinary speech does not',async()=>{
  const m=await publicDomainQuoteMatcher();assert.equal(m.status().publicDomain,true);assert.ok(m.status().passages>60000);
  for(const [text,ref] of [['For God so loved the world, that he gave his only begotten Son','John 3:16'],['For God so loved the world that he gave his one and only Son, that whoever believes in him','John 3:16'],['The Lord is my shepherd, I shall not want','Psalm 23:1'],['We know that all things work together for good to those who love God','Romans 8:28'],['I can do all things through Christ who strengthens me','Philippians 4:13'],['Trust in the Lord with all your heart and lean not on your own understanding','Proverbs 3:5']])assert.equal(m.match(text,'KJV')?.reference,ref,text);
  for(const text of ['God is good all the time and we thank him for his love','So we went to the store and then we came back home again today','Please do not show the Lord is my shepherd I shall not want'])assert.equal(m.match(text,'KJV'),null,text);
});
test('a public-domain match is prepared in the configured translation and labelled as quoted wording',async()=>{
  const s=new Session({});s.configure({dryRun:true,translation:'NIV'});await s.loadPublicDomainQuotes();s.enableQuotes(true);
  const [c]=s.ingest('The Lord is my shepherd, I shall not want');assert.equal(c.label,'Psalm 23:1');assert.equal(c.translation,'NIV');assert.equal(c.recognition,'quote');assert.match(c.issues.join(' '),/^Matched from quoted wording/);assert.equal(c.reference.autoEligible,false);
});
test('disagreeing wordings and half-built indexes never produce a match',async()=>{
  const doc=(translation,reference)=>({schemaVersion:1,translation,passages:[{reference,text:'alpha bravo charlie delta echo foxtrot golf hotel india juliet'}]});
  const a=new QuoteMatcher(doc('KJV','John 3:16'),{rightsAcknowledged:true,anyTranslation:true}),b=new QuoteMatcher(doc('WEB','John 3:17'),{rightsAcknowledged:true,anyTranslation:true});
  assert.equal(new MultiQuoteMatcher([a,b]).match('alpha bravo charlie delta echo foxtrot golf hotel','KJV'),null);
  const pending=new QuoteMatcher(doc('KJV','John 3:16'),{rightsAcknowledged:true,anyTranslation:true,defer:true});assert.equal(pending.match('alpha bravo charlie delta echo foxtrot golf hotel','KJV'),null);
  await pending.buildAsync();assert.equal(pending.match('alpha bravo charlie delta echo foxtrot golf hotel','KJV').reference,'John 3:16');
});
