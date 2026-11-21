'use strict';
// Offline scoring of supplied reference proposals. Never captures/transcribes audio.
const {parse}=require('../core/parser.cjs');
const sources=['SYNTHETIC-TEXT','SYNTHETIC-TTS','REAL-RECORDING'],splits=['training','tuning','held-out'];
const idPattern=/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/,shaPattern=/^[a-f0-9]{64}$/;
const isId=value=>typeof value==='string'&&idPattern.test(value),isSha=value=>typeof value==='string'&&shaPattern.test(value);
function requireValue(condition,message){if(!condition)throw Error(message);}
function object(value,keys,message){requireValue(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(key=>keys.includes(key)),message);}
function proportion(successes,total){
 requireValue(Number.isSafeInteger(successes)&&Number.isSafeInteger(total)&&successes>=0&&successes<=total,'Invalid proportion counts');
 if(total===0)return {successes,total,value:null,wilson95:null};
 const z=1.959963984540054,z2=z*z,p=successes/total,denominator=1+z2/total,center=(p+z2/(2*total))/denominator,half=z*Math.sqrt(p*(1-p)/total+z2/(4*total*total))/denominator;
 return {successes,total,value:p,wilson95:{lower:Math.max(0,center-half),upper:Math.min(1,center+half)}};
}
function entry(value,expected,index){
 object(value,['reference','translation'],'Invalid reference entry');
 requireValue(typeof value.reference==='string'&&value.reference.length>0&&value.reference.length<=160&&!/[\x00-\x1f]/.test(value.reference),'Invalid reference value');
 const edition=value.translation;
 requireValue(edition===null||edition===undefined||typeof edition==='string'&&edition.length<=30&&!/[\x00-\x1f]/.test(edition),'Invalid translation value');
 const knownEdition=typeof edition==='string'&&/^[A-Z0-9][A-Z0-9 -]{1,29}$/.test(edition);
 const parsed=parse(value.reference,{defaultTranslation:knownEdition?edition:'KJV',maxVerses:50}),r=parsed.references[0];
 const canonical=parsed.references.length===1&&r&&r.label===value.reference&&Number.isSafeInteger(r.chapter)&&r.chapter>0&&Number.isSafeInteger(r.verse)&&r.verse>0;
 if(expected)requireValue(canonical&&knownEdition,'Expected labels must contain canonical citation forms and explicit translation codes');
 const reference=canonical?r.label:'!invalid-reference-'+index;
 return {reference,passage:reference+'\0'+(knownEdition?edition:'!unknown-translation')};
}
function countMatches(expected,predicted,key){const remaining=new Map();for(const item of expected)remaining.set(item[key],(remaining.get(item[key])??0)+1);let matches=0;for(const item of predicted){const n=remaining.get(item[key])??0;if(n){matches++;remaining.set(item[key],n-1);}}return matches;}
function newGroup(source,split){return {source,split,scoredClips:0,excludedClips:0,expectedReferences:0,predictedReferences:0,referenceMatches:0,passageMatches:0,sequenceMatches:0,negativeClips:0,trueNegativeClips:0,labeledAudioSeconds:0,mismatchedCaseIds:[]};}
function finish(group){
 const metric=matches=>({truePositives:matches,falsePositives:group.predictedReferences-matches,falseNegatives:group.expectedReferences-matches,precision:proportion(matches,group.predictedReferences),recall:proportion(matches,group.expectedReferences)});
 return {...group,reference:metric(group.referenceMatches),referenceAndTranslation:metric(group.passageMatches),exactSequenceAgreement:proportion(group.sequenceMatches,group.scoredClips)};
}
function evaluateRecognition(data){
 object(data,['schemaVersion','datasetId','experimentId','cases'],'Invalid dataset object');
 requireValue(data.schemaVersion===1&&isId(data.datasetId)&&isId(data.experimentId),'Invalid dataset version or identifiers');
 requireValue(Array.isArray(data.cases)&&data.cases.length>0&&data.cases.length<=5000,'Provide 1 to 5000 labeled cases');
 const ids=new Set(),hashes=new Set(),recordingSplits=new Map(),groups=new Map(),excluded=[];
 const key=(source,split)=>source+'/'+split;
 for(const [caseIndex,row]of data.cases.entries()){
  object(row,['id','source','split','recordingId','audioSha256','durationSeconds','dataUseAuthorized','labelsReviewed','annotationSha256','expected','predicted'],'Invalid case object');
  requireValue(isId(row.id)&&!ids.has(row.id),'Case identifiers must be unique opaque identifiers');ids.add(row.id);
  requireValue(sources.includes(row.source)&&splits.includes(row.split),'Invalid source or split');
  requireValue(Array.isArray(row.expected)&&row.expected.length<=20&&Array.isArray(row.predicted)&&row.predicted.length<=20,'Reference lists must contain at most 20 entries');
  const audio=row.source!=='SYNTHETIC-TEXT';
  if(audio){
   requireValue(isId(row.recordingId)&&isSha(row.audioSha256)&&Number.isFinite(row.durationSeconds)&&row.durationSeconds>0&&row.durationSeconds<=60,'Audio cases need recording/hash provenance and 0-60 seconds of duration');
   requireValue(!hashes.has(row.audioSha256),'Duplicate audio hashes cannot inflate the sample');hashes.add(row.audioSha256);
   const previous=recordingSplits.get(row.recordingId);requireValue(previous===undefined||previous===row.split,'A source recording cannot span training/tuning/held-out splits');recordingSplits.set(row.recordingId,row.split);
  }else requireValue(row.durationSeconds===undefined||row.durationSeconds===null,'Synthetic text cannot claim measured audio duration');
  if(row.source==='REAL-RECORDING'){
   requireValue(row.dataUseAuthorized===true,'Real recording evaluation requires explicit data-use authorization');
   requireValue(typeof row.labelsReviewed==='boolean','Declare real-label review status explicitly');
   if(row.labelsReviewed)requireValue(isSha(row.annotationSha256),'Reviewed real labels need an annotation artifact hash');
  }
  const expected=row.expected.map((item,i)=>entry(item,true,caseIndex+'-'+i)),predicted=row.predicted.map((item,i)=>entry(item,false,caseIndex+'-'+i));
  const groupKey=key(row.source,row.split);if(!groups.has(groupKey))groups.set(groupKey,newGroup(row.source,row.split));const group=groups.get(groupKey);
  if(row.source==='REAL-RECORDING'&&!row.labelsReviewed){group.excludedClips++;excluded.push({id:row.id,reason:'REAL_LABELS_NOT_REVIEWED'});continue;}
  group.scoredClips++;group.expectedReferences+=expected.length;group.predictedReferences+=predicted.length;
  group.referenceMatches+=countMatches(expected,predicted,'reference');group.passageMatches+=countMatches(expected,predicted,'passage');
  const sequenceMatches=expected.length===predicted.length&&expected.every((item,i)=>item.passage===predicted[i].passage);
  if(sequenceMatches)group.sequenceMatches++;else group.mismatchedCaseIds.push(row.id);
  if(!expected.length){group.negativeClips++;if(!predicted.length)group.trueNegativeClips++;}
  if(audio)group.labeledAudioSeconds+=row.durationSeconds;
 }
 const results=sources.flatMap(source=>splits.map(split=>groups.get(key(source,split))).filter(Boolean).map(finish));
 return {schemaVersion:1,datasetId:data.datasetId,experimentId:data.experimentId,caseCount:data.cases.length,groups:results,realHeldOut:results.find(group=>group.source==='REAL-RECORDING'&&group.split==='held-out')??finish(newGroup('REAL-RECORDING','held-out')),excluded,
  matching:'Exact canonical citation-form multiset within each labeled clip; duplicates count as extra proposals. Sequence agreement is separate. Verse existence, numbering and installed-edition availability are not scored.',
  serviceAcceptancePassed:false,groundTruthVerifiedByTool:false,audibleEndOutputLatencyMeasured:false,falsePositivesPerSermonHour:null,
  limitations:['Labels, authorization, split identifiers and hashes are supplied attestations; audio and independent review are not verified by this scorer.','Synthetic sources and training/tuning splits are never pooled into real held-out metrics.','Wilson95 intervals are nominal binomial score intervals; independence/representativeness of clips is not established.','Clip-level counts do not prove continuous-sermon false-positive rate, speech accents, display safety, physical fidelity or end-to-end latency.']};
}
module.exports={evaluateRecognition,proportion};
