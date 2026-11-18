'use strict';
const {parse}=require('./parser.cjs');
const ignored=new Set('a an and are as at be been but by for from had has have he her him his i if in is it its me my of on or our so than that the their them then there these they this those to us was we were what when which who will with you your'.split(' '));
const tokens=text=>text.normalize('NFKC').toLowerCase().match(/[a-z0-9]+/g)??[];
function alignedMatch(input,verse){
  let best=null;
  for(let offset=1-verse.length;offset<input.length;offset++){
    const length=Math.min(input.length-Math.max(0,offset),verse.length-Math.max(0,-offset));let left=0;const mismatches=[];
    for(let k=0;k<length;k++){
      const i=Math.max(0,offset)+k,j=Math.max(0,-offset)+k;if(input[i]!==verse[j])mismatches.push(k);if(mismatches.length>1)left=mismatches.shift()+1;
      const words=k-left+1,differences=mismatches.length,matched=words-differences;
      if(words<8||matched<7||matched/words<.875)continue;
      const start=Math.max(0,offset)+left,distinct=new Set(input.slice(start,i+1).filter(word=>!ignored.has(word)));if(distinct.size<3)continue;
      const score=matched-2*differences;if(!best||score>best.score)best={score,matchedWords:matched,wordDifferences:differences};
    }
  }
  return best;
}
class QuoteMatcher {
  constructor(document,{rightsAcknowledged=false}={}){
    if(rightsAcknowledged!==true)throw new Error('Acknowledge rights to use the local passage text');
    if(document?.schemaVersion!==1||!/^[- A-Z0-9]{2,30}$/.test(document.translation??'')||!Array.isArray(document.passages)||!document.passages.length||document.passages.length>40000)throw new Error('Invalid local quote index');
    this.translation=document.translation;this.rows=[];this.index=new Map();const seen=new Set();let total=0;
    for(const entry of document.passages){
      if(typeof entry?.reference!=='string'||typeof entry.text!=='string'||entry.text.length>8000)throw new Error('Invalid quote-index passage');
      const parsed=parse(entry.reference,{defaultTranslation:this.translation}),reference=parsed.references[0];const words=tokens(entry.text);total+=entry.text.length;
      if(parsed.references.length!==1||!reference||reference.label!==entry.reference||reference.verse==null||reference.endVerse||reference.valid===false||words.length<8||words.length>400||seen.has(entry.reference)||total>12000000)throw new Error('Use unique valid single-verse references and bounded passage text');
      seen.add(entry.reference);const id=this.rows.length;this.rows.push({reference:entry.reference,words});for(const word of new Set(words.filter(word=>!ignored.has(word)))){if(!this.index.has(word))this.index.set(word,[]);this.index.get(word).push(id);}
    }
  }
  status(){return {translation:this.translation,passages:this.rows.length};}
  match(text,translation){
    if(typeof text!=='string'||text.length>8192||translation!==this.translation||/\b(do not|don['’]t|not now|never show|not scripture|not a bible|wrong verse|correction|i meant)\b/i.test(text))return null;
    const requested=text.match(/\b(?:in|from|using)\s+(KJV|NKJV|NIV|ASV|ESV|AMP|AMPC|MSG)\b/i)?.[1]?.toUpperCase();if(requested&&requested!==translation)return null;
    const input=tokens(text).slice(-160);if(input.length<8)return null;const candidates=new Map();
    for(const word of new Set(input.filter(word=>!ignored.has(word))))for(const id of this.index.get(word)??[])candidates.set(id,(candidates.get(id)??0)+1);
    const shortlist=[...candidates].filter(([,overlap])=>overlap>=3).sort((a,b)=>b[1]-a[1]);
    // Never discard a possible competing match to manufacture uniqueness.
    if(shortlist.length>256)return null;
    const matches=shortlist.map(([id])=>{const evidence=alignedMatch(input,this.rows[id].words);return evidence?{reference:this.rows[id].reference,translation,...evidence}:null;}).filter(Boolean).sort((a,b)=>b.score-a.score);
    if(!matches.length||matches[1]&&matches[0].score-matches[1].score<2)return null;
    const {score,...match}=matches[0];return {...match,method:match.wordDifferences?'near-verbatim':'partial-quote',calibratedProbability:false,autoEligible:false};
  }
}
module.exports={QuoteMatcher};
