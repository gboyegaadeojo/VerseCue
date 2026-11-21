'use strict';
// Builds a bundled quote-matching index from an eBible.org public-domain "vpl" text file.
// The index is used only to recognise quoted wording; ProPresenter remains the only place Bible text is shown.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {parse,names}=require('../core/parser.cjs');
const CODES='GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA JER LAM EZE DAN HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO 2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV'.split(' ');
const [source,translation,name,url,zipSha256,out]=process.argv.slice(2);
if(!source||!/^[A-Z]{2,8}$/.test(translation??'')||!name||!/^https:\/\//.test(url??'')||!/^[a-f0-9]{64}$/.test(zipSha256??'')||!out)throw Error('Usage: node scripts/build-public-domain-quote-index.cjs <vpl.txt> <CODE> <name> <source-url> <zip-sha256> <out.json>');
if(CODES.length!==66||names.length!==66)throw Error('Book order mismatch');
const words=text=>(text.match(/[A-Za-z0-9]+/g)??[]).length;
const passages=[];let skippedShort=0,skippedLong=0;
for(const line of fs.readFileSync(source,'utf8').replace(/^﻿/,'').split(/\r?\n/)){
  const m=/^([0-9A-Z]{3}) (\d+):(\d+) (.+)$/.exec(line);if(!m)continue;
  const index=CODES.indexOf(m[1]);if(index<0)throw Error('Unknown book code '+m[1]);
  const reference=`${names[index]} ${+m[2]}:${+m[3]}`,text=m[4].replace(/[[\]{}]/g,'').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
  const parsed=parse(reference,{defaultTranslation:'KJV'}).references;
  if(parsed.length!==1||parsed[0].label!==reference)throw Error('Reference does not round-trip: '+reference);
  const count=words(text);if(count<8){skippedShort++;continue;}if(count>400){skippedLong++;continue;}
  passages.push({reference,text});
}
const document={schemaVersion:1,translation,name,license:'Public domain',source:url,sourceSha256:zipSha256,purpose:'Quoted-wording recognition only. VerseCue never displays this text; ProPresenter shows the installed translation.',passages};
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(document));
console.log(JSON.stringify({translation,passages:passages.length,skippedShort,skippedLong,bytes:fs.statSync(out).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex')}));
