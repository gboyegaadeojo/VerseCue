'use strict';
const {nativeFailureDiagnostics}=require('./bible-preparation.cjs');
const {randomUUID}=require('node:crypto');
const {planSavedPassage,metadataReference}=require('./bible-passage-plan.cjs');
// Reference preparation and explicit desktop confirmation. Output uses the
// existing Session/Connector guards; no generic Next, Clear or blind retry.
class PassageCoordinator {
 constructor({service,connector,resolver,savedBible,onChange=()=>{}}){Object.assign(this,{service,connector,resolver,savedBible,onChange});this.epoch=0;this.busy=false;this.state={phase:'idle'};}
 publish(state){this.state=state;this.onChange({...state});return state;}
 acquire(){if(this.busy||this.service.busy||this.service.operationOwner)throw Error('Another passage operation is in progress');this.busy=true;this.service.operationOwner=this;}
 release(){if(this.service.operationOwner===this)this.service.operationOwner=null;this.busy=false;}
 cancel(){this.epoch++;this.review=null;this.active=null;this.savedBible.cancel();this.publish({phase:'canceled',outputRequests:0});}
 async checkOwnership(){
  const s=this.service,c=this.connector,context=s.context,epoch=this.epoch,generation=s.generation,target=c.generation,base=c.base;
  const valid=()=>s.context===context&&this.epoch===epoch&&s.generation===generation&&c.generation===target&&c.base===base&&!this.busy&&!s.busy&&!s.operationOwner&&!s.stopped&&!s.recovery?.required&&!s.dryRun&&s.mode!=='paused'&&c.status?.state==='connected';
  if(!context?.verified||!context.remote||typeof c.verifyContext!=='function'||!valid())return false;
  try{await c.verifyContext(context.remote,valid);return false;}
  catch{if(!valid())return false;this.cancel();c.arm(false);s.setMode('paused');s.log('PASSAGE_OWNERSHIP_LOST','warning');this.publish({phase:'blocked',reason:'ProPresenter output or passage content changed, or ownership could not be verified. Resume Confirm and review the current reference again.',outputRequests:0,outputObserved:false});return true;}
 }
 async verifySource(source,guard){if(source.reference.relative){if(!source.reference.remote||typeof this.connector.verifyContext!=='function')throw Error('Relative passage context cannot be verified');if(this.service.clock()-source.reference.verifiedAt>120000)throw Error('Relative passage context expired');await this.connector.verifyContext(source.reference.remote,guard);}}
 async thumbnail(reviewToken,partIndex){
  const r=this.review,s=this.service,c=this.connector;
  const valid=()=>this.review===r&&r?.token===reviewToken&&r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&r.generation===s.generation&&r.referenceEpoch===s.referenceEpoch&&!this.busy&&!s.stopped&&!s.recovery?.required&&s.clock()<r.expiresAt;
  if(this.thumbnailBusy||!r||!Number.isInteger(partIndex)||partIndex<0||partIndex>=r.plan.cueIndices.length||!valid())throw Error('Choose a current reviewed passage part before loading its preview');
  this.thumbnailBusy=true;
  const check=async()=>{if(!valid())throw Error('Slide preview expired or changed');const inspected=await c.inspect(r.plan.uuid);if(!valid())throw Error('Slide preview expired or changed');const plan=planSavedPassage(inspected,{uuid:r.plan.uuid,reference:r.plan.reference,translation:r.plan.translation,maxVerses:r.plan.maxVerses??10});if(plan.fingerprint!==r.plan.fingerprint){this.review=null;c.arm(false);s.context=null;this.publish({phase:'blocked',reason:'Saved passage changed. Prepare it again before review or output.',outputRequests:0});throw Error('Saved passage changed; prepare again');}};
  try{await check();const image=await c.thumbnail(r.plan.uuid,r.plan.cueIndices[partIndex],valid);await check();return {...image,reviewToken,partIndex,source:'ProPresenter saved-slide thumbnail',physicalOutputObserved:false,formattingVerified:false,outputRequests:0};}finally{this.thumbnailBusy=false;}
 }
 candidate(id){this.service.expire();const c=this.service.queue.find(row=>row.id===id);if(!c||this.service.stopped||this.service.recovery?.required||!c.authorized||c.generation!==this.service.generation||c.reference.valid!==true||c.reference.verse==null||c.reference.overLimit||c.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))throw Error('Review a valid current passage first');return c;}
 async prepare(id,{acknowledgeFocusChange=false,acknowledgeCreateCopy=false,selectedUuid=null,expectedFingerprint=null,additionalGuard=()=>true,forceNative=false}={}){
  if(typeof additionalGuard!=='function'||!additionalGuard())throw Error('Passage review request was revoked');
  let selected=null;if(selectedUuid!==null){if(typeof selectedUuid!=='string'||typeof expectedFingerprint!=='string'||this.state.phase!=='ambiguous'||this.state.sourceCandidateId!==id)throw Error('Choose a current ambiguous passage copy');selected=this.state.matches?.find(row=>row.uuid===selectedUuid&&row.fingerprint===expectedFingerprint);if(!selected)throw Error('Selected passage copy is no longer available');}
  if(this.busy)throw Error('A passage preparation is already in progress');const c=this.candidate(id),sourceMode=this.service.mode,sourceReferenceEpoch=this.service.referenceEpoch,epoch=++this.epoch,target=this.connector.generation,base=this.connector.base;this.review=null;this.active=null;this.acquire();
  const guard=()=>additionalGuard()&&epoch===this.epoch&&target===this.connector.generation&&base===this.connector.base&&sourceReferenceEpoch===this.service.referenceEpoch&&!this.service.stopped&&!this.service.recovery?.required;
  const check=()=>{if(!guard())throw Error('Passage preparation canceled or target changed');};
  try{
   this.publish({phase:'resolving',reference:c.label,translation:c.translation,outputRequests:0});
   await this.verifySource(c,guard);check();
   let result=forceNative?{state:'needs-preparation'}:await this.resolver.findCandidate(this.service,id);check();
   if(result.state==='ambiguous-passages'){
    if(!selected)return this.publish({phase:'ambiguous',...result,sourceCandidateId:id});
    const matches=result.matches.filter(row=>row.uuid===selected.uuid&&row.fingerprint===selected.fingerprint);if(matches.length!==1)throw Error('Selected passage copy changed; find the passage again');result=matches[0];
   }else if(selected&&(result.state!=='passage-needs-review'||result.uuid!==selected.uuid||result.fingerprint!==selected.fingerprint))throw Error('Selected passage copy changed; find the passage again');
   if(result.state==='needs-preparation'){
    const readiness=this.savedBible.readiness();if(readiness.available!==true)return this.publish({phase:'manual-preparation-required',reference:c.label,translation:c.translation,reason:readiness.reason,outputRequests:0});
    if(acknowledgeFocusChange!==true||acknowledgeCreateCopy!==true)return this.publish({phase:'consent-required',reference:c.label,translation:c.translation,reason:'Preparation may move ProPresenter focus and create an internal Bible copy. Explicit session consent is required.',outputRequests:0});
    this.release();const versionOk=await this.versionInstalled(c);this.acquire();if(!versionOk)return this.state;
    this.candidate(id);check();this.publish({phase:'preparing',reference:c.label,translation:c.translation,outputRequests:0});
    const saved=await this.savedBible.prepare(c.label,c.translation,null,guard,{keepListening:true});check();
    if(saved.coverageComplete!==true||!Number.isInteger(saved.preparedGeneration)||this.service.generation!==saved.preparedGeneration||typeof saved.fingerprint!=='string'||!/^[a-f0-9]{64}$/.test(saved.fingerprint))throw Error('Complete passage preparation could not be verified');
    const preparedGeneration=saved.preparedGeneration;
    result=await this.resolver.find(c.label,c.translation,{guard:()=>guard()&&this.service.generation===preparedGeneration});check();
    if(result.state==='ambiguous-passages'){const fresh=result.matches.filter(row=>row.uuid===saved.uuid&&row.fingerprint===saved.fingerprint);if(fresh.length!==1)throw Error('Fresh saved copy changed or could not be identified');result=fresh[0];}
    if(this.service.generation!==preparedGeneration||result.state!=='passage-needs-review'||result.uuid!==saved.uuid||result.fingerprint!==saved.fingerprint)throw Error('Prepared copy is ambiguous or changed; inspect ProPresenter');
    result={...result,bibleOrigin:'native-save-this-operation',clippingWarning:saved.clippingWarning===true,nativeWorkerMs:saved.workerElapsedMs,nativeStageStartedAtMs:saved.nativeStageStartedAtMs??{},requiresFreshReview:true};
   }
   if(result.state!=='passage-needs-review'||result.reference!==c.label||result.translation!==c.translation)throw Error('No exact passage is ready for review');
   const reviewToken=randomUUID();this.review={token:reviewToken,sourceMode,plan:structuredClone(result),source:structuredClone(c),epoch,target,base,generation:this.service.generation,inputEpoch:this.service.inputEpoch,referenceEpoch:this.service.referenceEpoch,expiresAt:this.service.clock()+120000};
   return this.publish({...result,phase:'review-required',reviewToken,reviewExpiresAt:this.review.expiresAt,reviewGeneration:this.review.generation,reviewSourceMode:sourceMode,reviewInputEpoch:this.review.inputEpoch,reviewReferenceEpoch:this.review.referenceEpoch,sourceCandidateId:id,bibleTextVerified:false,formattingVerified:false,outputObserved:false,outputRequests:0});
  }catch(error){const diagnostics=nativeFailureDiagnostics(error);this.publish({phase:guard()?'blocked':'canceled',reference:c.label,translation:c.translation,reason:error.message,...(diagnostics?{nativeFailure:diagnostics}:{}),outputRequests:0});throw error;}finally{this.release();}
 }
 // Prepare for volunteer: open the whole chapter in ProPresenter's Bible view, scrolled to the spoken verse,
 // so the volunteer can go back or forward without searching again. No saved copy and no output.
 // Before opening a passage in a version other than the default, check ProPresenter has that version (NR-018).
 // Not installed: keep the current version, say so plainly and prepare nothing.
 async versionInstalled(c){
  if(c.recognition!=='version-switch'&&(!this.service.translation||c.translation===this.service.translation))return true;
  const {versionName}=require('./bible-versions.cjs');let installed=null;
  try{installed=await this.savedBible.controller.installedVersions?.(()=>!this.service.stopped);}catch(error){installed=null;this.service.log?.('INSTALLED_VERSIONS_UNREADABLE','warning',{reason:String(error?.message??error).slice(0,160)});}
  if(!installed)return true;
  if(installed.codes.includes(c.translation))return true;
  const from=c.versionSwitch?.from??this.service.translation,text=c.translation+" isn't installed in ProPresenter, so VerseCue is keeping "+from+'. Installed: '+(installed.codes.length?installed.codes.join(', '):installed.names.join(', '))+'.';
  this.service.queue=this.service.queue.filter(row=>row.id!==c.id);this.service.versionNotice={id:Date.now(),text};this.service.log?.('VERSION_NOT_INSTALLED','info');
  this.publish({phase:'version-not-installed',reference:c.label,translation:c.translation,reason:text,outputRequests:0});return false;
 }
 async prepareChapter(id,{acknowledgeFocusChange=false,additionalGuard=()=>true}={}){
  if(typeof additionalGuard!=='function'||!additionalGuard())throw Error('Passage review request was revoked');
  if(this.busy)throw Error('A passage preparation is already in progress');
  this.service.expire();const c=this.service.queue.find(row=>row.id===id);
  if(!c||this.service.stopped||this.service.recovery?.required||!c.authorized||c.generation!==this.service.generation||c.reference.valid!==true||c.reference.relative||!c.reference.book||!Number.isInteger(c.reference.chapter)||c.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))throw Error('Review a valid current reference first');
  const chapter=`${c.reference.book} ${c.reference.chapter}`,focusVerse=c.reference.verse??1,sourceReferenceEpoch=this.service.referenceEpoch,epoch=++this.epoch,target=this.connector.generation,base=this.connector.base;this.review=null;this.active=null;
  const readiness=this.savedBible.readiness();if(readiness.available!==true)return this.publish({phase:'manual-preparation-required',reference:c.label,translation:c.translation,reason:readiness.reason,outputRequests:0});
  if(acknowledgeFocusChange!==true)return this.publish({phase:'consent-required',reference:c.label,translation:c.translation,reason:'Preparation may move ProPresenter focus. Explicit session consent is required.',outputRequests:0});
  if(!await this.versionInstalled(c))return this.state;
  this.acquire();
  const guard=()=>additionalGuard()&&epoch===this.epoch&&target===this.connector.generation&&base===this.connector.base&&sourceReferenceEpoch===this.service.referenceEpoch&&!this.service.stopped&&!this.service.recovery?.required;
  try{
   this.publish({phase:'preparing',reference:c.label,chapter,focusVerse,translation:c.translation,outputRequests:0});
   const result=await this.savedBible.controller.prepare(chapter,c.translation,guard,{keepListening:true,focusVerse});
   if(!guard())throw Error('Passage preparation canceled or target changed');
   return this.publish({phase:'chapter-prepared',reference:c.label,chapter,focusVerse,focusVisible:result.focusVisible===true,chapterVerses:result.chapterVerses,translation:c.translation,recognition:c.recognition,nativeWorkerMs:result.workerElapsedMs,outputRequests:0,outputObserved:false});
  }catch(error){const diagnostics=nativeFailureDiagnostics(error);this.publish({phase:guard()?'blocked':'canceled',reference:c.label,translation:c.translation,reason:error.message,...(diagnostics?{nativeFailure:diagnostics}:{}),outputRequests:0});throw error;}finally{this.release();}
 }
 async rebuildClipped(reviewToken,{formattingCorrected=false,acknowledgeFocusChange=false,acknowledgeCreateCopy=false}={}){
  const r=this.review,s=this.service,c=this.connector;
  if(this.busy||s.busy||s.operationOwner||!r||r.token!==reviewToken||r.plan.clippingWarning!==true||r.epoch!==this.epoch||r.target!==c.generation||r.base!==c.base||r.generation!==s.generation||r.referenceEpoch!==s.referenceEpoch||s.stopped||s.recovery?.required||s.mode!=='confirm'||s.clock()>=r.expiresAt)throw Error('Review the current clipped passage in Confirm before rebuilding');
  if(formattingCorrected!==true||acknowledgeFocusChange!==true||acknowledgeCreateCopy!==true)throw Error('Confirm the Bible formatting correction and one fresh copy/focus change first');
  const readiness=this.savedBible.readiness();if(readiness.available!==true)throw Error(readiness.reason??'Native preparation is unavailable');
  const [candidate]=s.ingest(`${r.plan.reference} in ${r.plan.translation}`,{manual:true});if(!candidate)throw Error('Fresh passage intent could not be created');candidate.recognition=r.source.recognition??'reference';
  return this.prepare(candidate.id,{forceNative:true,acknowledgeFocusChange:true,acknowledgeCreateCopy:true});
 }
 async approveAuto(reviewToken,{verified=false,acknowledgeTestOutput=false,acknowledgeAuto=false,ownerId=null}={}){
  const r=this.review,s=this.service,c=this.connector;
  if((r?.plan.coveredVerses?.length??0)>10&&s.mode!=='confirm')throw Error('Extended ranges require desktop Confirm mode');
  if(this.busy||!r||r.token!==reviewToken||verified!==true||acknowledgeTestOutput!==true||acknowledgeAuto!==true||!Number.isSafeInteger(ownerId)||ownerId<1)throw Error('Review the passage and acknowledge appearance, test target and Auto approval first');
  if(!c.base||new URL(c.base).hostname!=='127.0.0.1'||c.status?.state!=='connected')throw Error('Auto test approval requires a connected ProPresenter on this computer through loopback');
  if(s.mode!=='confirm'||r.sourceMode!=='confirm'||r.source.recognition==='quote'||r.source.reference.relative||!r.plan.singleCue||(r.plan.coveredVerses?.length??Infinity)>10||!r.plan.numberingVerified||r.plan.translation!=='KJV'||r.plan.clippingWarning===true)throw Error('Auto approval needs an unclipped complete single-cue KJV reference reviewed in Confirm');
  if(s.capture?.active&&s.capture.ownerId!==ownerId)throw Error('Approve Auto from the window that owns the authorized input');
  const valid=()=>this.review===r&&r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&r.generation===s.generation&&r.referenceEpoch===s.referenceEpoch&&!s.stopped&&!s.recovery?.required&&s.clock()<r.expiresAt;
  if(!valid())throw Error('Prepared review expired or changed; prepare the passage again');
  this.acquire();let approvalId=null;this.publish({phase:'approving-auto',reference:r.plan.reference,translation:r.plan.translation,outputRequests:0});
  try{const approval=await c.prepareAutoPassage({uuid:r.plan.uuid,reference:r.plan.reference,translation:r.plan.translation,expectedFingerprint:r.plan.fingerprint,ownerId,guard:valid});approvalId=approval.approvalId;if(!valid())throw Error('Auto passage approval canceled');
   c.arm(true);s.configure({dryRun:false,translation:s.translation});this.review=null;this.active=null;s.log('PASSAGE_AUTO_APPROVED','warning');
   return this.publish({phase:'auto-approved',reference:r.plan.reference,translation:r.plan.translation,ownerId,outputRequests:0,outputObserved:false,bibleTextVerified:false,formattingVerified:false});
  }catch(error){const key=`${r.plan.reference}|${r.plan.translation}`;if(approvalId&&r.target===c.generation&&r.base===c.base&&c.mappings.get(key)?.approvalId===approvalId)c.mappings.delete(key);if(r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&r.generation===s.generation&&r.referenceEpoch===s.referenceEpoch){c.arm(false);s.setMode('paused');this.review=null;this.publish({phase:'blocked',reason:error.message,outputRequests:0});}else if(r.epoch===this.epoch&&this.review===r){this.review=null;this.publish({phase:'canceled',reason:error.message,outputRequests:0});}throw error;}finally{this.release();}
 }
 abandonSupersededPreflight(record,slot){
  const s=this.service,c=this.connector;
  if(s.stopped||s.recovery?.required||record.epoch===this.epoch&&record.target===c.generation&&record.base===c.base&&record.generation===s.generation&&record.referenceEpoch===s.referenceEpoch)return false;
  if(this[slot]===record){this[slot]=null;if(this.epoch===record.epoch)this.publish({phase:'canceled',reference:record.plan.reference,translation:record.plan.translation,reason:'A newer reference or session change canceled this request.',outputRequests:0,outputObserved:false});}
  return true;

 }
 async confirm(reviewToken,{verified=false,acknowledgeTestOutput=false}={}){
  const r=this.review,s=this.service,c=this.connector;
  if(s.mode==='suggest'||r?.sourceMode==='suggest'&&s.mode!=='confirm')throw Error('Switch from Suggest only to Confirm before showing a passage');
  if(this.busy||!r||r.token!==reviewToken||verified!==true||acknowledgeTestOutput!==true)throw Error('Review the prepared passage and acknowledge the authorized test output first');
  if(r.plan.clippingWarning===true)throw Error('ProPresenter reported clipped text. Correct the formatting and prepare a fresh reviewed copy before output.');
  const valid=()=>this.review===r&&r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&r.generation===s.generation&&r.referenceEpoch===s.referenceEpoch&&!s.stopped&&!s.recovery?.required&&s.clock()<r.expiresAt;
  if(!valid())throw Error('Prepared review expired or changed; prepare the passage again');
  this.acquire();let outputPhaseStarted=false;
  this.publish({phase:'confirming',reference:r.plan.reference,translation:r.plan.translation});
  try{
   await this.verifySource(r.source,valid);
   await c.preparePassage({uuid:r.plan.uuid,reference:r.plan.reference,translation:r.plan.translation,maxVerses:r.plan.maxVerses??10,expectedFingerprint:r.plan.fingerprint,verified:true,sourceContext:r.source.reference.relative?r.source.reference.remote:null,guard:valid});
   if(!valid())throw Error('Passage confirmation canceled');
   // This explicit desktop confirmation authorizes one verified test passage.
   // Apply safe session transitions before creating its fresh manual candidate.
   outputPhaseStarted=true;c.arm(true);s.configure({dryRun:false,translation:s.translation});s.resume();
   const generation=s.generation;
   const [candidate]=s.ingest(`${r.plan.reference} in ${r.plan.translation}`,{manual:true});
   if(!candidate)throw Error('Confirmed passage could not be created');
   candidate.recognition=r.source.recognition??'reference';
   candidate.passagePart={uuid:r.plan.uuid,cue:r.plan.cueIndices[0],continuation:false};
   const sendEpoch=s.referenceEpoch;
   const guard=()=>this.review===r&&r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&!s.stopped&&!s.recovery?.required&&s.generation===generation&&s.referenceEpoch===sendEpoch;
   const receipt=await s.send(candidate.id,{origin:'desktop',additionalGuard:guard,operationOwner:this});
   this.review=null;return this.finishPart(r.plan,r.source,0,receipt);
  }catch(error){if(!outputPhaseStarted&&this.abandonSupersededPreflight(r,'review'))throw error;c.arm(false);s.setMode('paused');this.review=null;this.active=null;this.publish({phase:'blocked',reason:error.message,outputObserved:false});throw error;}finally{this.release();}
 }
 finishPart(plan,source,partIndex,receipt){
  if(receipt.state!=='readback-matched'){this.active=null;return this.publish({phase:'uncertain',reference:plan.reference,translation:plan.translation,...receipt});}
  const partCount=plan.cueIndices.length,token=randomUUID();
  const context=this.service.context;
  if(context?.verified&&context.remote?.uuid===plan.uuid&&context.remote.index===plan.cueIndices[partIndex]&&context.remote.fingerprint===plan.fingerprint){
   const current=metadataReference(plan.cues?.[partIndex]?.label,plan.translation,{maxVerses:plan.maxVerses??10});
   if(!current)this.service.context=null;
   else{const compare=(a,b)=>a[0]-b[0]||a[1]-b[1],start=[current.chapter,current.verse],end=[current.endChapter??current.chapter,current.endVerse??current.verse],multi=compare(start,end)!==0;
    const overlap=multi&&plan.cues.slice(partIndex+1).some(cue=>{const next=metadataReference(cue.label,plan.translation,{maxVerses:plan.maxVerses??10});if(!next)return true;if(next.book!==current.book)return false;return compare([next.chapter,next.verse],end)<=0&&compare([next.endChapter??next.chapter,next.endVerse??next.verse],start)>=0;});
    // Keep whole-passage context for explicit repeats, but bind relative verse
    // navigation to this exact readback cue without renewing ownership or age.
    this.service.context={...context,displayedReference:current,displayedRangeAmbiguous:overlap};
   }
  }
  this.active={token,plan:structuredClone(plan),source:structuredClone(source),partIndex,epoch:this.epoch,target:this.connector.generation,base:this.connector.base,generation:this.service.generation,referenceEpoch:this.service.referenceEpoch,expiresAt:this.service.clock()+120000};
  return this.publish({phase:partIndex+1<partCount?'part-shown':'readback-matched',reference:plan.reference,translation:plan.translation,activeToken:token,partIndex,partCount,...receipt});
 }
 async advance(activeToken){
  const a=this.active,s=this.service,c=this.connector;
  if(this.busy||!a||a.token!==activeToken||a.partIndex+1>=a.plan.cueIndices.length)throw Error('No remaining verified passage part');
  const referenceEpoch=s.referenceEpoch;
  const valid=()=>this.active===a&&a.epoch===this.epoch&&a.target===c.generation&&a.base===c.base&&a.generation===s.generation&&a.referenceEpoch===s.referenceEpoch&&s.referenceEpoch===referenceEpoch&&!s.stopped&&!s.recovery?.required&&s.mode==='confirm'&&c.armed&&c.status?.state==='connected'&&s.clock()<a.expiresAt;
  if(!valid()){if(this.abandonSupersededPreflight(a,'active'))throw Error('Passage continuation canceled or changed');c.arm(false);this.active=null;const reason='Current passage ownership expired or changed; prepare again';this.publish({phase:'blocked',reference:a.plan.reference,translation:a.plan.translation,reason,outputRequests:0,outputObserved:false});throw Error(reason);}
  this.acquire();let outputPhaseStarted=false;
  try{
   const partIndex=a.partIndex+1,previousCue=a.plan.cueIndices[a.partIndex];
   this.publish({phase:'continuing',reference:a.plan.reference,translation:a.plan.translation,partIndex,partCount:a.plan.cueIndices.length});
   await c.preparePassage({uuid:a.plan.uuid,reference:a.plan.reference,translation:a.plan.translation,maxVerses:a.plan.maxVerses??10,expectedFingerprint:a.plan.fingerprint,verified:true,partIndex,expectedCurrent:{uuid:a.plan.uuid,index:previousCue},guard:valid});
   if(!valid())throw Error('Passage continuation canceled');
   outputPhaseStarted=true;
   const [candidate]=s.ingest(a.plan.reference+' in '+a.plan.translation,{manual:true});
   if(!candidate)throw Error('Passage continuation could not be created');
   candidate.recognition=a.source.recognition??'reference';candidate.passagePart={uuid:a.plan.uuid,cue:a.plan.cueIndices[partIndex],previousCue,continuation:true};
   const sendEpoch=s.inputEpoch;
   const guard=()=>this.active===a&&a.epoch===this.epoch&&a.target===c.generation&&a.base===c.base&&a.generation===s.generation&&s.inputEpoch===sendEpoch&&!s.stopped&&!s.recovery?.required;
   const receipt=await s.send(candidate.id,{origin:'desktop',additionalGuard:guard,operationOwner:this});
   return this.finishPart(a.plan,a.source,partIndex,receipt);
  }catch(error){if(!outputPhaseStarted&&this.abandonSupersededPreflight(a,'active'))throw error;c.arm(false);s.setMode('paused');this.active=null;this.publish({phase:'blocked',reference:a.plan.reference,translation:a.plan.translation,reason:error.message,outputObserved:false});throw error;}finally{this.release();}
 }
}
module.exports={PassageCoordinator};
