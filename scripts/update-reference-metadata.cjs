'use strict';
const fs=require('node:fs');
(async()=>{
  const {bcv_parser}=await import('bible-passage-reference-parser/esm/bcv_parser.js');const language=await import('bible-passage-reference-parser/esm/lang/en.js');
  const parser=new bcv_parser(language),info=parser.translation_info('kjv');
  const {names,chapters}=require('../core/parser.cjs');
  const osis='Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');
  if(info.system!=='kjv'||info.books.slice(0,66).join('|')!==osis.join('|'))throw new Error('Unexpected source numbering system/book order');
  const bounds={};for(let i=0;i<66;i++){const values=info.chapters[osis[i]];if(values.length!==chapters[i]||values.some(n=>!Number.isInteger(n)||n<1||n>176))throw new Error('Invalid chapter/verse metadata');bounds[names[i]]=values;}
  const totalChapters=Object.values(bounds).reduce((n,a)=>n+a.length,0),totalVerses=Object.values(bounds).flat().reduce((n,v)=>n+v,0);
  if(totalChapters!==1189||totalVerses!==31102)throw new Error('Unexpected canonical KJV totals');
  fs.writeFileSync('core/kjv-versification.json',JSON.stringify({schemaVersion:1,system:'KJV',source:'openbibleinfo/Bible-Passage-Reference-Parser',sourceVersion:'4.0.0',license:'MIT',description:'Chapter verse-number bounds only; no Bible text or installed-translation assertion',totalChapters,totalVerses,bounds},null,2)+'\n');
  fs.copyFileSync('node_modules/bible-passage-reference-parser/LICENSE.md','legal/REFERENCE-METADATA-LICENSE.txt');console.log('Generated 66-book/1189-chapter KJV numeric metadata and preserved MIT notice; zero Bible text.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
