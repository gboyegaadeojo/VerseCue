'use strict';
// Session-only, preparation-only scheduling. This never arms or sends output.
class ReferencePreparation {
 constructor({service,coordinator,prepare,nativeReadiness=()=>({available:false,reason:'Native preparation is unavailable'}),onChange=()=>{}}){Object.assign(this,{service,coordinator,prepare,nativeReadiness,onChange});this.enabled=false;this.nativeConsent=false;this.pending=null;this.running=false;this.epoch=0;}
 status(){return {enabled:this.enabled,running:this.running,scope:this.nativeConsent?'native-with-session-consent':'saved-passages-only',nativeConsent:this.nativeConsent,nativeReadiness:this.nativeReadiness()};}
 owns(ownerId){return this.nativeConsent&&this.nativeOwnerId===ownerId;}
 configure(value,ownerId=null){
  const options=typeof value==='boolean'?{enabled:value}:value;
  if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(key=>!['enabled','nativePreparation','acknowledgeFocusChange','acknowledgeCreateCopy'].includes(key))||typeof options.enabled!=='boolean')throw Error('Choose whether to prepare detected references');
  const native=options.nativePreparation===true;
  if(options.nativePreparation!==undefined&&typeof options.nativePreparation!=='boolean')throw Error('Invalid native preparation choice');
  if(native&&(!options.enabled||!Number.isSafeInteger(ownerId)||ownerId<1||options.acknowledgeFocusChange!==true||options.acknowledgeCreateCopy!==true||this.service.stopped||this.service.recovery?.required||this.service.mode!=='confirm'||this.service.connector.status?.state!=='connected'||!this.nativeReadiness().available))throw Error('Native preparation needs Confirm, an owning window, a verified route and explicit focus/copy consent for this session');
  this.cancel();this.enabled=options.enabled;this.nativeConsent=native;
  this.nativeBinding=native?{base:this.service.connector.base,generation:this.service.connector.generation}:null;
  this.nativeOwnerId=native?ownerId:null;
  this.onChange(this.status());return this.status();
 }
 cancel(){this.epoch++;this.pending=null;if(this.running)this.coordinator.cancel();}
 consider(candidates,owner){
  if(!this.enabled||this.service.stopped||this.service.recovery?.required||this.service.mode!=='confirm'||this.service.connector.status?.state!=='connected'){this.cancel();return;}
  if(this.nativeConsent&&(this.nativeBinding.base!==this.service.connector.base||this.nativeBinding.generation!==this.service.connector.generation)){this.configure(false);return;}
  // Non-reference preaching must not interrupt a consented native preparation.
  if(candidates.length===0&&this.running&&this.activeReferenceEpoch===this.service.referenceEpoch)return;
  this.cancel();
  // A sentence with multiple destinations needs an operator choice.
  if(candidates.length!==1)return;
  const candidate=candidates[0];
  if(!candidate.authorized||candidate.reference.valid!==true||candidate.reference.verse==null||candidate.reference.overLimit||candidate.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))return;
  this.pending={id:candidate.id,owner,epoch:this.epoch,referenceEpoch:this.service.referenceEpoch};
  void this.drain();
 }
 async drain(){
  if(this.running)return;this.running=true;this.onChange(this.status());
  try{while(this.pending){const work=this.pending;this.pending=null;if(!this.enabled||work.epoch!==this.epoch)continue;
    this.activeReferenceEpoch=work.referenceEpoch;
    try{await this.prepare(work.id,work.owner,this.nativeConsent?{acknowledgeFocusChange:true,acknowledgeCreateCopy:true}:{});}catch(error){if(work.epoch===this.epoch){this.service.log('REFERENCE_PREPARATION_BLOCKED','warning');}}
   }}finally{this.running=false;this.onChange(this.status());}
 }
}
module.exports={ReferencePreparation};
