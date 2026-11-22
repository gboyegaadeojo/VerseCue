'use strict';
const {spawn}=require('node:child_process');const {parse,numbering}=require('./parser.cjs');
const nativeStages=['target-process-found','bind-target-window','target-window-bound','bible-view-verified','reference-control-verified','edition-control-verified','read-clipping-snapshot','validate-target','find-bible-controls','open-bible-view','open-installed-editions','select-installed-edition','focus-reference','commit-reference','verify-generated-labels','verify-translation','read-generated-snapshot','prepared-review','scroll-to-verse','open-save-copy-menu','save-copy-menu-opened','find-save-copy-command','save-copy-popup-profile-matched','save-copy-broad-search','verify-save-copy-command','save-new-presentation-copy'];
function stageTimes(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(nativeStages.filter(stage=>Number.isFinite(value[stage])&&value[stage]>=0&&value[stage]<=60000).map(stage=>[stage,Math.round(value[stage])]));}
function nativeFailureDiagnostics(error){const value=error?.nativeFailure;if(!value||typeof value!=='object'||Array.isArray(value)||![...nativeStages,'starting','verify-check'].includes(value.stage))return null;return {stage:value.stage,stageElapsedMs:Number.isFinite(value.stageElapsedMs)&&value.stageElapsedMs>=0&&value.stageElapsedMs<=60000?Math.round(value.stageElapsedMs):null,stageStartedAtMs:stageTimes(value.stageStartedAtMs)};}
const {nativePreparationReason:preparationReason}=require('./native-preparation-errors.cjs');
class BiblePreparation {
  constructor({helper,platform=process.platform,spawnImpl=spawn,timeoutMs=30000}={}){if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000)throw new Error('Invalid native helper deadline');this.timeoutMs=timeoutMs;this.helper=helper;this.platform=platform;this.spawn=spawnImpl;this.busy=false;this.child=null;this.epoch=0;}
  available(){return this.platform==='win32'&&Boolean(this.helper);}
  cancel(){this.epoch++;this.child?.kill();}
  // Installed versions (NR-018): read ProPresenter's version menu (opened and closed again; selection unchanged; no output).
  async listTranslations({guard=()=>true}={}){
    if(!this.available())throw new Error('Native Bible preparation is not available on this platform/build');
    if(this.busy)throw new Error('Bible preparation is already in progress');
    if(!guard())throw new Error('Preparation canceled');this.busy=true;const epoch=this.epoch;
    try{
      const data=await new Promise((resolve,reject)=>{const child=this.spawn(this.helper,[],{stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});this.child=child;let out='',size=0;const timer=setTimeout(()=>child.kill(),this.timeoutMs);
        child.stdout.on('data',b=>{size+=b.length;if(size<=16384)out+=b;});child.stderr.on('data',()=>{});
        child.once('error',()=>{clearTimeout(timer);reject(new Error('Native preparation helper could not start'));});
        child.once('close',()=>{clearTimeout(timer);try{resolve(JSON.parse(out));}catch{reject(new Error('Installed versions could not be read'));}});
        child.stdin.end(JSON.stringify({operation:'list-translations'})+'\n');});
      if(epoch!==this.epoch)throw new Error('Preparation canceled');
      if(data?.ok!==true||data.outputRequests!==0||!Array.isArray(data.installed)||!data.installed.length||data.installed.length>60||data.installed.some(n=>typeof n!=='string'||n.length>80))throw new Error(preparationReason(data?.code??'INSTALLED_EDITIONS_NOT_READ'));
      return {installed:data.installed,selected:typeof data.selected==='string'?data.selected:null};
    }finally{this.child=null;this.busy=false;}
  }
  async prepare(reference,translation,{guard=()=>true,saveCopy=false,maxVerses=10,focusVerse=null}={}){
    if(typeof saveCopy!=='boolean')throw new Error('Invalid save-copy choice');
    // Whole chapter for a volunteer (no saved copy, no output): "Proverbs 3" scrolled to the spoken verse.
    const chapter=focusVerse!==null;let chapterVerses=null;
    if(chapter){const r=parse(reference,{defaultTranslation:translation}).references;chapterVerses=r.length===1&&r[0].label===reference&&r[0].verse==null&&r[0].valid===true?numbering(translation)?.[r[0].book]?.[r[0].chapter-1]??numbering('KJV')[r[0].book]?.[r[0].chapter-1]:null;if(saveCopy||!Number.isInteger(chapterVerses)||!Number.isInteger(focusVerse)||focusVerse<1||focusVerse>chapterVerses||!['KJV','ASV','NIV','NKJV','AMP','AMPC','MSG','ESV','NLT'].includes(translation))throw new Error('Use one whole chapter, a verse inside it and a supported installed translation');}
    if(!this.available())throw new Error('Native Bible preparation is not available on this platform/build');
    if(this.busy)throw new Error('Bible preparation is already in progress');
    const parsed=parse(reference,{defaultTranslation:translation,maxVerses});const r=parsed.references[0];
    if(!chapter&&(parsed.references.length!==1||!r||r.label!==reference||r.verse==null||r.valid===false||r.overLimit||r.rangeLength===null||r.issues.some(i=>/Invalid/.test(i))||typeof translation!=='string'||!['KJV','ASV','NIV','NKJV','AMP','AMPC','MSG','ESV','NLT'].includes(translation)))throw new Error('Use one valid bounded canonical reference within the configured verse limit and a supported installed translation; cross-chapter numbering must be verified');
    if(!guard())throw new Error('Preparation canceled');this.busy=true;const epoch=this.epoch;const started=performance.now();
    try{
      const result=await new Promise((resolve,reject)=>{
        const child=this.spawn(this.helper,[],{stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});this.child=child;let stdout='',size=0,timedOut=false,stage='starting',stageElapsedMs=null,stderr='',lastCheck='',canceled=false,seenStages={};
        const failure=message=>Object.assign(new Error(message),{nativeFailure:{stage,stageElapsedMs,stageStartedAtMs:stageTimes(seenStages)}});
        const stillAllowed=()=>{try{return epoch===this.epoch&&guard();}catch{return false;}};
        const guardTimer=setInterval(()=>{if(!stillAllowed()){canceled=true;child.kill();}},50);
        // A whole chapter generates up to 176 slides, so reading them back takes longer than one passage. Limits are generous
        // because ProPresenter on Windows answers accessibility queries slowly once a helper has connected (docs/140).
        const timer=setTimeout(()=>{timedOut=true;child.kill();},chapter?Math.max(this.timeoutMs,45000):this.timeoutMs);
        child.stdout.on('data',chunk=>{size+=chunk.length;if(size>16384)child.kill();else stdout+=chunk.toString();});child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-4096);const lines=stderr.split(/\r?\n/);stderr=lines.pop();for(const line of lines){try{const event=JSON.parse(line);if(![...nativeStages,'verify-check'].includes(event.stage))continue;stage=event.stage;stageElapsedMs=null;if(Number.isFinite(event.elapsedMs)&&event.elapsedMs>=0&&event.elapsedMs<=60000){seenStages[stage]=event.elapsedMs;stageElapsedMs=Math.round(event.elapsedMs);}if(event.stage==='verify-check'&&typeof event.fieldMatches==='boolean'&&typeof event.rangeFound==='boolean')lastCheck=` (input ${event.fieldMatches?'matches':'differs'}, generated range ${event.rangeFound?'found':'not found'})`;}catch{}}});child.stdin.on('error',()=>{});
        child.once('error',()=>{clearTimeout(timer);clearInterval(guardTimer);reject(failure('Native preparation helper could not start'));});
        child.once('close',code=>{clearTimeout(timer);clearInterval(guardTimer);if(canceled||!stillAllowed())return reject(failure('Preparation canceled; inspect ProPresenter before retrying'));if(timedOut)return reject(failure('Native preparation timed out during '+stage+(stageElapsedMs===null?'':' (stage began at '+stageElapsedMs+'ms)')+lastCheck+'; inspect ProPresenter before retrying'));try{let data;try{data=JSON.parse(stdout);}catch{throw new Error('Native preparation response mismatch');}if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Native preparation response mismatch');if(code!==0||data.ok!==true)throw new Error(preparationReason(data.code??'NATIVE_PREPARATION_UNCERTAIN'));if(data.outputRequests!==0||data.reference!==reference||data.translation!==translation||data.state!==(chapter?'chapter-prepared-no-output':'prepared-needs-operator-review')||(chapter&&(data.focusVerse!==focusVerse||typeof data.focusVisible!=='boolean'))||data.saveCopyRequested!==saveCopy||typeof data.clippingWarning!=='boolean'||!Number.isInteger(data.referenceLabels)||data.referenceLabels<1||data.referenceLabels>1000)throw new Error('Native preparation response mismatch');resolve(data);}catch(error){reject(failure('Preparation not verified: '+error.message));}});
        child.stdin.end(JSON.stringify(chapter?{operation:'prepare-chapter',reference,translation,focusVerse,chapterVerses}:{operation:saveCopy?'prepare-save':'prepare',reference,translation})+'\n');
      });
      if(epoch!==this.epoch||!guard())throw new Error('Preparation canceled; already changed preparation may remain visible in ProPresenter');
      return {ok:true,state:chapter?'chapter-prepared-no-output':'prepared-needs-operator-review',reference,translation,...(chapter?{focusVerse,focusVisible:result.focusVisible===true,chapterVerses}:{}),saveCopyRequested:saveCopy,referenceLabels:Number.isInteger(result.referenceLabels)?result.referenceLabels:null,clippingWarning:result.clippingWarning===true,outputRequests:0,workerElapsedMs:Math.round(performance.now()-started),nativeStageStartedAtMs:stageTimes(result.timingsMs),formattingVerified:false,outputObserved:false};
    }finally{this.child=null;this.busy=false;}
  }
}
module.exports={BiblePreparation,nativeFailureDiagnostics};
