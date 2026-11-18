'use strict';
// Reference/cue metadata validation only. No Bible text is created or verified.
const {parse,numbering}=require('./parser.cjs');
function exactReference(reference,translation){const rows=parse(reference,{defaultTranslation:translation}).references;if(rows.length!==1||rows[0].label!==reference||rows[0].valid!==true||rows[0].verse==null||rows[0].overLimit)throw Error('Use one valid canonical passage');return rows[0];}
function titleReference(name,translation){if(typeof name!=='string'||typeof translation!=='string')return null;const suffix=' ('+translation+')';if(!name.endsWith(suffix))return null;const text=name.slice(0,-suffix.length).replace(/(\d)_(?=\d)/g,'$1:');try{return exactReference(text,translation).label;}catch{return null;}}
function verses(reference,translation){const r=exactReference(reference,translation),bounds=numbering(translation);if(!bounds)throw Error('Translation numbering is not verified');const endChapter=r.endChapter??r.chapter,endVerse=r.endVerse??r.verse,result=[];for(let chapter=r.chapter;chapter<=endChapter;chapter++){const end=chapter===endChapter?endVerse:bounds[r.book][chapter-1];for(let verse=chapter===r.chapter?r.verse:1;verse<=end;verse++){result.push(`${r.book} ${chapter}:${verse}`);if(result.length>10)throw Error('Passage exceeds ten verses');}}return result;}
function planSavedPassage({p,slides},{uuid,reference,translation}){
 const expected=verses(reference,translation),requested=new Set(expected);
 if(p?.id?.uuid!==uuid||p.destination!=='presentation'||p.has_timeline||titleReference(p.id.name,translation)!==reference)throw Error('Saved Bible passage identity is not exact');
 if(!Array.isArray(slides)||!slides.length||slides.length>100)throw Error('Saved passage has no bounded cue sequence');
 const covered=new Set();let previous=-1;
 for(const slide of slides){if(slide.enabled!==true||typeof slide.text!=='string'||!slide.text.trim())throw Error('Saved passage contains a disabled or empty cue');const labels=verses(slide.label,translation);if(labels.some(label=>!requested.has(label)))throw Error('Saved passage contains an unrelated cue');const first=expected.indexOf(labels[0]);if(first<previous)throw Error('Saved passage cue order is inconsistent');previous=first;for(const label of labels)covered.add(label);}
 if(expected.some(label=>!covered.has(label)))throw Error('Saved passage coverage is incomplete');
 return {state:'passage-needs-review',reference,translation,uuid,cueIndices:slides.map((_,index)=>index),singleCue:slides.length===1,coveredVerses:expected,coverageComplete:true,bibleTextVerified:false,formattingVerified:false,outputObserved:false,outputRequests:0};
}
module.exports={planSavedPassage,titleReference,verses};
