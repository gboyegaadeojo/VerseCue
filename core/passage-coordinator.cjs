'use strict';
// Preparation orchestration only. This class cannot map, arm or trigger output.
class PassageCoordinator {
 constructor({service,connector,resolver,savedBible,onChange=()=>{}}){Object.assign(this,{service,connector,resolver,savedBible,onChange});this.epoch=0;this.busy=false;this.state={phase:'idle'};}
 publish(state){this.state=state;this.onChange({...state});return state;}
 cancel(){this.epoch++;this.savedBible.cancel();this.publish({phase:'canceled',outputRequests:0});}
 candidate(id){this.service.expire();const c=this.service.queue.find(row=>row.id===id);if(!c||this.service.stopped||this.service.recovery?.required||!c.authorized||c.generation!==this.service.generation||c.reference.valid!==true||c.reference.verse==null||c.reference.overLimit||c.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))throw Error('Review a valid current passage first');return c;}
 async prepare(id,{acknowledgeFocusChange=false,acknowledgeCreateCopy=false}={}){
  if(this.busy)throw Error('A passage preparation is already in progress');const c=this.candidate(id),epoch=++this.epoch,target=this.connector.generation,base=this.connector.base;this.busy=true;
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
   return this.publish({...result,phase:'review-required',sourceCandidateId:id,bibleTextVerified:false,formattingVerified:false,outputObserved:false,outputRequests:0});
  }catch(error){this.publish({phase:guard()?'blocked':'canceled',reference:c.label,translation:c.translation,reason:error.message,outputRequests:0});throw error;}finally{this.busy=false;}
 }
}
module.exports={PassageCoordinator};
