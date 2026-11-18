'use strict';
const {randomUUID}=require('node:crypto');
// Reference preparation and explicit desktop confirmation. Output uses the
// existing Session/Connector guards; no generic Next, Clear or blind retry.
class PassageCoordinator {
 constructor({service,connector,resolver,savedBible,onChange=()=>{}}){Object.assign(this,{service,connector,resolver,savedBible,onChange});this.epoch=0;this.busy=false;this.state={phase:'idle'};}
 publish(state){this.state=state;this.onChange({...state});return state;}
 cancel(){this.epoch++;this.review=null;this.savedBible.cancel();this.publish({phase:'canceled',outputRequests:0});}
 candidate(id){this.service.expire();const c=this.service.queue.find(row=>row.id===id);if(!c||this.service.stopped||this.service.recovery?.required||!c.authorized||c.generation!==this.service.generation||c.reference.valid!==true||c.reference.verse==null||c.reference.overLimit||c.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))throw Error('Review a valid current passage first');return c;}
 async prepare(id,{acknowledgeFocusChange=false,acknowledgeCreateCopy=false}={}){
  if(this.busy)throw Error('A passage preparation is already in progress');const c=this.candidate(id),epoch=++this.epoch,target=this.connector.generation,base=this.connector.base;this.review=null;this.busy=true;
  const guard=()=>epoch===this.epoch&&target===this.connector.generation&&base===this.connector.base&&!this.service.stopped&&!this.service.recovery?.required;
  const check=()=>{if(!guard())throw Error('Passage preparation canceled or target changed');};
  try{
   this.publish({phase:'resolving',reference:c.label,translation:c.translation,outputRequests:0});
   let result=await this.resolver.findCandidate(this.service,id);check();
   if(result.state==='ambiguous-passages')return this.publish({phase:'ambiguous',...result});
   if(result.state==='needs-preparation'){
    if(acknowledgeFocusChange!==true||acknowledgeCreateCopy!==true)return this.publish({phase:'consent-required',reference:c.label,translation:c.translation,reason:'Preparation may move ProPresenter focus and create an internal Bible copy. Explicit session consent is required.',outputRequests:0});
    this.candidate(id);check();this.publish({phase:'preparing',reference:c.label,translation:c.translation,outputRequests:0});
    const saved=await this.savedBible.prepare(c.label,c.translation,null,guard);check();
    if(saved.coverageComplete!==true||!Number.isInteger(saved.preparedGeneration)||this.service.generation!==saved.preparedGeneration)throw Error('Complete passage preparation could not be verified');
    const preparedGeneration=saved.preparedGeneration;
    result=await this.resolver.find(c.label,c.translation,{guard:()=>guard()&&this.service.generation===preparedGeneration});check();
    if(this.service.generation!==preparedGeneration||result.state!=='passage-needs-review'||result.uuid!==saved.uuid)throw Error('Prepared copy is ambiguous or changed; inspect ProPresenter');
    result={...result,clippingWarning:saved.clippingWarning===true,requiresFreshReview:true};
   }
   if(result.state!=='passage-needs-review')throw Error('No exact passage is ready for review');
   const reviewToken=randomUUID();this.review={token:reviewToken,plan:structuredClone(result),source:structuredClone(c),epoch,target,base,generation:this.service.generation,inputEpoch:this.service.inputEpoch,expiresAt:this.service.clock()+120000};
   return this.publish({...result,phase:'review-required',reviewToken,sourceCandidateId:id,bibleTextVerified:false,formattingVerified:false,outputObserved:false,outputRequests:0});
  }catch(error){this.publish({phase:guard()?'blocked':'canceled',reference:c.label,translation:c.translation,reason:error.message,outputRequests:0});throw error;}finally{this.busy=false;}
 }
 async confirm(reviewToken,{verified=false,acknowledgeTestOutput=false}={}){
  const r=this.review,s=this.service,c=this.connector;
  if(s.mode==='suggest')throw Error('Switch from Suggest only to Confirm before showing a passage');
  if(this.busy||!r||r.token!==reviewToken||verified!==true||acknowledgeTestOutput!==true)throw Error('Review the prepared passage and acknowledge the authorized test output first');
  const valid=()=>this.review===r&&r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&r.generation===s.generation&&r.inputEpoch===s.inputEpoch&&!s.stopped&&!s.recovery?.required&&s.clock()<r.expiresAt;
  if(!valid())throw Error('Prepared review expired or changed; prepare the passage again');
  this.busy=true;
  try{
   await c.preparePassage({uuid:r.plan.uuid,reference:r.plan.reference,translation:r.plan.translation,expectedFingerprint:r.plan.fingerprint,verified:true,guard:valid});
   if(!valid())throw Error('Passage confirmation canceled');
   // This explicit desktop confirmation authorizes one verified test passage.
   // Apply safe session transitions before creating its fresh manual candidate.
   c.arm(true);s.configure({dryRun:false,translation:s.translation});s.resume();
   const generation=s.generation;
   const [candidate]=s.ingest(`${r.plan.reference} in ${r.plan.translation}`,{manual:true});
   if(!candidate)throw Error('Confirmed passage could not be created');
   candidate.recognition=r.source.recognition??'reference';
   const sendEpoch=s.inputEpoch;
   const guard=()=>this.review===r&&r.epoch===this.epoch&&r.target===c.generation&&r.base===c.base&&!s.stopped&&!s.recovery?.required&&s.generation===generation&&s.inputEpoch===sendEpoch;
   const receipt=await s.send(candidate.id,{origin:'desktop',additionalGuard:guard});
   this.review=null;return this.publish({phase:receipt.state==='readback-matched'?'readback-matched':'uncertain',reference:r.plan.reference,translation:r.plan.translation,...receipt});
  }catch(error){c.arm(false);s.setMode('paused');this.review=null;this.publish({phase:'blocked',reason:error.message,outputObserved:false});throw error;}finally{this.busy=false;}
 }
}
module.exports={PassageCoordinator};
