'use strict';
// Bounded deterministic citation fragments only. No sermon concatenation or text persistence.
const {parse,normalize,citationForms,names,chapters}=require('./parser.cjs');
const books=names.slice().sort((a,b)=>b.length-a.length).join('|');
const lead="(?:(?:please )?(?:turn to|show|read|let us read|open to|open your bibles to) )?";
const editions='kjv|asv|amp|ampc|niv|nkjv|msg|esv|amplified classic(?: version)?|amplified(?: version| bible)?|the message|new international(?: version)?|new king james(?: version)?|king james(?: version)?';
const edition=`(?: (?:in|from|using) (?:the )?(?:${editions}))?`;
const numberRange='\\d+(?:\\s*(?:through|to|-)\\s*\\d+)?';
const clean=text=>normalize(citationForms(normalize(text))).trim().replace(/[.,!?]+$/,'').trim().replace(/(\d)\s*(?:vs|vv|v)$/,'$1 verse').replace(/\s+/g,' ');
class CitationStabilizer{
 constructor({onExpire=()=>{}}={}){this.onExpire=onExpire;this.reset();}
 reset(){clearTimeout(this.timer);this.timer=null;this.pending=null;this.last=null;}
 remember(pending,now){this.pending=pending;clearTimeout(this.timer);this.timer=setTimeout(()=>{if(this.pending===pending){this.pending=null;this.timer=null;this.onExpire();}},Math.max(0,15000-(now-pending.origin)));this.timer.unref?.();}
 head(text,translation,maxVerses=10){
  const editionHead=text.match(new RegExp(`^(${lead}(?:${books}) (?:chapter )?\\d+(?:[:.]| (?:verses? )?)${numberRange}) (?:in|from|using)(?: the)?$`,'i'));
  if(editionHead){const r=parse(editionHead[1],{defaultTranslation:translation,maxVerses}).references[0];if(r?.valid&&r.verse!=null)return {prefix:r.label,expect:'edition'};}
  const chapterHead=text.match(new RegExp(`^${lead}(${books}) chapter$`,'i'));
  if(chapterHead)return {prefix:names.find(name=>name.toLowerCase()===chapterHead[1].toLowerCase()),expect:'chapter',bareChapter:true};
  const single=text.match(new RegExp(`^${lead}(${names.filter((_,i)=>chapters[i]===1).join('|')}) verses?$`,'i'));
  if(single)return {prefix:names.find(name=>name.toLowerCase()===single[1].toLowerCase())+' 1',expect:'verse',bare:true};
  const range=text.match(new RegExp(`^${lead}(${books}) (?:chapter )?(\\d+)(?:[:.]| (?:verses? )?)(\\d+) (?:through|to|-)$`,'i'));
  if(range){const r=parse(`${range[1]} ${range[2]}:${range[3]}`,{defaultTranslation:translation,maxVerses}).references[0];if(r?.valid&&r.verse!=null)return {prefix:r.label,expect:'range'};}
  const match=text.match(new RegExp(`^${lead}(${books})(?: (?:chapter )?(\\d+)(?:\\s*(:|verses?))?)?$`,'i'));
  if(!match)return null;const book=names.find(name=>name.toLowerCase()===match[1].toLowerCase());
  if(!match[2])return chapters[names.indexOf(book)]===1?{prefix:book+' 1',expect:'verse'}:{prefix:book,expect:'chapter'};
  const r=parse(`${book} ${match[2]}`,{defaultTranslation:translation,maxVerses}).references[0];
  return r?.valid?{prefix:r.label,expect:'verse',bare:!!match[3]}:null;
 }
 feed({text,final,metadata,evidence,receivedAt,now,scope,translation='KJV',maxVerses=10}){
  if(!Number.isSafeInteger(maxVerses)||maxVerses<1||maxVerses>50){this.reset();throw Error('Invalid citation verse limit');}
  const ordinary={text,sourceAgeMs:evidence.sourceAgeMs??0,assembled:false,suppress:false};
  const identity=typeof metadata?.captureSessionId==='string'&&/^[a-f0-9-]{36}$/i.test(metadata.captureSessionId)&&Number.isSafeInteger(metadata.windowSequence)&&metadata.windowSequence>0;
  if(final!==true){this.reset();return {...ordinary,suppress:true,state:'unstable',reason:'Waiting for final recognition.'};}
  if(!identity||!evidence.timingKnown||!evidence.lossFree||evidence.stale||!['silence','window-limit'].includes(evidence.endEvidence)||typeof text!=='string'||text.length>200){this.reset();return ordinary;}
  const key=metadata.captureSessionId,sequence=metadata.windowSequence;
  if(this.last?.key===key&&this.last.sequence===sequence)return {...ordinary,suppress:true,state:'duplicate'};
  const start=receivedAt-metadata.bufferedAgeMs,end=start+metadata.windowDurationMs,normalized=clean(text),prior=this.pending;
  const contiguous=prior&&prior.key===key&&prior.scope===scope&&prior.translation===translation&&prior.maxVerses===maxVerses&&sequence===prior.sequence+1&&start>=prior.end-100&&start-prior.end<=3000&&now-prior.origin<15000&&prior.parts.length<3;
  this.pending=null;clearTimeout(this.timer);this.timer=null;this.last={key,sequence};
  if(contiguous){
   let tail=null;
   if(prior.expect==='chapter'&&new RegExp(`^chapter \\d+(?:(?:[:.]| verses? )${numberRange})?${edition}$`,'i').test(normalized))tail=normalized;
   if(prior.expect==='chapter'&&prior.bareChapter&&new RegExp(`^\\d+(?:(?:[:.]| verses? )${numberRange})?${edition}$`,'i').test(normalized))tail='chapter '+normalized;
   if(prior.expect==='verse'&&(new RegExp(`^verses? ${numberRange}${edition}$`,'i').test(normalized)||prior.bare&&new RegExp(`^${numberRange}${edition}$`,'i').test(normalized)))tail=/^verses? /.test(normalized)?normalized:'verse '+normalized;
   if(prior.expect==='range'&&new RegExp(`^(?:verses? )?\\d+${edition}$`,'i').test(normalized))tail=normalized.replace(/^verses? /,'');
   if(prior.expect==='edition'&&new RegExp(`^(?:the )?(?:${editions})$`,'i').test(normalized))tail='in '+normalized;
   if(tail){
    const combined=prior.prefix+(prior.expect==='range'?'-':' ')+tail,rows=parse(combined,{defaultTranslation:translation,maxVerses}).references;
    const r=rows.length===1?rows[0]:null,parts=[...prior.parts,text];
    if(r?.valid&&r.verse!=null)return {text:combined,sourcePhrase:parts.join(' / '),sourceAgeMs:Math.max(evidence.sourceAgeMs??0,now-prior.origin),assembled:true,suppress:false,fragmentCount:parts.length};
    const next=this.head(combined,translation,maxVerses);if(next){this.remember({...prior,...next,sequence,end,parts},now);return {...ordinary,suppress:true,state:'waiting',reason:'Waiting for the rest of the Bible reference.'};}
   }
  }
  const head=this.head(normalized,translation,maxVerses);
  if(head){this.remember({...head,key,sequence,scope,translation,maxVerses,origin:start,end,parts:[text]},now);return {...ordinary,suppress:true,state:'waiting',reason:'Waiting for the rest of the Bible reference.'};}
  return ordinary;
 }
}
module.exports={CitationStabilizer};
