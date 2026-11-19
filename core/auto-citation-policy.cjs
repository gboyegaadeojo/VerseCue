'use strict';
const {normalize,citationForms}=require('./parser.cjs');
const policies=['explicit-command','bare-citation'];
function validateAutoPolicy(policy='explicit-command',acknowledgedBare=false){if(!policies.includes(policy))throw Error('Choose a supported Auto citation policy');if(policy==='bare-citation'&&acknowledgedBare!==true)throw Error('Explicit acknowledgment is required for bare-citation Auto');return policy;}
function bareCitation(phrase,reference){
 if(typeof phrase!=='string'||phrase.length>300||!reference||!Number.isInteger(reference.chapter)||!Number.isInteger(reference.verse)||reference.endVerse!==undefined&&!Number.isInteger(reference.endVerse)||reference.endChapter&&reference.endChapter!==reference.chapter)return false;
 const book=String(reference.book).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),text=citationForms(normalize(phrase)).trim().replace(/\.$/,'').trim();
 const end=reference.endVerse&&reference.endVerse!==reference.verse?`\\s*(?:-|to|through)\\s*${reference.endVerse}`:'';
 return new RegExp(`^${book}\\s+(?:chapter\\s+)?${reference.chapter}(?::\\s*|\\s+(?:verses?\\s+)?)${reference.verse}${end}(?:\\s+in\\s+(?:the\\s+)?(?:kjv|king james(?: version)?))?$`,'i').test(text);
}
function citationIntent(candidate,policy='explicit-command'){
 const phrase=candidate.phrase;
 if(/\b(?:he said|she said|last week|yesterday|we studied|in this song|lyrics|do not|don['’]t|not now|tomorrow)\b/i.test(phrase))return false;
 return /\b(?:turn to|show|read|let us read|let['’]s read)\b/i.test(phrase)||policy==='bare-citation'&&bareCitation(phrase,candidate.reference);
}
module.exports={validateAutoPolicy,bareCitation,citationIntent};
