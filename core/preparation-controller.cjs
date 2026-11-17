'use strict';
class PreparationController {
  constructor({service,connector,speech,preparation,getTranslation}){Object.assign(this,{service,connector,speech,preparation,getTranslation});}
  async prepare(reference,translation,guard=()=>true){
    const {service,connector,speech,preparation}=this;
    if(!preparation?.available())throw new Error('Experimental Windows preparation helper is unavailable');
    const blocked=()=>!guard()||service.stopped||service.busy||preparation.busy;
    if(blocked())throw new Error('Stop/busy state blocks Bible preparation');
    if(!connector.base||new URL(connector.base).hostname!=='127.0.0.1')throw new Error('Experimental UI preparation requires the local loopback ProPresenter target');
    const targetGeneration=service.generation,targetBase=connector.base;
    const version=await connector.read('/version');
    if(version.host_description!=='ProPresenter 21.4.2'||version.platform!=='win')throw new Error('This experimental UI profile is restricted to the inspected Windows ProPresenter 21.4.2 build');
    if(blocked()||targetGeneration!==service.generation||targetBase!==connector.base)throw new Error('Preparation canceled during target validation');
    speech.cancel();connector.arm(false);service.configure({dryRun:true,translation:this.getTranslation()});service.setMode('paused');
    const generation=service.generation;
    const result=await preparation.prepare(reference,translation,{guard:()=>guard()&&!service.stopped&&generation===service.generation});
    service.log('NATIVE_BIBLE_PREPARED_REVIEW','info',{nativeWorkerMs:result.workerElapsedMs});service.notify();return result;
  }
  prepareCandidate(id){
    const {service}=this;service.expire();const candidate=service.queue.find(c=>c.id===id);
    if(!candidate||candidate.generation!==service.generation||!candidate.authorized||candidate.reference.valid===false||candidate.reference.overLimit||candidate.reference.verse==null||candidate.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw new Error('This candidate is expired, incomplete, prohibited or invalid');
    return this.prepare(candidate.label,candidate.translation,()=>service.clock()<candidate.expiresAt);
  }
}
module.exports={PreparationController};
