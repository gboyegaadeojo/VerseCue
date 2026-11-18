'use strict';
// Session-only, preparation-only scheduling. This never arms or sends output.
class ReferencePreparation {
 constructor({service,coordinator,prepare,onChange=()=>{}}){Object.assign(this,{service,coordinator,prepare,onChange});this.enabled=false;this.pending=null;this.running=false;this.epoch=0;}
 status(){return {enabled:this.enabled,running:this.running,scope:'saved-passages-only'};}
 configure(enabled){if(typeof enabled!=='boolean')throw Error('Choose whether to prepare detected references');this.enabled=enabled;this.cancel();this.onChange(this.status());return this.status();}
 cancel(){this.epoch++;this.pending=null;if(this.running)this.coordinator.cancel();}
 consider(candidates,owner){
  this.cancel();
  if(!this.enabled||this.service.stopped||this.service.recovery?.required||this.service.mode!=='confirm'||this.service.connector.status?.state!=='connected')return;
  // A sentence with multiple destinations needs an operator choice.
  if(candidates.length!==1)return;
  const candidate=candidates[0];
  if(!candidate.authorized||candidate.reference.valid!==true||candidate.reference.verse==null||candidate.reference.overLimit||candidate.issues.some(issue=>/Invalid|no-show|not supported/.test(issue)))return;
  this.pending={id:candidate.id,owner,epoch:this.epoch};
  void this.drain();
 }
 async drain(){
  if(this.running)return;this.running=true;this.onChange(this.status());
  try{while(this.pending){const work=this.pending;this.pending=null;if(!this.enabled||work.epoch!==this.epoch)continue;
    try{await this.prepare(work.id,work.owner);}catch(error){if(work.epoch===this.epoch){this.service.log('REFERENCE_PREPARATION_BLOCKED','warning');}}
   }}finally{this.running=false;this.onChange(this.status());}
 }
}
module.exports={ReferencePreparation};
