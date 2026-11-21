'use strict';
// Session-only, preparation-only scheduling. This never arms or sends output.
class ReferencePreparation {
 constructor({service,coordinator,prepare,canPrepare=()=>true,nativeReadiness=()=>({available:false,reason:'Native preparation is unavailable'}),onChange=()=>{}}){Object.assign(this,{service,coordinator,prepare,canPrepare,nativeReadiness,onChange});this.enabled=false;this.nativeConsent=false;this.needsInspection=false;this.reason=null;this.pending=null;this.running=false;this.preparing=false;this.waiting=false;this.epoch=0;}
 status(){return {enabled:this.enabled,running:this.running,waiting:this.waiting,scope:this.nativeConsent?'native-with-session-consent':'saved-passages-only',nativeConsent:this.nativeConsent,nativeOwnerId:this.nativeConsent?this.nativeOwnerId:null,needsInspection:this.needsInspection,reason:this.reason,nativeReadiness:this.nativeReadiness()};}
 revokeNative(){this.nativeConsent=false;this.nativeBinding=null;this.nativeOwnerId=null;this.needsInspection=true;this.reason='Native preparation did not finish verification. Inspect ProPresenter before enabling missing-passage preparation again.';this.service.log('NATIVE_PREPARATION_INSPECTION_REQUIRED','warning');this.onChange(this.status());}
 owns(ownerId){return this.nativeConsent&&this.nativeOwnerId===ownerId;}
 configure(value,ownerId=null){
  const options=typeof value==='boolean'?{enabled:value}:value;
  if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(key=>!['enabled','nativePreparation','acknowledgeFocusChange','acknowledgeCreateCopy','acknowledgeInspection'].includes(key))||typeof options.enabled!=='boolean')throw Error('Choose whether to prepare detected references');
  const native=options.nativePreparation===true;
  if(options.nativePreparation!==undefined&&typeof options.nativePreparation!=='boolean')throw Error('Invalid native preparation choice');
  if(native&&(!options.enabled||!Number.isSafeInteger(ownerId)||ownerId<1||options.acknowledgeFocusChange!==true||options.acknowledgeCreateCopy!==true||this.service.stopped||this.service.recovery?.required||this.service.mode!=='confirm'||this.service.connector.status?.state!=='connected'||!this.nativeReadiness().available))throw Error('Native preparation needs Confirm, an owning window, a verified route and explicit focus/copy consent for this session');
  if(native&&this.needsInspection&&options.acknowledgeInspection!==true)throw Error('Acknowledge inspection of ProPresenter after the uncertain attempt before enabling native preparation again');
  this.cancel();this.service.resetDetectionCooldown?.();this.enabled=options.enabled;this.nativeConsent=native;
  this.nativeBinding=native?{base:this.service.connector.base,generation:this.service.connector.generation}:null;
  this.nativeOwnerId=native?ownerId:null;
  if(native){this.needsInspection=false;this.reason=null;}
  this.onChange(this.status());return this.status();
 }
 cancel(){this.epoch++;this.pending=null;if(this.preparing)this.coordinator.cancel();}
 consider(candidates,owner){
  if(!this.enabled||this.service.stopped||this.service.recovery?.required||this.service.mode!=='confirm'||this.service.connector.status?.state!=='connected'){this.cancel();return;}
  if(this.nativeConsent&&(this.nativeBinding.base!==this.service.connector.base||this.nativeBinding.generation!==this.service.connector.generation)){this.configure(false);return;}
  // Non-reference preaching must not interrupt a consented native preparation.
  if(candidates.length===0&&this.running&&(this.pending?.referenceEpoch??this.activeReferenceEpoch)===this.service.referenceEpoch)return;
  this.cancel();
  // A sentence with multiple destinations needs an operator choice.
  if(candidates.length!==1)return;
  const candidate=candidates[0];
  // Prepare for volunteer opens the whole chapter, so a chapter-only or long reference is still useful there.
  const chapterMode=this.service.prepareForVolunteer===true&&this.service.chapterContext!==false;
  if(!candidate.authorized||candidate.reference.valid!==true||candidate.reference.relative||(!chapterMode&&(candidate.reference.verse==null||candidate.reference.overLimit))||candidate.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))return;
  this.pending={chapter:chapterMode,id:candidate.id,owner,epoch:this.epoch,referenceEpoch:this.service.referenceEpoch,queuedAt:performance.now()};
  void this.drain();
 }
 async drain(){
  if(this.running)return;this.running=true;this.onChange(this.status());
  try{while(this.pending){const work=this.pending;if(!this.enabled||work.epoch!==this.epoch||work.referenceEpoch!==this.service.referenceEpoch||this.service.stopped||this.service.recovery?.required||this.service.mode!=='confirm'||this.service.connector.status?.state!=='connected'){this.pending=null;continue;}
    if(this.nativeConsent&&(this.nativeBinding.base!==this.service.connector.base||this.nativeBinding.generation!==this.service.connector.generation)){this.configure(false);continue;}
    if(!this.canPrepare()){if(performance.now()-work.queuedAt>=2000){this.pending=null;this.reason='Another preparation is still busy. Review the latest reference before preparing again.';this.service.log('REFERENCE_PREPARATION_OWNER_BUSY','warning');continue;}if(!this.waiting){this.waiting=true;this.onChange(this.status());}await new Promise(resolve=>setTimeout(resolve,25));continue;}
    this.pending=null;this.waiting=false;if(!this.needsInspection)this.reason=null;this.onChange(this.status());
    this.activeReferenceEpoch=work.referenceEpoch;
    const ownerId=Number.isSafeInteger(work.owner)?work.owner:work.owner?.sender?.id;
    this.preparing=true;try{await this.prepare(work.id,work.owner,{...(this.owns(ownerId)?{acknowledgeFocusChange:true,acknowledgeCreateCopy:true}:{}),...(work.chapter?{chapter:true}:{})});}catch(error){if(work.epoch===this.epoch){this.service.log('REFERENCE_PREPARATION_BLOCKED','warning');}}finally{this.preparing=false;}
   }}finally{this.waiting=false;this.running=false;this.onChange(this.status());}
 }
}
module.exports={ReferencePreparation};
