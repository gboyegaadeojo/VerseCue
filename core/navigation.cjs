'use strict';
// Deterministic relative-reference intent. Input numbers are already normalized.
function relativeNavigation(text,{context,now,bounds,translation,corrected=false}){
 const cleaned=String(text).toLowerCase().replace(/[.,!?;:"\u201c\u201d]/g,' ').replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim();
 const hasNavigation=/\b(?:next|previous) verse\b|\bverses? \d|\b(?:same verse|same passage|next chapter|previous chapter|go (?:back|forward) \d+ verses?)\b/.test(cleaned);
 if(/^(?:stay there|hold (?:that|it|the verse|the passage|on)|(?:do not|don't) (?:change|show|display)(?: (?:it|that|the verse|the passage))?|wait(?: please| a moment)?|not yet|stop there)$/.test(cleaned)||hasNavigation&&/\b(?:do not|don't|not now|not yet|never)\b/.test(cleaned))return {command:{kind:'hold'},issues:[]};
 if(hasNavigation&&/\b(?:he said|she said|someone said|yesterday|last week|tomorrow|imagine|if we|if you)\b/.test(cleaned))return {command:{kind:'ignored-navigation'},issues:['Navigation was discussed or quoted; no display instruction accepted']};
 let phrase=cleaned.replace(/^(?:(?:please|now|okay|and)\s+)+/,'').replace(/^(?:i meant|can we|let us|let's)\s+/,'');
 phrase=phrase.replace(/^(?:read|show|go to|turn to|look at|move to|go back to|give us|give me|have)\s+/,'').replace(/^the\s+/,'').replace(/\s+please$/,'');
 let kind=null,match=null,distance=1;
 if(/^(?:next|previous) verse$/.test(phrase))kind=phrase.startsWith('next')?'next':'previous';
 else if((match=phrase.match(/^go (back|forward) (\d+) verses?$/))){kind=match[1]==='back'?'previous':'next';distance=+match[2];}
 else if((match=phrase.match(/^verses? (\d+)(?: (?:through|to|-) (?:verse )?(\d+))?$/)))kind='jump';
 else if((match=phrase.match(/^chapter (\d+)(?: verses? (\d+)(?: (?:through|to|-) (?:verse )?(\d+))?)?$/)))kind='chapter';
 else if(/^(?:same verse|same passage|that verse|that passage|read that again|read it again|repeat that verse|repeat that passage|that again|it again)$/.test(phrase))kind='same';
 else if(/^(?:next|previous) chapter$/.test(phrase))kind=phrase.startsWith('next')?'next-chapter':'previous-chapter';
 if(!kind)return hasNavigation?{command:{kind:'ignored-navigation'},issues:['Ambiguous navigation wording; use an explicit reference or a clear next/previous verse instruction']}:{issues:[]};
 if(!context?.verified||!Number.isFinite(context.verifiedAt)||now<context.verifiedAt||now-context.verifiedAt>120000||!Number.isInteger(context.verse))return {command:{kind:'navigation'},issues:['Current passage context is not verified or has expired; specify the book, chapter and verse']};
 if(distance<1||distance>10)return {command:{kind:'navigation'},issues:['Relative navigation is limited to one through ten verses']};
 const r={...context,translation:translation??context.translation,relative:true,corrected,navigationKind:kind};
 if(kind==='same')return {command:{kind:'navigation'},reference:r,issues:[]};
 r.endVerse=undefined;r.endChapter=undefined;
 if(kind==='jump'){r.chapter=context.endChapter??context.chapter;r.verse=+match[1];r.endVerse=match[2]?+match[2]:undefined;}
 else if(kind==='chapter'){r.chapter=+match[1];r.verse=match[2]?+match[2]:null;r.endVerse=match[3]?+match[3]:undefined;}
 else{
  const chapters=bounds?.[context.book];
  if(!chapters)return {command:{kind:'navigation'},issues:['Translation numbering is unavailable for relative navigation; specify the full passage']};
  if(kind==='next-chapter'||kind==='previous-chapter'){r.chapter=(kind==='next-chapter'?(context.endChapter??context.chapter):context.chapter)+(kind==='next-chapter'?1:-1);r.verse=1;if(!chapters[r.chapter-1])return {command:{kind:'navigation'},issues:['Book boundary reached; specify the next book explicitly']};}
  else{
   const direction=kind==='next'?1:-1;r.chapter=direction===1?(context.endChapter??context.chapter):context.chapter;r.verse=direction===1?(context.endVerse??context.verse):context.verse;
   if(!chapters[r.chapter-1]||r.verse<1||r.verse>chapters[r.chapter-1])return {command:{kind:'navigation'},issues:['Current passage numbering is not verified']};
   for(let step=0;step<distance;step++){r.verse+=direction;if(r.verse>chapters[r.chapter-1]){r.chapter++;r.verse=1;}else if(r.verse<1){r.chapter--;r.verse=chapters[r.chapter-1];}if(!chapters[r.chapter-1])return {command:{kind:'navigation'},issues:['Book boundary reached; specify the next book explicitly']};}
  }
 }
 return {command:{kind:'navigation'},reference:r,issues:[]};
}
module.exports={relativeNavigation};
