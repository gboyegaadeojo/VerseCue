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
  // Whisper often writes spoken ordinals as 1st/2nd/3rd; never drop them (1st John is not John).
  s=s.replace(/\b(phill?ipp?ians)\b/g,'philippians');
  return s.replace(/\b(1st|first|i)\s+(?=samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john)/g,'1 ').replace(/\b(2nd|second|ii)\s+(?=samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john)/g,'2 ').replace(/\b(3rd|third|iii)\s+(?=john)/g,'3 ').replace(/\bpsalms\b/g,'psalm').replace(/\brevelations\b/g,'revelation').replace(/song of solomon/g,'song of songs');
}
// Exact common abbreviations and the reported transcription spelling only.
const aliases={gen:'Genesis',exod:'Exodus',exo:'Exodus',lev:'Leviticus',num:'Numbers',deut:'Deuteronomy',josh:'Joshua',judg:'Judges',ps:'Psalm',psa:'Psalm',prov:'Proverbs',eccl:'Ecclesiastes',isa:'Isaiah',jer:'Jeremiah',lam:'Lamentations',ezek:'Ezekiel',dan:'Daniel',hos:'Hosea',obad:'Obadiah',mic:'Micah',hab:'Habakkuk',zeph:'Zephaniah',zech:'Zechariah',mal:'Malachi',matt:'Matthew',mt:'Matthew',mk:'Mark',lk:'Luke',jn:'John',rom:'Romans',cor:'Corinthians',gal:'Galatians',eph:'Ephesians',phil:'Philippians',col:'Colossians',thess:'Thessalonians',tim:'Timothy',phlm:'Philemon',heb:'Hebrews',jas:'James',pet:'Peter',rev:'Revelation',revelaations:'Revelation'};
function citationForms(text){let s=text.replace(/\b([123])(?=[a-z])/g,'$1 ');for(const [short,full]of Object.entries(aliases))s=s.replace(new RegExp('\\b'+short+'\\.?(?=\\s*\\d)','g'),full.toLowerCase()+' ');return s.replace(/\b(chapter|verse)\s+number\s+/g,'$1 ').replace(/\b(?:ch|chap)\.?\s*(?=\d)/g,'chapter ').replace(/\b(?:vs|vv|v)\.?\s*(?=\d)/g,'verse ').replace(/\b(?:and\s+)?(?:(?:starting|beginning|start|begin)\s+(?:from|at)|from|at)\s+(?=verses?\b)/g,'').replace(/(\d)\s+and\s+(?=verses?\b)/g,'$1 ').replace(/([a-z])(?=\d)/g,'$1 ');}
const bookPattern = names.slice().sort((a,b)=>b.length-a.length).map(n=>n.toLowerCase()).join('|');
// Approximate book names (NR-022). The speech engine often hears the right book but spells it slightly differently
// ("Habakuk", "Ecclesiastees", "Zeccariah", "Hagiai"). A word close to one book name (one letter off for names of five or
// six letters, two for longer names) is read as that book, but only when chapter or verse wording follows. Such references
// carry a review issue, so Auto never sends them; Confirm and Prepare for volunteer show or prepare them for a person.
const fuzzyTargets=[...new Set(names.flatMap(n=>{const w=n.toLowerCase().split(' ');return w.length===1||/^\d$/.test(w[0])&&w.length===2?[w.at(-1)]:[];}))];
const fuzzyStop=new Set(['number','judge','judged','games','names','things','rings','meter','later','water','chapter','chapters','verse','verses','through','about','there','where']);
function editDistance(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1),i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]?d[i-2][j-2]+1:Infinity);return d[a.length][b.length];}
function approximateBooks(s,approximated){
  return s.replace(/\b([a-z]{4,})(?=\s*,?\s*(?:chapter\b|verses?\b|\d+\s*,?\s*(?:verses?\b|:)))/g,word=>{
    if(fuzzyTargets.includes(word)||fuzzyStop.has(word))return word;
    let best=null,bestDistance=Infinity,tie=false;
    for(const name of fuzzyTargets){const limit=name.length>=7?2:name.length>=5?1:0;if(!limit||Math.abs(name.length-word.length)>limit)continue;const d=editDistance(word,name);if(d>limit)continue;if(d<bestDistance){best=name;bestDistance=d;tie=false;}else if(d===bestDistance)tie=true;}
    if(!best||tie)return word;approximated.add(best);return best;
  });
}
// Ordinals heard apart from their book (2026-11-24 user report: "1st/Second" not understood). A pause makes the speech
// engine write "First, John 1:9", "1st. John" or "2 nd Timothy"; read naively that is the Gospel of John. The number is
// joined to a numbered book, and such references carry a review issue because the pause makes the wording ambiguous.
const numberedBase='samuel|kings|chronicles|corinthians|thessalonians|timothy|peter|john';
function joinSeparatedOrdinals(text){
  let separated=false;
  let s=text.replace(/\b([123])\s+(st|nd|rd)\b/gi,'$1$2');
  s=s.replace(new RegExp(`\\b(first|second|third|1st|2nd|3rd|[123])\\s*[.,;:!?]+\\s*(${numberedBase})\\b`,'gi'),(m,ordinal,book)=>{separated=true;return ordinal+' '+book;});
  return {text:s,separated};
}
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
function parse(text, {context=null, now=Date.now(), bounds=null, defaultTranslation='KJV',maxVerses=10}={}) {
  // 176 covers the longest chapter (Psalm 119) so a whole chapter can be read; Auto keeps its own 10-verse limit.
  if(!Number.isSafeInteger(maxVerses)||maxVerses<1||maxVerses>176)throw Error('Invalid passage verse limit');
  if(typeof text!=='string'||text.length>8192) return {references:[],issues:['Invalid transcript size']};
  const joined=joinSeparatedOrdinals(text);
  let s=normalize(citationForms(normalize(joined.text)));
  // Commas Whisper inserts between book, chapter and verse ("Psalm 21, verse 1", "First Peter, chapter 2, verse 1").
  const approximated=new Set();s=approximateBooks(s,approximated);if(approximated.size)s=normalize(s);
  s=s.replace(new RegExp(`((?:${bookPattern}))\\s*,\\s*(?=chapter\\b|verses?\\b|\\d)`,'g'),'$1 ').replace(/\b(chapter|verses?)\s*,\s*(?=\d)/g,'$1 ').replace(new RegExp(`((?:${bookPattern})(?:\\s+chapter)?\\s+\\d+)\\s*,\\s*(?=(?:verses?\\s+)?\\d+(?![\\d,]|\\s*(?:,|and\\b|&)))`,'g'),'$1 ');
  const corrected=/\b(sorry|i meant|rather|correction|not)\b/.test(s);
  if(/\bnot\b/.test(s)&&/\bi meant\b/.test(s)) s=s.split(/\bnot\b/)[0];
  else if(/\b(sorry|rather|correction)\b/.test(s)) s=s.split(/\b(?:sorry|rather|correction)\b/).at(-1);
  const translationAlias={'NEW INTERNATIONAL VERSION':'NIV','NEW INTERNATIONAL':'NIV','NEW KING JAMES VERSION':'NKJV','NEW KING JAMES':'NKJV','KING JAMES VERSION':'KJV','KING JAMES':'KJV','AMPLIFIED BIBLE CLASSIC EDITION':'AMPC','AMPLIFIED CLASSIC VERSION':'AMPC','AMPLIFIED CLASSIC':'AMPC','AMPLIFIED BIBLE':'AMP','AMPLIFIED VERSION':'AMP','AMPLIFIED':'AMP','THE MESSAGE':'MSG','MESSAGE':'MSG','KJV':'KJV','NKJV':'NKJV','NIV':'NIV','ASV':'ASV','ESV':'ESV','AMPC':'AMPC','AMP':'AMP','MSG':'MSG','ENGLISH STANDARD VERSION':'ESV','ENGLISH STANDARD':'ESV','AMERICAN STANDARD VERSION':'ASV','NEW LIVING TRANSLATION':'NLT','NEW LIVING':'NLT','NLT':'NLT'};
  const translationText=s.replace(/,/g,'').replace(/\s+/g,' '),translationNames=Object.keys(translationAlias).sort((a,b)=>b.length-a.length).join('|');
  const translationPhrase=translationText.match(new RegExp('\\b('+translationNames+')\\b','i'))?.[1]?.toUpperCase()??null;
  const translation=translationAlias[translationPhrase]??null;
  const references=[]; const issues=[];
  const re=new RegExp(`(?<![a-z0-9])(${bookPattern})\\s+(?:chapter\\s+)?(\\d+)(?:\\s*[:.\\-]\\s*|\\s+(?:verses?\\s+)?)(\\d+)(?:\\s*(?:through|to|-)\\s*(?:verses?\\s+)?(?:(\\d+)(?:\\s*:\\s*|\\s+(?:verse\\s+)?))?(\\d+))?`,'g');
  let m;
  while((m=re.exec(s))) {
    if(/(?:\b[1-9](?:\s*(?:st|nd|rd))?|\b(?:first|second|third))\s+$/.test(s.slice(Math.max(0,m.index-8),m.index)) && !/^\d/.test(m[1])) {issues.push('Invalid or ambiguous book ordinal');continue;}
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
      if(/(?:\b[1-9](?:\s*(?:st|nd|rd))?|\b(?:first|second|third))\s+$/.test(s.slice(Math.max(0,m.index-8),m.index))&&!/^\d/.test(m[1])){issues.push('Invalid or ambiguous book ordinal');continue;}
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
  // Version request for the passage just used (NR-018): "can you give me NIV", "read that in New King James".
  // Only the version is named; the session applies it to the last passage. Never an automatic send.
  if(!references.length&&translation&&!command?.kind?.match(/^(?:hold|navigation)$/)){
   const rest=translationText.toLowerCase().replace(/[.,!?;:"“”]/g,' ').replace(new RegExp('\\b(?:the\\s+)?'+translationPhrase.toLowerCase().replace(/\s+/g,'\\s+')+'(?:\\s+(?:version|translation|bible))?\\b'),' ').replace(/\s+/g,' ').trim();
   if(/^(?:(?:pastor|okay|ok|please|now|and|so|can|could|would|will|you|we|i|us|me|give|have|read|show|put|it|that|this|those|these|them|one|verse|verses|passage|in|into|to|from|using|switch|change|let's|let|see|instead|again|please|for)\s*)*$/.test(rest))command={kind:'version',translation};
  }
  for(const r of references) {
    const selectedBounds=bounds??numbering(r.translation??(r.relative?context?.translation:null)??defaultTranslation);
    r.issues=validate(r,selectedBounds);r.valid=r.issues.length===0;r.numberingSystem=selectedBounds===kjvBounds?'KJV':selectedBounds?'provided':null;
    if(r.verse==null)r.issues.push('Verse number missing or not understood. Enter the full book, chapter and verse.');
    if(r.verse!=null&&new RegExp('\\b'+r.chapter+'\\s*[.\\-]\\s*'+r.verse+'\\b').test(s))r.issues.push('Chapter/verse punctuation interpreted; confirm against the spoken reference.');
    if(!selectedBounds)r.issues.push('Translation numbering requires verified ProPresenter preparation');
    let rangeLength=r.endVerse&&(!r.endChapter||r.endChapter===r.chapter)?r.endVerse-r.verse+1:1;
    if(r.endChapter&&r.endChapter!==r.chapter&&selectedBounds&&r.valid){rangeLength=(selectedBounds[r.book][r.chapter-1]-r.verse+1)+r.endVerse;for(let chapter=r.chapter+1;chapter<r.endChapter;chapter++)rangeLength+=selectedBounds[r.book][chapter-1];}
    r.rangeLength=r.verse!=null&&r.valid&&(!r.endChapter||r.endChapter===r.chapter||selectedBounds)?rangeLength:null;
    r.overLimit=r.rangeLength!==null&&r.rangeLength>maxVerses;if(r.overLimit)r.issues.push('Range exceeds the '+maxVerses+'-verse limit; shorten it or use ProPresenter manually');
    if(!r.overLimit&&r.rangeLength>10)r.issues.push('Extended range requires explicit Confirm review; never Auto');
    if(r.implicitChapter)r.issues.push('Implicit single chapter · review');
    if(approximated.has(r.book.toLowerCase().split(' ').at(-1)))r.issues.push('Book name heard approximately · review');
    if(joined.separated&&/^\d/.test(r.book))r.issues.push('Number and book were heard apart · review');
    if(/\b(do not show|not now|don.t show)\b/.test(s))r.issues.push('Explicit no-show instruction');
    if(/\b(in french|in spanish)\b/.test(s))r.issues.push('Requested language is not supported');
    r.label=label(r); r.autoEligible=false;
  }
  return {references,issues,corrected,command,multiple:references.length>1};
}
module.exports={parse,normalize,citationForms,validate,label,names,chapters,numbering};
