'use strict';
// Offline Auto rehearsal (NFR-003, NR-010 trust gate). Replays timed recognition windows through the app's
// own stabilizer, Session and GuardedAuto in dry run, then scores every automatic send against reviewed labels.
// It never contacts ProPresenter, captures audio or certifies service acceptance.
const {randomUUID}=require('node:crypto');
const {Session}=require('./session.cjs');
const {GuardedAuto}=require('./guarded-auto.cjs');
const {CitationStabilizer}=require('./citation-stabilizer.cjs');
const {speechEvidence}=require('./speech-evidence.cjs');
const {parse}=require('./parser.cjs');
const GATE_SECONDS=36000,SOURCES=['SYNTHETIC-TEXT','SYNTHETIC-TTS','REAL-RECORDING'],SPLITS=['training','tuning','held-out'];
const fail=message=>{throw new Error(message);};
const id=value=>typeof value==='string'&&/^[A-Za-z0-9._-]{1,80}$/.test(value);
function canonical(reference,translation='KJV'){const rows=parse(String(reference??''),{defaultTranslation:translation,maxVerses:50}).references;return rows.length===1&&rows[0].valid&&rows[0].verse!=null?rows[0].label:null;}
function validateStream(stream){
  const keys=['schemaVersion','recordingId','source','split','durationSeconds','dataUseAuthorized','labelsReviewed','windows','labels'];
  if(!stream||typeof stream!=='object'||Array.isArray(stream)||stream.schemaVersion!==1)fail('Unsupported rehearsal stream');
  for(const key of Object.keys(stream))if(!keys.includes(key))fail('Unknown rehearsal field');
  if(!id(stream.recordingId)||!SOURCES.includes(stream.source)||!SPLITS.includes(stream.split))fail('Invalid rehearsal identity');
  if(!Number.isFinite(stream.durationSeconds)||stream.durationSeconds<=0||stream.durationSeconds>43200)fail('Invalid rehearsal duration');
  if(stream.source==='REAL-RECORDING'&&(stream.dataUseAuthorized!==true||typeof stream.labelsReviewed!=='boolean'))fail('Real recordings need data-use authorization and a label review flag');
  if(!Array.isArray(stream.windows)||stream.windows.length>200000||!Array.isArray(stream.labels)||stream.labels.length>20000)fail('Invalid rehearsal arrays');
  let last=0;for(const w of stream.windows){
    if(!w||typeof w!=='object'||Object.keys(w).some(k=>!['endSeconds','durationSeconds','text','endEvidence','elapsedMs','droppedSamples'].includes(k)))fail('Invalid window');
    if(!Number.isFinite(w.endSeconds)||w.endSeconds<last||w.endSeconds>stream.durationSeconds+1)fail('Windows must be ordered within the recording');
    if(!Number.isFinite(w.durationSeconds)||w.durationSeconds<0.2||w.durationSeconds>10||w.endSeconds-w.durationSeconds< -0.001)fail('Invalid window duration');
    if(typeof w.text!=='string'||w.text.length>8192||!['silence','window-limit'].includes(w.endEvidence))fail('Invalid window content');
    if(!Number.isFinite(w.elapsedMs)||w.elapsedMs<0||w.elapsedMs>20000||!Number.isSafeInteger(w.droppedSamples)||w.droppedSamples<0)fail('Invalid window timing');
    last=w.endSeconds;
  }
  for(const l of stream.labels){
    if(!l||typeof l!=='object'||Object.keys(l).some(k=>!['atSeconds','reference','translation','intent'].includes(k)))fail('Invalid label');
    if(!Number.isFinite(l.atSeconds)||l.atSeconds<0||l.atSeconds>stream.durationSeconds+1||!['display','mention'].includes(l.intent)||typeof l.translation!=='string'||!/^[A-Z0-9]{2,8}$/.test(l.translation))fail('Invalid label fields');
    if(canonical(l.reference,l.translation)!==l.reference)fail('Labels must use canonical single references');
  }
  return stream;
}
async function replay(stream,{holdMs=1000,citationPolicy='explicit-command',maxPassageVerses=10,duplicateCooldownSeconds=10}={}){
  let now=0;const timers=[];const sends=[];
  const connector={base:'http://127.0.0.1:1025',status:{state:'connected'},version:{host_description:'REHEARSAL dry run'},armed:false,mappings:new Map(),arm(v){this.armed=v;},async send(c,{dryRun,guard}){if(!dryRun)fail('Rehearsal never writes output');if(guard&&!guard())fail('canceled');sends.push({atMs:now,reference:c.label,translation:c.translation});return {state:'simulated'};}};
  const service=new Session(connector,{clock:()=>now});service.configure({dryRun:true,translation:'KJV',maxPassageVerses,duplicateCooldownSeconds});service.capture={active:true,ownerId:1};service.enableAuto({acknowledged:true,citationPolicy,acknowledgeBareCitations:citationPolicy==='bare-citation'});
  const automatic=new GuardedAuto(service,{delayMs:holdMs,schedule:(fn,ms)=>{const t={fn,due:now+ms,live:true};timers.push(t);return t;},clear:t=>{if(t)t.live=false;}});
  const stabilizer=new CitationStabilizer();const captureSessionId=randomUUID();let sequence=0;
  const runTimers=async until=>{for(;;){const next=timers.filter(t=>t.live&&t.due<=until).sort((a,b)=>a.due-b.due)[0];if(!next)break;next.live=false;now=Math.max(now,next.due);await next.fn();}};
  for(const w of stream.windows){
    const receivedAt=Math.round(w.endSeconds*1000);await runTimers(receivedAt);now=Math.max(now,receivedAt);
    const durationMs=Math.round(w.durationSeconds*1000),samples=durationMs*16;
    const metadata={windowId:randomUUID(),captureSessionId,windowSequence:++sequence,endEvidence:w.endEvidence,windowDurationMs:samples/16,bufferedAgeMs:samples/16,speechEndAgeMs:w.endEvidence==='silence'?Math.min(1000,samples/16):0,timingBasis:'capture-monotonic-proxy',droppedSamples:w.droppedSamples,clippedSamples:0};
    now+=w.elapsedMs;await runTimers(now);
    const evidence=speechEvidence(metadata,samples,receivedAt,now);
    const stabilized=stabilizer.feed({text:w.text,final:true,metadata,evidence,receivedAt,now,scope:'rehearsal',translation:service.translation,maxVerses:maxPassageVerses});
    if(stabilized.suppress){if(stabilized.state!=='duplicate'){automatic.cancel();service.invalidate();}continue;}
    if(!evidence.contextUsable){service.context=null;service.queue=[];automatic.cancel();}
    const candidates=await service.ingestChecked(stabilized.text,{authorized:true,id:metadata.windowId,sourceAgeMs:stabilized.sourceAgeMs});
    if(stabilized.assembled)for(const c of candidates){c.reference.autoEligible=false;c.issues.push('Assembled from adjacent speech windows; confirm the complete reference.');}
    if(!evidence.timingKnown||!evidence.lossFree)for(const c of candidates)c.issues.push('Audio was dropped or timing is unknown.');
    automatic.consider(candidates,{source:'local-speech',final:true,elapsedMs:w.elapsedMs,endEvidence:evidence.endEvidence,droppedSamples:w.droppedSamples,endAgeMs:evidence.endAgeMs,observedAt:evidence.receivedAt});
  }
  await runTimers(Number.POSITIVE_INFINITY);stabilizer.reset();
  return sends;
}
function score(stream,sends,{matchWindowSeconds=20}={}){
  const used=new Set(),wrong={wrongReference:0,mentionDisplayed:0,spurious:0},matched=[];
  for(const send of sends){
    const at=send.atMs/1000,near=stream.labels.map((l,i)=>({l,i})).filter(({l})=>l.atSeconds<=at&&at-l.atSeconds<=matchWindowSeconds);
    const hit=near.find(({l,i})=>!used.has(i)&&l.intent==='display'&&l.reference===send.reference&&l.translation===send.translation);
    if(hit){used.add(hit.i);matched.push(send);continue;}
    if(near.some(({l})=>l.intent==='display'))wrong.wrongReference++;else if(near.some(({l})=>l.intent==='mention'))wrong.mentionDisplayed++;else wrong.spurious++;
  }
  const displayLabels=stream.labels.filter(l=>l.intent==='display').length,wrongOutputs=wrong.wrongReference+wrong.mentionDisplayed+wrong.spurious,hours=stream.durationSeconds/3600;
  return {automaticSends:sends.length,correctAutomaticSends:matched.length,wrongOutputs,wrong,displayLabels,missedDisplays:displayLabels-matched.length,wrongPerHour:hours?wrongOutputs/hours:null};
}
async function rehearse(streams,options={}){
  if(!Array.isArray(streams)||!streams.length||streams.length>500)fail('Provide 1-500 rehearsal streams');
  const ids=new Set(),rows=[];
  for(const raw of streams){const stream=validateStream(raw);if(ids.has(stream.recordingId))fail('Duplicate recording');ids.add(stream.recordingId);rows.push({recordingId:stream.recordingId,source:stream.source,split:stream.split,durationSeconds:stream.durationSeconds,eligibleForGate:stream.source==='REAL-RECORDING'&&stream.split==='held-out'&&stream.labelsReviewed===true,...score(stream,await replay(stream,options),options)});}
  const gateRows=rows.filter(r=>r.eligibleForGate),sum=(list,key)=>list.reduce((t,r)=>t+r[key],0);
  const gateSeconds=sum(gateRows,'durationSeconds'),gateWrong=sum(gateRows,'wrongOutputs');
  return {schemaVersion:1,kind:'versecue-auto-rehearsal',options:{holdMs:options.holdMs??1000,citationPolicy:options.citationPolicy??'explicit-command',matchWindowSeconds:options.matchWindowSeconds??20},recordings:rows,
    gate:{requiredSeconds:GATE_SECONDS,reviewedHeldOutRealSeconds:gateSeconds,wrongOutputs:gateWrong,automaticSends:sum(gateRows,'automaticSends'),correctAutomaticSends:sum(gateRows,'correctAutomaticSends'),missedDisplays:sum(gateRows,'missedDisplays'),passed:gateSeconds>=GATE_SECONDS&&gateWrong===0},
    limits:['Dry-run replay of supplied recognition windows; not live audio, ProPresenter output or physical screens','Labels and windows are caller-supplied; the tool cannot verify ground truth or consent','Passing this gate does not pass P0, latency, platform or field acceptance'],serviceAcceptancePassed:false};
}
module.exports={rehearse,replay,score,validateStream,GATE_SECONDS};
