'use strict';
const {parse}=require('./parser.cjs');
class PreparationController {
  constructor({service,connector,speech,preparation,getTranslation,cancelRecognition=null}){Object.assign(this,{service,connector,speech,preparation,getTranslation,cancelRecognition});}
  readiness(){
    if(!this.preparation?.available())return {available:false,reason:'Automatic Bible preparation is unavailable on this platform/build. Prepare the exact passage in ProPresenter, then enter its reference again to review the saved copy.'};
    if(!this.connector.base||new URL(this.connector.base).hostname!=='127.0.0.1')return {available:false,reason:'Native Bible preparation must run on the ProPresenter computer. This LAN target supports saved-passage review; prepare new passages in ProPresenter first.'};
    // Any ProPresenter version on Windows (NR-017). The helper verifies every control (Bible view, reference field,
    // edition, generated labels) before acting and stops safely if a future version differs; it never sends output.
    const host=this.connector.version?.host_description??'';
    if(!/^ProPresenter(\s|$)/.test(host)||this.connector.version?.platform!=='win')return {available:false,reason:'Automatic preparation uses the ProPresenter Bible view on Windows; on this platform, use exact saved passages.'};
    return {available:true,scope:'windows-loopback',verifiedVersion:'ProPresenter 21.4.2',version:host,versionVerified:host==='ProPresenter 21.4.2'};
  }
  async prepare(reference,translation,guard=()=>true,{saveCopy=false,keepListening=false,focusVerse=null}={}){
    const {service,connector,speech,preparation}=this;
    if(!preparation?.available())throw new Error('Experimental Windows preparation helper is unavailable');
    const maxVerses=service.maxPassageVerses??10,parsed=parse(reference,{defaultTranslation:translation,maxVerses}),requested=parsed.references[0];
    const chapter=focusVerse!==null&&parsed.references.length===1&&requested?.label===reference&&requested.valid===true&&requested.verse==null;
    if(!chapter&&(parsed.references.length!==1||!requested||requested.label!==reference||requested.valid!==true||requested.verse==null||requested.overLimit||requested.rangeLength===null))throw Error('Use one bounded canonical passage within the configured verse limit; cross-chapter numbering must be verified');
    const blocked=()=>!guard()||service.stopped||service.recovery?.required||service.busy||preparation.busy;
    if(blocked())throw new Error('Stop/busy state blocks Bible preparation');
    if(!connector.base||new URL(connector.base).hostname!=='127.0.0.1')throw new Error('Experimental UI preparation requires the local loopback ProPresenter target');
    const targetGeneration=service.generation,targetBase=connector.base;
    const version=await connector.read('/version');
    if(!/^ProPresenter(\s|$)/.test(version.host_description??'')||version.platform!=='win')throw new Error('Automatic preparation needs ProPresenter on Windows');
    if(blocked()||targetGeneration!==service.generation||targetBase!==connector.base)throw new Error('Preparation canceled during target validation');
    const confirmPreparation=keepListening===true&&service.mode==='confirm'&&typeof this.cancelRecognition==='function';
    const listeningPreserved=confirmPreparation&&service.capture?.active===true;
    if(confirmPreparation)this.cancelRecognition();else speech.cancel();connector.arm(false);service.configure({dryRun:true,translation:this.getTranslation()});if(!confirmPreparation)service.setMode('paused');
    const generation=service.generation;
    const result=await preparation.prepare(reference,translation,{guard:()=>guard()&&!service.stopped&&generation===service.generation,saveCopy,maxVerses,...(chapter?{focusVerse}:{})});
    service.log('NATIVE_BIBLE_PREPARED_REVIEW','info',{nativeWorkerMs:result.workerElapsedMs});service.notify();return {...result,preparedGeneration:generation,listeningPreserved};
  }
  // Which Bible versions this ProPresenter has, remembered for 10 minutes per connection. null when it cannot be checked here.
  async installedVersions(guard=()=>true){
    const {codesFromNames}=require('./bible-versions.cjs');
    if(!this.preparation?.available()||this.readiness().available!==true)return null;
    const key=this.connector.generation+'|'+this.connector.base;
    if(this.versionCache?.key===key&&Date.now()-this.versionCache.at<600000)return this.versionCache.value;
    const read=await this.preparation.listTranslations({guard});const value={names:read.installed,codes:codesFromNames(read.installed)};
    this.versionCache={key,at:Date.now(),value};this.service.log('INSTALLED_VERSIONS_READ','info',{count:value.codes.length});return value;
  }
  prepareCandidate(id){
    const {service}=this;service.expire();const candidate=service.queue.find(c=>c.id===id);
    if(!candidate||candidate.generation!==service.generation||!candidate.authorized||candidate.reference.valid===false||candidate.reference.overLimit||candidate.reference.verse==null||candidate.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw new Error('This candidate is expired, incomplete, prohibited or invalid');
    return this.prepare(candidate.label,candidate.translation,()=>service.clock()<candidate.expiresAt);
  }
}
module.exports={PreparationController};
