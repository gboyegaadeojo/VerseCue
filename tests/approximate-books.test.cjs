'use strict';
// NR-022: near-misspellings of a book name are read as that book only before chapter/verse wording, and are review-only.
const test=require('node:test');const assert=require('node:assert/strict');const {parse}=require('../core/parser.cjs');
const read=text=>parse(text,{defaultTranslation:'KJV',maxVerses:176}).references;
test('close misspellings heard by the engine become the book, marked for review',()=>{
  for(const [heard,label] of [['Turn with me to Habakuk chapter 2 verse 3.','Habakkuk 2:3'],['Hagiai chapter 2 verse 9','Haggai 2:9'],['Ecclesiastees 3 verse 1','Ecclesiastes 3:1'],['Obadi verse 15.','Obadiah 1:15'],['Zeccariah chapter 4 verse 6','Zechariah 4:6'],['First Thesalonians chapter 5 verse 16','1 Thessalonians 5:16']]){
    const r=read(heard);assert.equal(r.length,1,heard);assert.equal(r[0].label,label);assert.ok(r[0].issues.includes('Book name heard approximately · review'),heard);
  }
});
test('commas between the book and "verse" are accepted (single-chapter books)',()=>{
  assert.equal(read('3 John, verse 2')[0].label,'3 John 1:2');assert.equal(read('Jude, verse 24')[0].label,'Jude 1:24');
});
test('exact names are unchanged and carry no approximation issue',()=>{
  for(const t of ['John 3:16','Habakkuk chapter 2 verse 3','Philemon chapter one verse six'])assert.ok(!read(t)[0].issues.some(i=>/approximately/.test(i)),t);
});
test('ordinary words and mishearings that are not close are never turned into books',()=>{
  for(const t of ['page number 3 verse 2','the judge 5 verse 3','Feel Him in Chapter 1 verse 6','June verse 24','I have 3 things, verse 2','Hagiye Chapter 2 verse 9','we will sing hymn number 3','in chapter 2 the author says','Habakuk is a prophet'])assert.equal(read(t).length,0,t);
});
