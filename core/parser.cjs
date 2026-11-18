'use strict';
// Reference metadata only. No Bible text is distributed.
const names = 'Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Proverbs|Ecclesiastes|Song of Songs|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation'.split('|');
const chapters = [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22];
const small = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ');
const tens = {twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
const kjvBounds=require('./kjv-versification.json').bounds;
const {relativeNavigation}=require('./navigation.cjs');
function numbering(translation){return translation==='KJV'?kjvBounds:null;}
function normalize(text) {
  let s = String(text).toLowerCase().replace(/[–—]/g,'-');
  s = s.replace(/\b(one hundred|a hundred)\b/g,'hundred');
  s = s.replace(/\b(?:(?:one|two|three|four|five|six|seven|eight|nine)[ -]+)?hundred(?:[ -]+and)?(?:[ -]+(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety))?(?:[ -]+(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen))?\b/g, m => {
    const tokens=m.trim().split(/[ -]+/); const h=tokens.indexOf('hundred');
    let n=(h===0?1:small.indexOf(tokens[0]))*100;
    for(const t of tokens.slice(h+1)) n+=tens[t]??Math.max(0,small.indexOf(t));
    return String(n);
  });
  s=s.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[ -]+(one|two|three|four|five|six|seven|eight|nine))?\b/g,(_,a,b)=>String(tens[a]+(b?small.indexOf(b):0)));
  s=s.replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/g,m=>String(small.indexOf(m)));
  return s.replace(/\b(first|i)\s+(?=samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john)/g,'1 ').replace(/\b(second|ii)\s+(?=samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john)/g,'2 ').replace(/\b(third|iii)\s+(?=john)/g,'3 ').replace(/\bpsalms\b/g,'psalm').replace(/\brevelations\b/g,'revelation').replace(/song of solomon/g,'song of songs');
}
// Exact common abbreviations and the reported transcription spelling only.
const aliases={gen:'Genesis',exod:'Exodus',exo:'Exodus',lev:'Leviticus',num:'Numbers',deut:'Deuteronomy',josh:'Joshua',judg:'Judges',ps:'Psalm',psa:'Psalm',prov:'Proverbs',eccl:'Ecclesiastes',isa:'Isaiah',jer:'Jeremiah',lam:'Lamentations',ezek:'Ezekiel',dan:'Daniel',hos:'Hosea',obad:'Obadiah',mic:'Micah',hab:'Habakkuk',zeph:'Zephaniah',zech:'Zechariah',mal:'Malachi',matt:'Matthew',mt:'Matthew',mk:'Mark',lk:'Luke',jn:'John',rom:'Romans',cor:'Corinthians',gal:'Galatians',eph:'Ephesians',phil:'Philippians',col:'Colossians',thess:'Thessalonians',tim:'Timothy',phlm:'Philemon',heb:'Hebrews',jas:'James',pet:'Peter',rev:'Revelation',revelaations:'Revelation'};
function citationForms(text){let s=text.replace(/\b([123])(?=[a-z])/g,'$1 ');for(const [short,full]of Object.entries(aliases))s=s.replace(new RegExp('\\b'+short+'\\.?(?=\\s*\\d)','g'),full.toLowerCase()+' ');return s.replace(/\b(chapter|verse)\s+number\s+/g,'$1 ').replace(/\b(?:ch|chap)\.?\s*(?=\d)/g,'chapter ').replace(/\b(?:vs|vv|v)\.?\s*(?=\d)/g,'verse ').replace(/\b(?:and\s+)?(?:(?:starting|beginning|start|begin)\s+(?:from|at)|from|at)\s+(?=verses?\b)/g,'').replace(/(\d)\s+and\s+(?=verses?\b)/g,'$1 ').replace(/([a-z])(?=\d)/g,'$1 ');}
const bookPattern = names.slice().sort((a,b)=>b.length-a.length).map(n=>n.toLowerCase()).join('|');
function label(r) { return `${r.book} ${r.chapter}${r.verse==null?'':`:${r.verse}${r.endChapter&&r.endChapter!==r.chapter?`-${r.endChapter}:${r.endVerse}`:r.endVerse&&r.endVerse!==r.verse?`-${r.endVerse}`:''}`}`; }
function validate(r, bounds) {
  const i=names.indexOf(r.book); const reasons=[];
  if(i<0||!Number.isInteger(r.chapter)||r.chapter<1||r.chapter>chapters[i]) reasons.push('Invalid book or chapter');
  if(r.verse!=null && (!Number.isInteger(r.verse)||r.verse<1||r.verse>176)) reasons.push('Invalid verse');
  if(r.endVerse!=null && (r.endVerse<1||r.endVerse>176||(r.endChapter??r.chapter)<r.chapter||((r.endChapter??r.chapter)===r.chapter&&r.endVerse<r.verse))) reasons.push('Invalid range');
  if(r.endChapter && r.endChapter>chapters[i]) reasons.push('Invalid end chapter');
  if(bounds && r.verse!=null) {
    const max=bounds[r.book]?.[r.chapter-1];
    const endMax=bounds[r.book]?.[(r.endChapter??r.chapter)-1];
    if(!max||r.verse>max|| (r.endVerse && (!endMax||r.endVerse>endMax))) reasons.push('Verse outside verified versification');
  }
  return reasons;
}
function parse(text, {context=null, now=Date.now(), bounds=null, defaultTranslation='KJV'}={}) {
  if(typeof text!=='string'||text.length>8192) return {references:[],issues:['Invalid transcript size']};
  let s=normalize(citationForms(normalize(text))); const corrected=/\b(sorry|i meant|rather|correction|not)\b/.test(s);
  if(/\bnot\b/.test(s)&&/\bi meant\b/.test(s)) s=s.split(/\bnot\b/)[0];
  else if(/\b(sorry|rather|correction)\b/.test(s)) s=s.split(/\b(?:sorry|rather|correction)\b/).at(-1);
  const translationAlias={'NEW INTERNATIONAL VERSION':'NIV','NEW INTERNATIONAL':'NIV','NEW KING JAMES VERSION':'NKJV','NEW KING JAMES':'NKJV','KING JAMES VERSION':'KJV','KING JAMES':'KJV','AMPLIFIED BIBLE CLASSIC EDITION':'AMPC','AMPLIFIED CLASSIC VERSION':'AMPC','AMPLIFIED CLASSIC':'AMPC','AMPLIFIED BIBLE':'AMP','AMPLIFIED VERSION':'AMP','AMPLIFIED':'AMP','THE MESSAGE':'MSG','MESSAGE':'MSG','KJV':'KJV','NKJV':'NKJV','NIV':'NIV','ASV':'ASV','ESV':'ESV','AMPC':'AMPC','AMP':'AMP','MSG':'MSG'};
  const translationText=s.replace(/,/g,'').replace(/\s+/g,' '),translationNames=Object.keys(translationAlias).sort((a,b)=>b.length-a.length).join('|');
  const translationPhrase=translationText.match(new RegExp('\\b('+translationNames+')\\b','i'))?.[1]?.toUpperCase()??null;
  const translation=translationAlias[translationPhrase]??null;
  const references=[]; const issues=[];
  const re=new RegExp(`(?<![a-z0-9])(${bookPattern})\\s+(?:chapter\\s+)?(\\d+)(?:\\s*[:.\\-]\\s*|\\s+(?:verses?\\s+)?)(\\d+)(?:\\s*(?:through|to|-)\\s*(?:verses?\\s+)?(?:(\\d+)(?:\\s*:\\s*|\\s+(?:verse\\s+)?))?(\\d+))?`,'g');
  let m;
  while((m=re.exec(s))) {
    if(/\b[1-9]\s+$/.test(s.slice(Math.max(0,m.index-3),m.index)) && !/^\d/.test(m[1])) {issues.push('Invalid or ambiguous book ordinal');continue;}
    const book=names.find(n=>n.toLowerCase()===m[1]);
    references.push({book,chapter:+m[2],verse:+m[3],endChapter:m[4]?+m[4]:undefined,endVerse:m[5]?+m[5]:undefined,translation,relative:false,corrected});
  }
  if(!references.length) {
    const singleRe=/\b(obadiah|philemon|2 john|3 john|jude)\s+verse\s+(\d+)/g;
    while((m=singleRe.exec(s)))references.push({book:names.find(n=>n.toLowerCase()===m[1]),chapter:1,verse:+m[2],translation,relative:false,corrected,implicitChapter:true});
  }
  if(!references.length) {
    const chapterRe=new RegExp(`(?<![a-z0-9])(${bookPattern})\\s+(?:chapter\\s+)?(\\d+)(?:\\s+verse\\s+(\\d+))?`,'g');
    while((m=chapterRe.exec(s))) {
      if(/\b[1-9]\s+$/.test(s.slice(Math.max(0,m.index-3),m.index))&&!/^\d/.test(m[1])){issues.push('Invalid or ambiguous book ordinal');continue;}
      references.push({book:names.find(n=>n.toLowerCase()===m[1]),chapter:+m[2],verse:m[3]?+m[3]:null,translation,relative:false,corrected});
    }
  }
  let command=null;
  if(!references.length&&!issues.length){
    let relativeText=translationText,relativeTranslation=context?.translation??defaultTranslation;
    if(translationPhrase){const edition=new RegExp('\\b(?:in|from|using)\\s+(?:the\\s+)?'+translationPhrase+'\\b','i');if(edition.test(relativeText)){relativeText=relativeText.replace(edition,'').trim();relativeTranslation=translation;}}
    const navigation=relativeNavigation(relativeText,{context,now,bounds:bounds??numbering(relativeTranslation),translation:relativeTranslation,corrected});
    command=navigation.command??null;issues.push(...navigation.issues);if(navigation.reference)references.push(navigation.reference);
  }
  for(const r of references) {
    const selectedBounds=bounds??numbering(r.translation??(r.relative?context?.translation:null)??defaultTranslation);
    r.issues=validate(r,selectedBounds);r.valid=r.issues.length===0;r.numberingSystem=selectedBounds===kjvBounds?'KJV':selectedBounds?'provided':null;
    if(r.verse==null)r.issues.push('Verse number missing or not understood. Enter the full book, chapter and verse.');
    if(r.verse!=null&&new RegExp('\\b'+r.chapter+'\\s*[.\\-]\\s*'+r.verse+'\\b').test(s))r.issues.push('Chapter/verse punctuation interpreted; confirm against the spoken reference.');
    if(!selectedBounds)r.issues.push('Translation numbering requires verified ProPresenter preparation');
    let rangeLength=r.endVerse&&(!r.endChapter||r.endChapter===r.chapter)?r.endVerse-r.verse+1:1;
    if(r.endChapter&&r.endChapter!==r.chapter&&selectedBounds&&r.valid){rangeLength=(selectedBounds[r.book][r.chapter-1]-r.verse+1)+r.endVerse;for(let chapter=r.chapter+1;chapter<r.endChapter;chapter++)rangeLength+=selectedBounds[r.book][chapter-1];}
    r.overLimit=rangeLength>10;if(r.overLimit)r.issues.push('Range exceeds the 10-verse limit; shorten it or use ProPresenter manually');
    if(r.implicitChapter)r.issues.push('Implicit single chapter · review');
    if(/\b(do not show|not now|don.t show)\b/.test(s))r.issues.push('Explicit no-show instruction');
    if(/\b(in french|in spanish)\b/.test(s))r.issues.push('Requested language is not supported');
    r.label=label(r); r.autoEligible=false;
  }
  return {references,issues,corrected,command,multiple:references.length>1};
}
module.exports={parse,normalize,validate,label,names,chapters,numbering};
