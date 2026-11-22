'use strict';
const {EventEmitter}=require('node:events');
const {randomUUID}=require('node:crypto');
const {parse}=require('./parser.cjs');
const {QuoteMatcher}=require('./quote-matcher.cjs');const {publicDomainQuoteMatcher}=require('./public-domain-quotes.cjs');
const {validateAutoPolicy}=require('./auto-citation-policy.cjs');
class Session extends EventEmitter {
  constructor(connector,{clock=()=>performance.timeOrigin+performance.now()}={}) {
    super();this.connector=connector;this.clock=clock;this.mode='confirm';this.startMode='confirm';this.autoCitationPolicy='explicit-command';this.stopped=false;this.dryRun=true;this.queue=[];this.history=[];this.events=[];this.generation=0;this.resetEpoch=0;this.busy=false;this.translation='KJV';this.context=null;this.revisions=new Map();this.lastSend=null;this.duplicateCooldownSeconds=10;this.maxPassageVerses=10;this.recentDetections=new Map();this.recentSends=new Map();
  }
  snapshot(){this.expire();return {earlyPreparation:this.prepareForVolunteer===true&&this.chapterContext!==false&&this.earlyPreparation!==false&&this.mode==='confirm'&&this.referencePreparation?.nativeConsent===true,versionNotice:this.versionNotice??null,automation:this.automation===true,speechGpu:this.speechGpu??null,resetEpoch:this.resetEpoch,maxPassageVerses:this.maxPassageVerses,settingsRecoveryRequired:this.settingsRecoveryRequired===true,speechStabilization:this.speechStabilization??{state:'idle'},referenceEpoch:this.referenceEpoch??0,referencePreparation:this.referencePreparation??{enabled:false,running:false,scope:'saved-passages-only'},interpretation:this.interpretation??null,inputEpoch:this.inputEpoch??0,preparation:this.passagePreparation??{phase:'idle'},recovery:this.recovery?{...this.recovery}:null,generation:this.generation,mode:this.mode,autoCitationPolicy:this.autoCitationPolicy,stopped:this.stopped,dryRun:this.dryRun,queue:structuredClone(this.queue),history:structuredClone(this.history),events:structuredClone(this.events),busy:this.busy,translation:this.translation,quoteMatching:this.quoteStatus(),capture:this.capture?{...this.capture}:{active:false,ownerId:null},autoStatus:this.autoStatus??null,capabilities:{auto:true,quoteAuto:false,arbitraryLookup:false,clear:false},connection:this.connector.status??{state:'offline'}};}
  notify(){this.emit('change',this.snapshot());}
  enableAuto({acknowledged=false,citationPolicy='explicit-command',acknowledgeBareCitations=false,ownerId=null}={}){if(acknowledged!==true)throw new Error('Explicit Auto acknowledgment is required');const policy=validateAutoPolicy(citationPolicy,acknowledgeBareCitations);if(this.stopped||this.recovery?.required||this.busy)throw new Error('Resume Confirm and finish pending work before enabling Auto');if(!this.dryRun){const c=this.connector;if(!c.base||new URL(c.base).hostname!=='127.0.0.1'||!c.armed||c.status?.state!=='connected'||![...c.mappings.values()].some(map=>map.autoVerified===true&&(!map.autoApproval||map.ownerId===ownerId)))throw new Error('Auto test output requires an armed loopback target and a complete cue explicitly verified for Auto');}this.invalidate();this.mode='auto';this.autoCitationPolicy=policy;this.autoStatus={state:'ready',reason:this.dryRun?'AUTO SIMULATION: no output requests':'AUTO TEST OUTPUT: verified complete cues only'};this.log('AUTO_EXPLICITLY_ENABLED','warning');this.notify();}
  quoteStatus(){return {enabled:this.quoteEnabled===true,...(this.quoteMatcher?.status()??{translation:null,passages:0})};}
  loadQuoteIndex(document,consent){const matcher=new QuoteMatcher(document,{rightsAcknowledged:consent===true});this.invalidate();this.quoteMatcher=matcher;this.quoteEnabled=false;this.log('QUOTE_INDEX_LOADED');this.notify();return this.quoteStatus();}
  async loadPublicDomainQuotes(){const matcher=await publicDomainQuoteMatcher();this.invalidate();this.quoteMatcher=matcher;this.quoteEnabled=false;this.log('QUOTE_INDEX_LOADED');this.notify();return this.quoteStatus();}
  enableQuotes(enabled){if(typeof enabled!=='boolean'||enabled&&(!this.quoteMatcher||!this.quoteMatcher.anyTranslation&&this.quoteMatcher.translation!==this.translation))throw new Error('Import a rights-acknowledged index matching the selected translation first');this.invalidate();this.quoteEnabled=enabled;this.log(enabled?'QUOTE_MATCHING_ENABLED':'QUOTE_MATCHING_DISABLED');this.notify();return this.quoteStatus();}
  log(code,state='info',metrics=null){const safe={};for(const key of ['nativeWorkerMs','sttWorkerMs'])if(Number.isFinite(metrics?.[key])&&metrics[key]>=0&&metrics[key]<=120000)safe[key]=Math.round(metrics[key]);this.events.push({id:randomUUID(),at:this.clock(),code,state,...(Object.keys(safe).length?{metrics:safe}:{})});this.events=this.events.slice(-100);}
  invalidate(){this.interpretation=null;this.inputEpoch=(this.inputEpoch??0)+1;this.autoStatus=null;this.generation++;this.queue=[];this.context=null;}
  expire(){this.queue=this.queue.filter(c=>c.expiresAt>this.clock());}
  // NR-010: the operator's saved start preference applies only at launch and session reset, never after Stop, faults or configuration changes.
  applyStartMode(){if(this.startMode==='prepare'){this.prepareForVolunteer=!(this.stopped||this.recovery?.required||this.settingsRecoveryRequired);return false;}this.prepareForVolunteer=false;if(this.startMode!=='auto'||this.stopped||this.recovery?.required||this.settingsRecoveryRequired||this.busy)return false;this.invalidate();this.mode='auto';this.autoCitationPolicy='explicit-command';this.autoStatus={state:'ready',reason:this.dryRun?'AUTO SIMULATION: started in Auto; no output requests':'AUTO: verified complete cues only'};this.log('AUTO_STARTED_BY_SETTING','warning');this.notify();return true;}
  setMode(mode){if(!['confirm','suggest','paused'].includes(mode))throw new Error('Select a supported mode; enable Auto through its acknowledgment dialog');if(this.recovery?.required&&mode!=='paused')throw new Error('Recheck the connection after wake, then Resume in Confirm');this.invalidate();this.mode=mode;this.autoCitationPolicy='explicit-command';this.log('MODE_CHANGED');this.notify();}
  stop(){this.stopped=true;this.mode='paused';this.autoCitationPolicy='explicit-command';this.invalidate();this.log('EMERGENCY_STOP','warning');this.notify();}
  resume(){if(this.recovery?.required&&(this.recovery.phase!=='resume'||this.connector.status?.state!=='connected'||!this.connector.version))throw new Error('Test the ProPresenter connection after wake before resuming Confirm');this.recovery=null;this.stopped=false;this.mode='confirm';this.autoCitationPolicy='explicit-command';this.invalidate();this.log('REARMED_CONFIRM');this.notify();}
  configure({dryRun=true,translation='KJV',duplicateCooldownSeconds=this.duplicateCooldownSeconds,maxPassageVerses=this.maxPassageVerses}={}){if(typeof dryRun!=='boolean'||!/^[- A-Z0-9]{2,30}$/.test(translation))throw new Error('Invalid session settings');if(!Number.isSafeInteger(duplicateCooldownSeconds)||duplicateCooldownSeconds<1||duplicateCooldownSeconds>300)throw Error('Invalid duplicate cooldown');if(!Number.isSafeInteger(maxPassageVerses)||maxPassageVerses<1||maxPassageVerses>176)throw Error('Invalid passage verse limit');this.maxPassageVerses=maxPassageVerses;this.duplicateCooldownSeconds=duplicateCooldownSeconds;this.invalidate();if(this.mode==='auto')this.mode='confirm';if(translation!==this.translation)this.quoteEnabled=false;this.autoCitationPolicy='explicit-command';this.dryRun=dryRun;this.translation=translation;this.log('CONFIG_CHANGED');this.notify();}
  resetDetectionCooldown(){this.recentDetections.clear();}
  referenceKey(candidate){const r=candidate.reference;return JSON.stringify([r.book,r.chapter,r.verse,r.endChapter??r.chapter,r.endVerse??r.verse,candidate.translation]);}
  pruneCooldown(map){const now=this.clock();for(const [key,value] of map)if(now-value.at>=this.duplicateCooldownSeconds*1000)map.delete(key);}
  rememberCooldown(map,key,value){this.pruneCooldown(map);if(!map.has(key)&&map.size>=200)return false;map.set(key,value);return true;}
  duplicateSend(candidate){this.pruneCooldown(this.recentSends);const key=this.referenceKey(candidate);return this.recentSends.has(key)||this.recentSends.size>=200;}
  async ingestChecked(text,options={}){
    const external=options.additionalGuard??(()=>true);
    if(!external())throw Error('Reference request was revoked');
    if(this.dryRun||options.authorized===false||this.stopped||(!options.manual&&this.mode==='paused'))return this.ingest(text,options);
    const checkStartedAt=this.clock(),context=this.context,proposed=parse(text,{context,now:this.clock(),defaultTranslation:this.translation,maxVerses:this.maxPassageVerses});
    if(!proposed.references.some(r=>r.relative&&r.valid===true))return this.ingest(text,options);
    const generation=this.generation,inputEpoch=(this.inputEpoch??0)+1;this.inputEpoch=inputEpoch;
    const valid=()=>external()&&this.context===context&&generation===this.generation&&inputEpoch===this.inputEpoch&&!this.stopped&&!this.recovery?.required;
    try{
      if(!context?.remote||typeof this.connector.verifyContext!=='function')throw Error('Current passage cannot be verified against ProPresenter');
      await this.connector.verifyContext(context.remote,valid);
      if(!valid())throw Error('Reference context check canceled');
    }catch(error){
      if(!valid())throw Error('Reference context or session changed while checking');
      this.connector.arm?.(false);this.invalidate();this.mode='paused';this.interpretation={kind:'blocked-navigation',reason:error.message};this.log('NAVIGATION_CONTEXT_LOST','warning');this.notify();return [];
    }
    const contextCheckMs=this.clock()-checkStartedAt;
    if(!Number.isFinite(contextCheckMs)||contextCheckMs<0){this.connector.arm?.(false);this.setMode('paused');throw Error('Reference check timing could not be verified');}
    return this.ingest(text,options.manual?options:{...options,sourceAgeMs:(options.sourceAgeMs??0)+contextCheckMs});
  }
  ingest(text,{id=randomUUID(),revision=1,final=true,manual=false,authorized=true,sourceAgeMs=0}={}) {
    this.inputEpoch=(this.inputEpoch??0)+1;
    if(this.stopped||(!manual&&this.mode==='paused'))return [];
    if(!Number.isFinite(sourceAgeMs)||sourceAgeMs<0)throw Error('Invalid speech evidence age');
    if(!manual&&sourceAgeMs>=15000){this.invalidate();this.interpretation={kind:'expired-speech',reason:'Recognition arrived after the audio evidence expired. Repeat the full reference.'};this.log('SPEECH_EVIDENCE_EXPIRED','warning');this.notify();return [];}
    if(typeof id!=='string'||id.length>100||!Number.isSafeInteger(revision)||revision<1)throw new Error('Invalid transcript identity');
    if((this.revisions.get(id)??0)>=revision)return [];
    this.revisions.set(id,revision);if(this.revisions.size>200)this.revisions.delete(this.revisions.keys().next().value);
    this.queue=this.queue.filter(c=>c.utteranceId!==id);
    if(!final){this.generation++;this.notify();return [];}
    const parsed=parse(text,{context:this.context,now:this.clock(),defaultTranslation:this.translation,maxVerses:this.maxPassageVerses});
    this.interpretation={kind:parsed.command?.kind??(parsed.references.length?'reference':'none'),reason:parsed.issues[0]??null};
    if(authorized&&['hold','ignored-navigation'].includes(parsed.command?.kind)){this.referenceEpoch=(this.referenceEpoch??0)+1;this.queue=[];this.log(parsed.command.kind==='hold'?'HOLD_REQUESTED':'NAVIGATION_IGNORED');this.notify();return [];}
    let quote=null;
    if(!parsed.references.length&&!parsed.issues.length&&this.quoteEnabled&&authorized&&this.mode!=='paused'){
      quote=this.quoteMatcher?.match(text,this.translation);
      if(quote){parsed.references=parse(quote.reference,{defaultTranslation:this.translation,maxVerses:this.maxPassageVerses}).references;parsed.issues.push('Matched from quoted wording, not a spoken reference. Uses the configured translation; review before showing.');}
    }
    // Version request for the passage just used (NR-018): reopen the last passage in the requested version.
    // It always waits for Prepare for volunteer or review; it is never an automatic send.
    let versionSwitch=null;
    if(authorized&&parsed.command?.kind==='version'&&!parsed.references.length){
      const last=this.lastPassage,to=parsed.command.translation;
      if(!last||this.clock()-last.at>600000){this.interpretation={kind:'version',reason:'There is no recent passage to switch to '+to+'. Say the passage with the version, for example "John 3:16 in '+to+'".'};this.versionNotice={id:this.clock(),text:this.interpretation.reason};this.log('VERSION_SWITCH_NO_PASSAGE');this.notify();return [];}
      if(last.translation===to){this.interpretation={kind:'version',reason:last.label+' is already in '+to+'.'};this.versionNotice={id:this.clock(),text:this.interpretation.reason};this.notify();return [];}
      const again=parse(last.label+' in '+to,{defaultTranslation:this.translation,maxVerses:this.maxPassageVerses});
      if(again.references.length!==1){this.interpretation={kind:'version',reason:'The last passage could not be reopened in '+to+'. Say the full reference.'};this.notify();return [];}
      parsed.references=again.references;versionSwitch={label:last.label,from:last.translation,to};this.log('VERSION_SWITCH_REQUESTED');
    }
    // A new explicit book/reference or a failed parse cannot preserve a prior
    // remote context for later relative references.
    if(parsed.references.some(r=>!r.relative)||parsed.issues.length)this.context=null;
    if(parsed.corrected&&(parsed.references.length||/^\s*(?:sorry\b|i meant\b|correction\b|rather\b)/i.test(text)))this.invalidate();
    let candidates=parsed.references.map(r=>({id:randomUUID(),utteranceId:id,revision,reference:r,label:r.label,translation:r.translation??this.translation,phrase:text.slice(0,1000),recognition:quote?'quote':'reference',...(quote?{quoteEvidence:quote}:{}),detectedAt:this.clock(),expiresAt:this.clock()+15000-(manual?0:sourceAgeMs),generation:this.generation,manual,authorized,state:authorized?'review':'blocked',issues:[...parsed.issues,...r.issues,...(!authorized?['Audio source not authorized']:[])]}));
    if(parsed.multiple)for(const candidate of candidates)candidate.issues.push('Multiple references detected; review individually');
    let suppressionReason=null;this.pruneCooldown(this.recentDetections);
    candidates=candidates.filter(candidate=>{
      if(manual||!authorized)return true;
      const key=this.referenceKey(candidate),prior=this.recentDetections.get(key);
      if(!parsed.corrected&&((prior&&prior.utteranceId!==id&&prior.ownerId===(this.capture?.ownerId??null))||this.duplicateSend(candidate))){
        suppressionReason='Repeated reference suppressed by duplicate cooldown; use manual review for an intentional resend.';return false;
      }
      // Retain existing protection when the bounded table fills, rather than
      // evicting a recent reference and silently allowing it to repeat.
      if(!this.rememberCooldown(this.recentDetections,key,{at:this.clock(),utteranceId:id,ownerId:this.capture?.ownerId??null})){
        suppressionReason='Recent-reference tracking is full. Wait for the cooldown interval or reset the session deliberately.';return false;
      }
      return true;
    });
    if(suppressionReason&&!candidates.length){this.interpretation={kind:'duplicate-reference',reason:suppressionReason};this.log('DUPLICATE_REFERENCE_SUPPRESSED');}
    if(candidates.length||parsed.issues.length)this.referenceEpoch=(this.referenceEpoch??0)+1;
    if(versionSwitch)for(const candidate of candidates){candidate.recognition='version-switch';candidate.versionSwitch=versionSwitch;candidate.reference.autoEligible=false;candidate.issues.push('Version change requested: '+versionSwitch.from+' to '+versionSwitch.to+'. Prepare it or review it before showing.');}
    // The passage just used, for a later "can you give me NIV".
    const latest=[...candidates].reverse().find(c=>c.authorized&&c.reference.valid!==false&&Number.isInteger(c.reference.chapter));if(latest)this.lastPassage={label:latest.label,translation:latest.translation,at:this.clock()};
    this.queue.push(...candidates);this.queue=this.queue.slice(-5);this.notify();return candidates;
  }
  reject(id){this.queue=this.queue.filter(c=>c.id!==id);this.log('CANDIDATE_DISMISSED');this.notify();}
  navigate(id,direction){
    this.expire();const candidate=this.queue.find(item=>item.id===id);
    if(![-1,1].includes(direction)||!candidate||this.stopped||this.busy||!candidate.authorized||candidate.generation!==this.generation||candidate.reference.valid===false||candidate.reference.overLimit||candidate.reference.verse==null||candidate.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))throw new Error('Choose a valid unexpired candidate before navigating');
    if(candidate.translation!=='KJV')throw new Error('Verified numbering is unavailable for this translation; edit the reference explicitly');
    const proposal=parse(direction===1?'next verse':'previous verse',{context:{...candidate.reference,translation:candidate.translation,verified:true,verifiedAt:this.clock()},now:this.clock(),defaultTranslation:candidate.translation,maxVerses:this.maxPassageVerses});
    const next=proposal.references[0];if(!next||next.valid!==true)throw Error(proposal.issues[0]??'Book boundary reached; choose the next book explicitly');
    this.queue=this.queue.filter(item=>item.id!==id);return this.ingest(next.label+' in '+candidate.translation,{manual:true});
  }
  reset(){this.resetEpoch++;this.quoteMatcher=null;this.quoteEnabled=false;this.invalidate();this.revisions.clear();this.history=[];this.stopped=false;this.mode=this.recovery?.required?'paused':'confirm';this.dryRun=true;this.lastSend=null;this.recentDetections.clear();this.recentSends.clear();this.autoCitationPolicy='explicit-command';this.log('SESSION_RESET');if(!this.applyStartMode())this.notify();}
  async send(id,{additionalGuard=()=>true,origin='desktop',operationOwner=null}={}){
    if(this.operationOwner&&this.operationOwner!==operationOwner)throw Error('Another passage operation is in progress');
    this.expire();const c=this.queue.find(c=>c.id===id);
    const automatic=origin==='auto',allowedMode=this.mode==='confirm'&&!automatic||this.mode==='auto'&&(automatic||origin==='desktop');
    if(!c||this.stopped||!allowedMode||this.busy||!c.authorized||c.generation!==this.generation)throw new Error('Send blocked: expired, paused, stopped, busy or invalidated');
    if(automatic&&(c.recognition!=='reference'||c.manual||c.autoEvidence?.eligible!==true))throw new Error('Only guarded authorized speech can Auto-send');
    if(this.recovery?.required)throw new Error('Connection preflight is required after wake');
    if(c.recognition==='quote'&&origin!=='desktop')throw new Error('Quoted passages require confirmation in the desktop app');
    if(c.reference.verse==null||c.reference.valid===false||c.reference.overLimit||c.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw new Error('Edit this incomplete, prohibited, out-of-bounds or over-limit reference before sending');
    if(c.reference.rangeLength>this.maxPassageVerses||c.reference.rangeLength===null&&c.reference.endChapter&&c.reference.endChapter!==c.reference.chapter)throw Error('The passage cannot be bounded within the configured verse limit');
    if(c.reference.rangeLength>10&&(origin!=='desktop'||this.mode!=='confirm'))throw Error('Extended ranges require desktop Confirm mode');
    const key=`${c.label}|${c.translation}`;
    const part=c.passagePart,map=this.connector.mappings?.get(key);
    const approvedAuto=automatic&&map?.autoApproval===true&&map.autoVerified===true&&this.capture?.active===true&&this.capture.ownerId===map.ownerId;
    if(!this.dryRun&&map?.passagePart&&!part&&!approvedAuto)throw Error('This passage requires its passage-level review confirmation; prepare it in the workspace');
    if(part&&(origin!=='desktop'||!c.manual||part.uuid!==map?.uuid||part.cue!==map?.cue||!map?.passagePart))throw Error('Invalid passage continuation identity');
    const partKey=part?part.uuid+'|'+part.cue:null;
    const continued=part?.continuation===true&&this.lastSend?.state==='readback-matched'&&this.lastSend?.partKey===part.uuid+'|'+part.previousCue;
    this.pruneCooldown(this.recentSends);
    const cooldownKey=this.referenceKey(c),priorSend=this.recentSends.get(cooldownKey),manualResend=origin==='desktop'&&c.manual===true&&['simulated','readback-matched'].includes(priorSend?.state);
    if(!priorSend&&this.recentSends.size>=200)throw Error('Duplicate cooldown tracking is full; wait or reset the session deliberately');
    if(this.duplicateSend(c)&&!continued&&!manualResend)throw new Error('Duplicate cooldown: wait or explicitly review a successful passage again');
    this.busy=true;const gen=this.generation,mode=this.mode,inputEpoch=this.inputEpoch,resetEpoch=this.resetEpoch;this.notify();
    try {
      const guard=()=>!this.stopped&&this.mode===mode&&gen===this.generation&&(!automatic||inputEpoch===this.inputEpoch)&&this.clock()<c.expiresAt&&additionalGuard();
      if(c.reference.relative&&!this.dryRun){
        try{if(!c.reference.remote||typeof this.connector.verifyContext!=='function')throw Error('Current passage context cannot be verified');await this.connector.verifyContext(c.reference.remote,guard);}catch(error){if(this.resetEpoch===resetEpoch){this.connector.arm?.(false);this.invalidate();this.mode='paused';}throw error;}
      }
      const result=await this.connector.send(c,{dryRun:this.dryRun,automatic,guard});
      if(this.resetEpoch!==resetEpoch){this.log('PREVIOUS_SESSION_RECEIPT_UNCERTAIN','warning');return {state:'uncertain',reason:'A previous-session command finished after reset. Inspect ProPresenter; no retry or clear was sent.'};}
      this.lastSend={key,at:this.clock(),partKey,state:result.state};this.rememberCooldown(this.recentSends,cooldownKey,{at:this.clock(),state:result.state});this.queue=this.queue.filter(x=>x.id!==id);
      this.history.unshift({...c,phrase:undefined,state:result.state,at:this.clock()});this.history=this.history.slice(0,20);
      // Simulation never establishes real remote passage context.
      this.context=result.state==='readback-matched'?{...c.reference,translation:c.translation,verified:true,verifiedAt:this.clock(),remote:result.presentation??null,partial:result.part?result.part.index+1<result.part.count:false}:null;
      if(result.state==='uncertain'){this.invalidate();this.mode='paused';this.autoCitationPolicy='explicit-command';}
      this.log(result.state.toUpperCase(),result.state==='uncertain'?'warning':'info');return result;
    }catch(error){if(this.resetEpoch!==resetEpoch){this.log('PREVIOUS_SESSION_COMMAND_ENDED','warning');throw Error('A previous-session operation ended after reset. Inspect ProPresenter if output was accepted; no retry or clear was sent.');}throw error;}finally{this.busy=false;this.notify();}
  }
}
module.exports={Session};
