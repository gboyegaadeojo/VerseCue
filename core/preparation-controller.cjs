'use strict';
class PreparationController {
  constructor({service,connector,speech,preparation,getTranslation,cancelRecognition=null}){Object.assign(this,{service,connector,speech,preparation,getTranslation,cancelRecognition});}
  readiness(){
    if(!this.preparation?.available())return {available:false,reason:'Automatic Bible preparation is unavailable on this platform/build. Prepare the exact passage in ProPresenter, then enter its reference again to review the saved copy.'};
    if(!this.connector.base||new URL(this.connector.base).hostname!=='127.0.0.1')return {available:false,reason:'Native Bible preparation must run on the ProPresenter computer. This LAN target supports saved-passage review; prepare new passages in ProPresenter first.'};
    if(this.connector.version?.host_description!=='ProPresenter 21.4.2'||this.connector.version?.platform!=='win')return {available:false,reason:'Automatic preparation is verified only for the inspected Windows ProPresenter 21.4.2 profile. This target can use exact saved passages; its native preparation route is not verified.'};
    return {available:true,scope:'personal-windows21.4.2-loopback-test'};
  }
  async prepare(reference,translation,guard=()=>true,{saveCopy=false,keepListening=false}={}){
    const {service,connector,speech,preparation}=this;
    if(!preparation?.available())throw new Error('Experimental Windows preparation helper is unavailable');
    const blocked=()=>!guard()||service.stopped||service.recovery?.required||service.busy||preparation.busy;
    if(blocked())throw new Error('Stop/busy state blocks Bible preparation');
    if(!connector.base||new URL(connector.base).hostname!=='127.0.0.1')throw new Error('Experimental UI preparation requires the local loopback ProPresenter target');
    const targetGeneration=service.generation,targetBase=connector.base;
    const version=await connector.read('/version');
    if(version.host_description!=='ProPresenter 21.4.2'||version.platform!=='win')throw new Error('This experimental UI profile is restricted to the inspected Windows ProPresenter 21.4.2 build');
    if(blocked()||targetGeneration!==service.generation||targetBase!==connector.base)throw new Error('Preparation canceled during target validation');
    const listeningPreserved=keepListening===true&&service.mode==='confirm'&&service.capture?.active===true&&typeof this.cancelRecognition==='function';
    if(listeningPreserved)this.cancelRecognition();else speech.cancel();connector.arm(false);service.configure({dryRun:true,translation:this.getTranslation()});if(!listeningPreserved)service.setMode('paused');
    const generation=service.generation;
    const result=await preparation.prepare(reference,translation,{guard:()=>guard()&&!service.stopped&&generation===service.generation,saveCopy});
    service.log('NATIVE_BIBLE_PREPARED_REVIEW','info',{nativeWorkerMs:result.workerElapsedMs});service.notify();return {...result,preparedGeneration:generation,listeningPreserved};
  }
  prepareCandidate(id){
    const {service}=this;service.expire();const candidate=service.queue.find(c=>c.id===id);
    if(!candidate||candidate.generation!==service.generation||!candidate.authorized||candidate.reference.valid===false||candidate.reference.overLimit||candidate.reference.verse==null||candidate.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw new Error('This candidate is expired, incomplete, prohibited or invalid');
    return this.prepare(candidate.label,candidate.translation,()=>service.clock()<candidate.expiresAt);
  }
}
module.exports={PreparationController};
