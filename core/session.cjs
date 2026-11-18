'use strict';
const {EventEmitter}=require('node:events');
const {randomUUID}=require('node:crypto');
const {parse}=require('./parser.cjs');
const {QuoteMatcher}=require('./quote-matcher.cjs');
class Session extends EventEmitter {
  constructor(connector,{clock=()=>performance.timeOrigin+performance.now()}={}) {
    super();this.connector=connector;this.clock=clock;this.mode='confirm';this.stopped=false;this.dryRun=true;this.queue=[];this.history=[];this.events=[];this.generation=0;this.busy=false;this.translation='KJV';this.context=null;this.revisions=new Map();this.lastSend=null;
  }
  snapshot(){this.expire();return {interpretation:this.interpretation??null,inputEpoch:this.inputEpoch??0,preparation:this.passagePreparation??{phase:'idle'},recovery:this.recovery?{...this.recovery}:null,generation:this.generation,mode:this.mode,stopped:this.stopped,dryRun:this.dryRun,queue:structuredClone(this.queue),history:structuredClone(this.history),events:structuredClone(this.events),busy:this.busy,translation:this.translation,quoteMatching:this.quoteStatus(),capture:this.capture?{...this.capture}:{active:false,ownerId:null},autoStatus:this.autoStatus??null,capabilities:{auto:true,quoteAuto:false,arbitraryLookup:false,clear:false},connection:this.connector.status??{state:'offline'}};}
  notify(){this.emit('change',this.snapshot());}
  enableAuto({acknowledged=false}={}){if(acknowledged!==true)throw new Error('Explicit Auto acknowledgment is required');if(this.stopped||this.recovery?.required||this.busy)throw new Error('Resume Confirm and finish pending work before enabling Auto');if(!this.dryRun){const c=this.connector;if(!c.base||new URL(c.base).hostname!=='127.0.0.1'||!c.armed||c.status?.state!=='connected'||![...c.mappings.values()].some(map=>map.autoVerified===true))throw new Error('Auto test output requires an armed loopback target and a complete cue explicitly verified for Auto');}this.invalidate();this.mode='auto';this.autoStatus={state:'ready',reason:this.dryRun?'AUTO SIMULATION: no output requests':'AUTO TEST OUTPUT: verified complete cues only'};this.log('AUTO_EXPLICITLY_ENABLED','warning');this.notify();}
  quoteStatus(){return {enabled:this.quoteEnabled===true,...(this.quoteMatcher?.status()??{translation:null,passages:0})};}
  loadQuoteIndex(document,consent){const matcher=new QuoteMatcher(document,{rightsAcknowledged:consent===true});this.invalidate();this.quoteMatcher=matcher;this.quoteEnabled=false;this.log('QUOTE_INDEX_LOADED');this.notify();return this.quoteStatus();}
  enableQuotes(enabled){if(typeof enabled!=='boolean'||enabled&&(!this.quoteMatcher||this.quoteMatcher.translation!==this.translation))throw new Error('Import a rights-acknowledged index matching the selected translation first');this.invalidate();this.quoteEnabled=enabled;this.log(enabled?'QUOTE_MATCHING_ENABLED':'QUOTE_MATCHING_DISABLED');this.notify();return this.quoteStatus();}
  log(code,state='info',metrics=null){const safe={};for(const key of ['nativeWorkerMs','sttWorkerMs'])if(Number.isFinite(metrics?.[key])&&metrics[key]>=0&&metrics[key]<=120000)safe[key]=Math.round(metrics[key]);this.events.push({id:randomUUID(),at:this.clock(),code,state,...(Object.keys(safe).length?{metrics:safe}:{})});this.events=this.events.slice(-100);}
  invalidate(){this.interpretation=null;this.inputEpoch=(this.inputEpoch??0)+1;this.autoStatus=null;this.generation++;this.queue=[];this.context=null;}
  expire(){this.queue=this.queue.filter(c=>c.expiresAt>this.clock());}
  setMode(mode){if(!['confirm','suggest','paused'].includes(mode))throw new Error('Select a supported mode; enable Auto through its acknowledgment dialog');if(this.recovery?.required&&mode!=='paused')throw new Error('Recheck the connection after wake, then Resume in Confirm');this.invalidate();this.mode=mode;this.log('MODE_CHANGED');this.notify();}
  stop(){this.stopped=true;this.mode='paused';this.invalidate();this.log('EMERGENCY_STOP','warning');this.notify();}
  resume(){if(this.recovery?.required&&(this.recovery.phase!=='resume'||this.connector.status?.state!=='connected'||!this.connector.version))throw new Error('Test the ProPresenter connection after wake before resuming Confirm');this.recovery=null;this.stopped=false;this.mode='confirm';this.invalidate();this.log('REARMED_CONFIRM');this.notify();}
  configure({dryRun=true,translation='KJV'}={}){if(typeof dryRun!=='boolean'||!/^[- A-Z0-9]{2,30}$/.test(translation))throw new Error('Invalid session settings');this.invalidate();if(this.mode==='auto')this.mode='confirm';if(translation!==this.translation)this.quoteEnabled=false;this.dryRun=dryRun;this.translation=translation;this.log('CONFIG_CHANGED');this.notify();}
  async ingestChecked(text,options={}){
    const external=options.additionalGuard??(()=>true);
    if(!external())throw Error('Reference request was revoked');
    if(this.dryRun||options.authorized===false||this.stopped||(!options.manual&&this.mode==='paused'))return this.ingest(text,options);
    const context=this.context,proposed=parse(text,{context,now:this.clock(),defaultTranslation:this.translation});
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
    return this.ingest(text,options);
  }
  ingest(text,{id=randomUUID(),revision=1,final=true,manual=false,authorized=true}={}) {
    this.inputEpoch=(this.inputEpoch??0)+1;
    if(this.stopped||(!manual&&this.mode==='paused'))return [];
    if(typeof id!=='string'||id.length>100||!Number.isSafeInteger(revision)||revision<1)throw new Error('Invalid transcript identity');
    if((this.revisions.get(id)??0)>=revision)return [];
    this.revisions.set(id,revision);if(this.revisions.size>200)this.revisions.delete(this.revisions.keys().next().value);
    this.queue=this.queue.filter(c=>c.utteranceId!==id);
    if(!final){this.generation++;this.notify();return [];}
    const parsed=parse(text,{context:this.context,now:this.clock(),defaultTranslation:this.translation});
    this.interpretation={kind:parsed.command?.kind??(parsed.references.length?'reference':'none'),reason:parsed.issues[0]??null};
    if(authorized&&['hold','ignored-navigation'].includes(parsed.command?.kind)){this.queue=[];this.log(parsed.command.kind==='hold'?'HOLD_REQUESTED':'NAVIGATION_IGNORED');this.notify();return [];}
    let quote=null;
    if(!parsed.references.length&&!parsed.issues.length&&this.quoteEnabled&&authorized&&this.mode!=='paused'){
      quote=this.quoteMatcher?.match(text,this.translation);
      if(quote){parsed.references=parse(quote.reference,{defaultTranslation:this.translation}).references;parsed.issues.push('Quoted wording match; operator confirmation required. Translation is configured, not inferred from wording.');}
    }
    // A new explicit book/reference or a failed parse cannot preserve a prior
    // remote context for later relative references.
    if(parsed.references.some(r=>!r.relative)||parsed.issues.length)this.context=null;
    if(parsed.corrected)this.invalidate();
    const candidates=parsed.references.map(r=>({id:randomUUID(),utteranceId:id,revision,reference:r,label:r.label,translation:r.translation??this.translation,phrase:text.slice(0,1000),recognition:quote?'quote':'reference',...(quote?{quoteEvidence:quote}:{}),detectedAt:this.clock(),expiresAt:this.clock()+15000,generation:this.generation,manual,authorized,state:authorized?'review':'blocked',issues:[...parsed.issues,...r.issues,...(!authorized?['Audio source not authorized']:[])]}));
    this.queue.push(...candidates);this.queue=this.queue.slice(-5);this.notify();return candidates;
  }
  reject(id){this.queue=this.queue.filter(c=>c.id!==id);this.log('CANDIDATE_DISMISSED');this.notify();}
  navigate(id,direction){
    this.expire();const candidate=this.queue.find(item=>item.id===id);
    if(![-1,1].includes(direction)||!candidate||this.stopped||this.busy||!candidate.authorized||candidate.generation!==this.generation||candidate.reference.valid===false||candidate.reference.overLimit||candidate.reference.verse==null||candidate.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))throw new Error('Choose a valid unexpired candidate before navigating');
    if(candidate.translation!=='KJV')throw new Error('Verified numbering is unavailable for this translation; edit the reference explicitly');
    const proposal=parse(direction===1?'next verse':'previous verse',{context:{...candidate.reference,translation:candidate.translation,verified:true,verifiedAt:this.clock()},now:this.clock(),defaultTranslation:candidate.translation});
    const next=proposal.references[0];if(!next||next.valid!==true)throw Error(proposal.issues[0]??'Book boundary reached; choose the next book explicitly');
    this.queue=this.queue.filter(item=>item.id!==id);return this.ingest(next.label+' in '+candidate.translation,{manual:true});
  }
  reset(){this.quoteMatcher=null;this.quoteEnabled=false;this.invalidate();this.revisions.clear();this.history=[];this.stopped=false;this.mode=this.recovery?.required?'paused':'confirm';this.dryRun=true;this.lastSend=null;this.log('SESSION_RESET');this.notify();}
  async send(id,{additionalGuard=()=>true,origin='desktop',operationOwner=null}={}){
    if(this.operationOwner&&this.operationOwner!==operationOwner)throw Error('Another passage operation is in progress');
    this.expire();const c=this.queue.find(c=>c.id===id);
    const automatic=origin==='auto',allowedMode=this.mode==='confirm'&&!automatic||this.mode==='auto'&&(automatic||origin==='desktop');
    if(!c||this.stopped||!allowedMode||this.busy||!c.authorized||c.generation!==this.generation)throw new Error('Send blocked: expired, paused, stopped, busy or invalidated');
    if(automatic&&(c.recognition!=='reference'||c.manual||c.autoEvidence?.eligible!==true))throw new Error('Only guarded authorized speech can Auto-send');
    if(this.recovery?.required)throw new Error('Connection preflight is required after wake');
    if(c.recognition==='quote'&&origin!=='desktop')throw new Error('Quoted passages require confirmation in the desktop app');
    if(c.reference.verse==null||c.reference.valid===false||c.reference.overLimit||c.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw new Error('Edit this incomplete, prohibited, out-of-bounds or over-limit reference before sending');
    const key=`${c.label}|${c.translation}`;
    const part=c.passagePart,map=this.connector.mappings?.get(key);
    if(part&&(origin!=='desktop'||!c.manual||part.uuid!==map?.uuid||part.cue!==map?.cue||!map?.passagePart))throw Error('Invalid passage continuation identity');
    const partKey=part?part.uuid+'|'+part.cue:null;
    const continued=part?.continuation===true&&this.lastSend?.state==='readback-matched'&&this.lastSend?.partKey===part.uuid+'|'+part.previousCue;
    if(this.lastSend?.key===key&&this.clock()-this.lastSend.at<10000&&!continued)throw new Error('Duplicate cooldown: wait before intentionally repeating');
    this.busy=true;const gen=this.generation,mode=this.mode,inputEpoch=this.inputEpoch;this.notify();
    try {
      const guard=()=>!this.stopped&&this.mode===mode&&gen===this.generation&&(!automatic||inputEpoch===this.inputEpoch)&&this.clock()<c.expiresAt&&additionalGuard();
      if(c.reference.relative&&!this.dryRun){
        try{if(!c.reference.remote||typeof this.connector.verifyContext!=='function')throw Error('Current passage context cannot be verified');await this.connector.verifyContext(c.reference.remote,guard);}catch(error){this.connector.arm?.(false);this.invalidate();this.mode='paused';throw error;}
      }
      const result=await this.connector.send(c,{dryRun:this.dryRun,automatic,guard});
      this.lastSend={key,at:this.clock(),partKey,state:result.state};this.queue=this.queue.filter(x=>x.id!==id);
      this.history.unshift({...c,phrase:undefined,state:result.state,at:this.clock()});this.history=this.history.slice(0,20);
      // Simulation never establishes real remote passage context.
      this.context=result.state==='readback-matched'?{...c.reference,translation:c.translation,verified:true,verifiedAt:this.clock(),remote:result.presentation??null,partial:result.part?result.part.index+1<result.part.count:false}:null;
      if(result.state==='uncertain'){this.invalidate();this.mode='paused';}
      this.log(result.state.toUpperCase(),result.state==='uncertain'?'warning':'info');return result;
    }finally{this.busy=false;this.notify();}
  }
}
module.exports={Session};
