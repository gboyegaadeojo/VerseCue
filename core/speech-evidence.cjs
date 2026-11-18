'use strict';
// Durations cross IPC; renderer and backend wall clocks are never subtracted.
// Capture timing is a conservative proxy, not measured audible-reference end.
function speechEvidence(metadata,sampleCount,receivedAt,now){
 const elapsed=now-receivedAt;if(!Number.isFinite(elapsed)||elapsed<0)throw Error('Recognition clock evidence is invalid');
 const timed=metadata?.timingBasis==='capture-monotonic-proxy'&&typeof metadata.windowId==='string'&&/^[a-f0-9-]{36}$/i.test(metadata.windowId)&&Number.isFinite(metadata.bufferedAgeMs)&&metadata.bufferedAgeMs>=sampleCount/16&&metadata.bufferedAgeMs<=120000&&Number.isFinite(metadata.speechEndAgeMs)&&metadata.speechEndAgeMs>=0&&metadata.speechEndAgeMs<=metadata.bufferedAgeMs&&metadata.windowDurationMs===sampleCount/16;
 const lossFree=Number.isSafeInteger(metadata?.droppedSamples)&&metadata.droppedSamples===0&&metadata.clippedSamples===0;
 return {windowId:timed?metadata.windowId:null,timingKnown:timed,sourceAgeMs:timed?metadata.bufferedAgeMs+elapsed:null,endAgeMs:timed?metadata.speechEndAgeMs+elapsed:null,receivedAt:now,recognitionTotalMs:elapsed,lossFree,endEvidence:metadata?.endEvidence??null,stale:timed&&metadata.bufferedAgeMs+elapsed>=15000,contextUsable:timed&&lossFree&&metadata?.endEvidence==='silence'};
}
module.exports={speechEvidence};
