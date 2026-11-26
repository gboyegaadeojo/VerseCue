'use strict';
// Labels for the ten-hour Auto rehearsal (NFR-003, NR-010 trust gate) and recognition scoring (NFR-002).
// A person listens to an authorized recording and marks each Bible reference as it is spoken. This module checks
// those marks, stores them in a small labels file (references and times only, never a transcript) and copies
// them into a rehearsal stream built by build-rehearsal-stream.cjs. It never reads the stream's recognized text.
const {createHash}=require('node:crypto');
const {parse}=require('./parser.cjs');
const TRANSLATIONS=['KJV','AMP','AMPC','NIV','NKJV','MSG','ESV','ASV','NLT'];
const INTENTS=['display','mention'];
const MAX_SECONDS=43200,MAX_LABELS=20000,DURATION_TOLERANCE=1;
const fail=message=>{throw new Error(message);};
const isId=value=>typeof value==='string'&&/^[A-Za-z0-9._-]{1,80}$/.test(value);
const isHash=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);

// Turns what the listener typed ("jn 3 16", "Romans 8:28 NIV") into the app's canonical single reference.
function canonicalReference(text,translation='KJV'){
  const typed=String(text??'').trim();
  if(!typed)return {ok:false,error:'Type the reference you heard, such as John 3:16.'};
  if(typed.length>80)return {ok:false,error:'That is too long for one reference.'};
  const rows=parse(typed,{defaultTranslation:translation,maxVerses:50}).references;
  if(rows.length===0)return {ok:false,error:'VerseCue does not recognise that as a Bible reference.'};
  if(rows.length>1)return {ok:false,error:'Enter one reference at a time.'};
  const row=rows[0];
  if(!row.valid)return {ok:false,error:'That chapter or verse does not exist.'};
  if(row.verse==null)return {ok:false,error:'Add a verse, such as Psalm 23:1. The rehearsal scores verse references only.'};
  const edition=row.translation??translation;
  if(!TRANSLATIONS.includes(edition))return {ok:false,error:'Choose a Bible version.'};
  return {ok:true,reference:row.label,translation:edition};
}

function checkLabel(label,durationSeconds){
  if(!label||typeof label!=='object'||Object.keys(label).some(k=>!['atSeconds','reference','translation','intent'].includes(k)))fail('Invalid label');
  if(!Number.isFinite(label.atSeconds)||label.atSeconds<0||label.atSeconds>durationSeconds+DURATION_TOLERANCE)fail('Label time is outside the recording');
  if(!INTENTS.includes(label.intent)||!TRANSLATIONS.includes(label.translation))fail('Invalid label fields');
  const canonical=canonicalReference(label.reference,label.translation);
  if(!canonical.ok||canonical.reference!==label.reference||canonical.translation!==label.translation)fail('Labels must use canonical single references');
  return {atSeconds:Math.round(label.atSeconds*10)/10,reference:label.reference,translation:label.translation,intent:label.intent};
}

// Builds the labels file. Both attestations default to false and must be set deliberately by the listener.
function createLabelFile({recordingId,audioSha256,durationSeconds,labels=[],dataUseAuthorized=false,labelsReviewed=false}){
  if(!isId(recordingId))fail('Recording ID may use letters, numbers, dot, dash and underscore (up to 80)');
  if(!isHash(audioSha256))fail('Missing recording fingerprint');
  if(!Number.isFinite(durationSeconds)||durationSeconds<=0||durationSeconds>MAX_SECONDS)fail('Invalid recording length');
  if(!Array.isArray(labels)||labels.length>MAX_LABELS)fail('Invalid labels');
  if(typeof dataUseAuthorized!=='boolean'||typeof labelsReviewed!=='boolean')fail('Invalid attestations');
  const rows=labels.map(l=>checkLabel(l,durationSeconds)).sort((a,b)=>a.atSeconds-b.atSeconds||a.reference.localeCompare(b.reference));
  return {schemaVersion:1,kind:'versecue-rehearsal-labels',recordingId,audioSha256,durationSeconds,dataUseAuthorized,labelsReviewed,labels:rows};
}

function validateLabelFile(file){
  const keys=['schemaVersion','kind','recordingId','audioSha256','durationSeconds','dataUseAuthorized','labelsReviewed','labels'];
  if(!file||typeof file!=='object'||Array.isArray(file)||file.schemaVersion!==1||file.kind!=='versecue-rehearsal-labels')fail('Not a VerseCue labels file');
  for(const key of Object.keys(file))if(!keys.includes(key))fail('Unknown labels field');
  return createLabelFile(file);
}

const serialize=file=>JSON.stringify(validateLabelFile(file),null,1)+'\n';
// Fingerprint of the exact saved labels file, for the evaluator's annotationSha256 provenance field.
const annotationSha256=text=>createHash('sha256').update(text,'utf8').digest('hex');

// Copies labels and attestations into a stream. The stream's windows (recognized text) are passed through untouched
// and never inspected. Refuses a different recording, a different length, or a stream that already has labels.
function applyLabels(stream,labelFile){
  const file=validateLabelFile(labelFile);
  if(!stream||typeof stream!=='object'||stream.schemaVersion!==1||!Array.isArray(stream.windows)||!Array.isArray(stream.labels))fail('Not a rehearsal stream');
  if(stream.recordingId!==file.recordingId)fail('The labels are for a different recording ID');
  if(!Number.isFinite(stream.durationSeconds)||Math.abs(stream.durationSeconds-file.durationSeconds)>DURATION_TOLERANCE)fail('The labels were made on a recording of a different length');
  if(stream.labels.length>0)fail('This stream already has labels');
  return {...stream,dataUseAuthorized:file.dataUseAuthorized,labelsReviewed:file.labelsReviewed,labels:file.labels.map(l=>({...l}))};
}

// Reads the length of a PCM WAV from its header so the labels match what build-rehearsal-stream.cjs measures.
function wavDurationSeconds(bytes){
  if(bytes.length<44||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')return null;
  let offset=12,format=null,dataSize=null;
  while(offset+8<=bytes.length){const id=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4),body=offset+8;if(id==='fmt ')format={channels:bytes.readUInt16LE(body+2),rate:bytes.readUInt32LE(body+4),bits:bytes.readUInt16LE(body+14)};if(id==='data'){dataSize=Math.min(size,bytes.length-body);break;}offset=body+size+(size%2);}
  if(!format||dataSize==null||!format.rate||!format.channels||!format.bits)return null;
  return dataSize/(format.rate*format.channels*(format.bits/8));
}

module.exports={TRANSLATIONS,INTENTS,canonicalReference,createLabelFile,validateLabelFile,serialize,annotationSha256,applyLabels,wavDurationSeconds,isId};
