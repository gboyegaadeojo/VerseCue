'use strict';
const {spawn}=require('node:child_process');const {parse}=require('./parser.cjs');
const nativeStages=['validate-target','find-bible-controls','open-bible-view','open-installed-editions','select-installed-edition','focus-reference','commit-reference','verify-generated-labels','verify-translation','read-generated-snapshot','prepared-review','open-save-copy-menu','save-new-presentation-copy'];
function stageTimes(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(nativeStages.filter(stage=>Number.isFinite(value[stage])&&value[stage]>=0&&value[stage]<=12000).map(stage=>[stage,Math.round(value[stage])]));}
const preparationReason=code=>({REQUESTED_EDITION_NOT_FOUND_OR_MENU_UNVERIFIED:'The requested installed Bible edition could not be selected. Check that it is installed and that the edition menu is available.',EDITION_SELECTION_NOT_VERIFIED:'ProPresenter did not confirm the requested Bible edition. Inspect its selected edition before preparing again.',BIBLE_VIEW_NOT_VERIFIED:'ProPresenter did not finish opening its Bible view. Inspect the app before preparing again.',PREPARATION_COMPLETION_NOT_VERIFIED:'The generated passage could not be verified. Inspect ProPresenter before preparing again.'}[code]??code);
class BiblePreparation {
  constructor({helper,platform=process.platform,spawnImpl=spawn,timeoutMs=12000}={}){if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>12000)throw new Error('Invalid native helper deadline');this.timeoutMs=timeoutMs;this.helper=helper;this.platform=platform;this.spawn=spawnImpl;this.busy=false;this.child=null;this.epoch=0;}
  available(){return this.platform==='win32'&&Boolean(this.helper);}
  cancel(){this.epoch++;this.child?.kill();}
  async prepare(reference,translation,{guard=()=>true,saveCopy=false}={}){
    if(typeof saveCopy!=='boolean')throw new Error('Invalid save-copy choice');
    if(!this.available())throw new Error('Native Bible preparation is not available on this platform/build');
    if(this.busy)throw new Error('Bible preparation is already in progress');
    const parsed=parse(reference,{defaultTranslation:translation});const r=parsed.references[0];
    if(parsed.references.length!==1||!r||r.label!==reference||r.verse==null||r.valid===false||r.overLimit||r.issues.some(i=>/Invalid/.test(i))||typeof translation!=='string'||!['KJV','ASV','NIV','NKJV','AMP','AMPC','MSG'].includes(translation))throw new Error('Use one valid canonical reference of at most 10 verses and a supported installed translation');
    if(!guard())throw new Error('Preparation canceled');this.busy=true;const epoch=this.epoch;const started=performance.now();
    try{
      const result=await new Promise((resolve,reject)=>{
        const child=this.spawn(this.helper,[],{stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});this.child=child;let stdout='',size=0,timedOut=false,stage='starting',stageElapsedMs=null,stderr='',lastCheck='',canceled=false;
        const stillAllowed=()=>{try{return epoch===this.epoch&&guard();}catch{return false;}};
        const guardTimer=setInterval(()=>{if(!stillAllowed()){canceled=true;child.kill();}},50);
        const timer=setTimeout(()=>{timedOut=true;child.kill();},this.timeoutMs);
        child.stdout.on('data',chunk=>{size+=chunk.length;if(size>16384)child.kill();else stdout+=chunk.toString();});child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-4096);const lines=stderr.split(/\r?\n/);stderr=lines.pop();for(const line of lines){try{const event=JSON.parse(line);if(typeof event.stage==='string'&&/^[a-z-]{1,50}$/.test(event.stage))stage=event.stage;if(Number.isFinite(event.elapsedMs)&&event.elapsedMs>=0&&event.elapsedMs<=120000)stageElapsedMs=Math.round(event.elapsedMs);if(typeof event.fieldMatches==='boolean'&&typeof event.rangeFound==='boolean')lastCheck=` (input ${event.fieldMatches?'matches':'differs'}, generated range ${event.rangeFound?'found':'not found'})`;}catch{}}});child.stdin.on('error',()=>{});
        child.once('error',()=>{clearTimeout(timer);clearInterval(guardTimer);reject(new Error('Native preparation helper could not start'));});
        child.once('close',code=>{clearTimeout(timer);clearInterval(guardTimer);if(canceled||!stillAllowed())return reject(new Error('Preparation canceled; inspect ProPresenter before retrying'));if(timedOut)return reject(new Error('Native preparation timed out during '+stage+(stageElapsedMs===null?'':' (stage began at '+stageElapsedMs+'ms)')+lastCheck+'; inspect ProPresenter before retrying'));try{const data=JSON.parse(stdout);if(code!==0||!data.ok)throw new Error(preparationReason(data.code??'NATIVE_PREPARATION_UNCERTAIN'));if(data.outputRequests!==0||data.reference!==reference||data.translation!==translation||data.state!=='prepared-needs-operator-review'||Boolean(data.saveCopyRequested)!==saveCopy)throw new Error('Native preparation response mismatch');resolve(data);}catch(error){reject(new Error('Preparation not verified: '+error.message));}});
        child.stdin.end(JSON.stringify({operation:saveCopy?'prepare-save':'prepare',reference,translation})+'\n');
      });
      if(epoch!==this.epoch||!guard())throw new Error('Preparation canceled; already changed preparation may remain visible in ProPresenter');
      return {ok:true,state:'prepared-needs-operator-review',reference,translation,saveCopyRequested:saveCopy,referenceLabels:Number.isInteger(result.referenceLabels)?result.referenceLabels:null,clippingWarning:result.clippingWarning===true,outputRequests:0,workerElapsedMs:Math.round(performance.now()-started),nativeStageStartedAtMs:stageTimes(result.timingsMs),formattingVerified:false,outputObserved:false};
    }finally{this.child=null;this.busy=false;}
  }
}
module.exports={BiblePreparation};
