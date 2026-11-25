'use strict';
const {spawn}=require('node:child_process');const {parse,numbering}=require('./parser.cjs');
const nativeStages=['target-process-found','bind-target-window','target-window-bound','bible-view-verified','reference-control-verified','edition-control-verified','read-clipping-snapshot','validate-target','find-bible-controls','open-bible-view','open-installed-editions','select-installed-edition','focus-reference','commit-reference','verify-generated-labels','verify-translation','read-generated-snapshot','prepared-review','scroll-to-verse','open-save-copy-menu','save-copy-menu-opened','find-save-copy-command','save-copy-popup-profile-matched','save-copy-broad-search','verify-save-copy-command','save-new-presentation-copy'];
function stageTimes(value){if(!value||typeof value!=='object'||Array.isArray(value))return {};return Object.fromEntries(nativeStages.filter(stage=>Number.isFinite(value[stage])&&value[stage]>=0&&value[stage]<=60000).map(stage=>[stage,Math.round(value[stage])]));}
function nativeFailureDiagnostics(error){const value=error?.nativeFailure;if(!value||typeof value!=='object'||Array.isArray(value)||![...nativeStages,'starting','verify-check'].includes(value.stage))return null;return {stage:value.stage,stageElapsedMs:Number.isFinite(value.stageElapsedMs)&&value.stageElapsedMs>=0&&value.stageElapsedMs<=60000?Math.round(value.stageElapsedMs):null,stageStartedAtMs:stageTimes(value.stageStartedAtMs)};}
const {nativePreparationReason:preparationReason}=require('./native-preparation-errors.cjs');
class BiblePreparation {
  constructor({helper,platform=process.platform,spawnImpl=spawn,timeoutMs=30000,persistent=false,idleMs=600000}={}){if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000)throw new Error('Invalid native helper deadline');this.timeoutMs=timeoutMs;this.helper=helper;this.platform=platform;this.spawn=spawnImpl;this.busy=false;this.child=null;this.epoch=0;this.persistent=persistent===true;this.idleMs=idleMs;this.server=null;this.idleTimer=null;}
  available(){return this.platform==='win32'&&Boolean(this.helper);}
  // Cancel stops the request in flight (its helper process is ended); an idle kept-running helper stays ready.
  cancel(){this.epoch++;this.child?.kill();}
  dispose(){clearTimeout(this.idleTimer);this.server?.kill();this.server=null;}
  // Kept-running helper (NR-020): started on first use, ended after 10 idle minutes, on any failure or when VerseCue closes.
  serverProcess(){
    if(this.server&&this.server.exitCode==null&&!this.server.killed)return this.server;
    const child=this.spawn(this.helper,['--serve'],{stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});this.server=child;
    child.once('close',()=>{if(this.server===child)this.server=null;});child.once('error',()=>{if(this.server===child)this.server=null;});child.stdin.on('error',()=>{});return child;
  }
  // Sends one request and returns {stdout,code}. Rejects with reason 'start', 'timeout' or 'canceled'.
  exchange(request,{timeoutMs,allowed=()=>true,onStderr=()=>{},persistent=this.persistent}){
    return new Promise((resolve,reject)=>{
      let child;try{child=persistent?this.serverProcess():this.spawn(this.helper,[],{stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});}catch{return reject(Object.assign(new Error('start'),{reason:'start'}));}
      this.child=child;let stdout='',size=0,done=false,timedOut=false,canceled=false;
      const stop=()=>{if(persistent&&this.server===child)this.server=null;child.kill();};
      const guardTimer=setInterval(()=>{if(!allowed()){canceled=true;stop();}},50);
      const timer=setTimeout(()=>{timedOut=true;stop();},timeoutMs);
      const onOut=chunk=>{size+=chunk.length;if(size>16384){stop();return;}stdout+=chunk.toString();if(persistent){const end=stdout.indexOf('\n');if(end>=0)finish(()=>resolve({stdout:stdout.slice(0,end).trim(),code:0}));}};
      const onErr=chunk=>onStderr(chunk.toString());
      const onClose=code=>finish(()=>{if(canceled||!allowed())return reject(Object.assign(new Error('canceled'),{reason:'canceled'}));if(timedOut)return reject(Object.assign(new Error('timeout'),{reason:'timeout'}));resolve({stdout:persistent?'':stdout,code:persistent?3:code});});
      const onError=()=>finish(()=>reject(Object.assign(new Error('start'),{reason:'start'})));
      function finish(fn){if(done)return;done=true;clearTimeout(timer);clearInterval(guardTimer);child.stdout.off?.('data',onOut);child.stderr.off?.('data',onErr);child.off?.('close',onClose);child.off?.('error',onError);fn();}
      child.stdout.on('data',onOut);child.stderr.on('data',onErr);child.once('close',onClose);child.once('error',onError);child.stdin.on('error',()=>{});
      const text=JSON.stringify(request)+'\n';if(persistent)child.stdin.write(text);else child.stdin.end(text);
    }).finally(()=>{this.child=null;if(this.persistent){clearTimeout(this.idleTimer);this.idleTimer=setTimeout(()=>this.dispose(),this.idleMs);this.idleTimer.unref?.();}});
  }
  // A kept-running helper may be refused focus by Windows. That happens before anything is typed, so the same
  // request is tried once by a newly started helper, which Windows treats as VerseCue's own action.
  async exchangeWithFallback(request,options){
    const first=await this.exchange(request,options);if(!this.persistent)return first;
    let data;try{data=JSON.parse(first.stdout);}catch{return first;}
    if(data?.ok===false&&data.code==='COULD_NOT_FOCUS_PROPRESENTER'&&options.allowed())return this.exchange(request,{...options,persistent:false});
    return first;
  }
  // Installed versions (NR-018): read ProPresenter's version menu (opened and closed again; selection unchanged; no output).
  async listTranslations({guard=()=>true}={}){
    if(!this.available())throw new Error('Native Bible preparation is not available on this platform/build');
    if(this.busy)throw new Error('Bible preparation is already in progress');
    if(!guard())throw new Error('Preparation canceled');this.busy=true;const epoch=this.epoch;
    try{
      let out;try{out=await this.exchangeWithFallback({operation:'list-translations'},{timeoutMs:this.timeoutMs,allowed:()=>epoch===this.epoch});}catch(error){throw new Error(error.reason==='start'?'Native preparation helper could not start':'Installed versions could not be read');}
      let data;try{data=JSON.parse(out.stdout);}catch{throw new Error('Installed versions could not be read');}
      if(epoch!==this.epoch)throw new Error('Preparation canceled');
      if(data?.ok!==true||data.outputRequests!==0||!Array.isArray(data.installed)||!data.installed.length||data.installed.length>60||data.installed.some(n=>typeof n!=='string'||n.length>80))throw new Error(preparationReason(data?.code??'INSTALLED_EDITIONS_NOT_READ'));
      return {installed:data.installed,selected:typeof data.selected==='string'?data.selected:null};
    }finally{this.busy=false;}
  }
  async prepare(reference,translation,{guard=()=>true,saveCopy=false,maxVerses=10,focusVerse=null,listVersions=false,fromVerse=false}={}){
    if(typeof saveCopy!=='boolean')throw new Error('Invalid save-copy choice');
    // Whole chapter for a volunteer (no saved copy, no output): "Proverbs 3" scrolled to the spoken verse. With fromVerse
    // (setting "From the spoken verse", docs/154) ProPresenter opens "Proverbs 3:5-35" instead: no scrolling, fewer slides.
    const chapter=focusVerse!==null;let chapterVerses=null;
    if(chapter){const r=parse(reference,{defaultTranslation:translation}).references;chapterVerses=r.length===1&&r[0].label===reference&&r[0].verse==null&&r[0].valid===true?numbering(translation)?.[r[0].book]?.[r[0].chapter-1]??numbering('KJV')[r[0].book]?.[r[0].chapter-1]:null;if(typeof fromVerse!=='boolean'||saveCopy||!Number.isInteger(chapterVerses)||!Number.isInteger(focusVerse)||focusVerse<1||focusVerse>chapterVerses||!['KJV','ASV','NIV','NKJV','AMP','AMPC','MSG','ESV','NLT'].includes(translation))throw new Error('Use one whole chapter, a verse inside it and a supported installed translation');}
    if(!this.available())throw new Error('Native Bible preparation is not available on this platform/build');
    if(this.busy)throw new Error('Bible preparation is already in progress');
    const parsed=parse(reference,{defaultTranslation:translation,maxVerses});const r=parsed.references[0];
    if(!chapter&&(parsed.references.length!==1||!r||r.label!==reference||r.verse==null||r.valid===false||r.overLimit||r.rangeLength===null||r.issues.some(i=>/Invalid/.test(i))||typeof translation!=='string'||!['KJV','ASV','NIV','NKJV','AMP','AMPC','MSG','ESV','NLT'].includes(translation)))throw new Error('Use one valid bounded canonical reference within the configured verse limit and a supported installed translation; cross-chapter numbering must be verified');
    if(!guard())throw new Error('Preparation canceled');this.busy=true;const epoch=this.epoch;const started=performance.now();
    try{
      let stage='starting',stageElapsedMs=null,stderr='',lastCheck='',seenStages={};
      const failure=message=>Object.assign(new Error(message),{nativeFailure:{stage,stageElapsedMs,stageStartedAtMs:stageTimes(seenStages)}});
      const stillAllowed=()=>{try{return epoch===this.epoch&&guard();}catch{return false;}};
      const onStderr=text=>{stderr=(stderr+text).slice(-4096);const lines=stderr.split(/\r?\n/);stderr=lines.pop();for(const line of lines){try{const event=JSON.parse(line);if(![...nativeStages,'verify-check'].includes(event.stage))continue;stage=event.stage;stageElapsedMs=null;if(Number.isFinite(event.elapsedMs)&&event.elapsedMs>=0&&event.elapsedMs<=60000){seenStages[stage]=event.elapsedMs;stageElapsedMs=Math.round(event.elapsedMs);}if(event.stage==='verify-check'&&typeof event.fieldMatches==='boolean'&&typeof event.rangeFound==='boolean')lastCheck=` (input ${event.fieldMatches?'matches':'differs'}, generated range ${event.rangeFound?'found':'not found'})`;}catch{}}};
      // A whole chapter generates up to 176 slides, so reading them back takes longer than one passage. Limits are generous
      // because ProPresenter on Windows answers accessibility queries slowly once a helper has connected (docs/140).
      const request=chapter?{operation:'prepare-chapter',reference,translation,focusVerse,chapterVerses,...(fromVerse?{fromVerse:true}:{}),...(listVersions===true?{listVersions:true}:{})}:{operation:saveCopy?'prepare-save':'prepare',reference,translation};
      let reply;try{reply=await this.exchangeWithFallback(request,{timeoutMs:chapter?Math.max(this.timeoutMs,45000):this.timeoutMs,allowed:stillAllowed,onStderr});}
      catch(error){if(error.reason==='start')throw failure('Native preparation helper could not start');if(error.reason==='timeout')throw failure('Native preparation timed out during '+stage+(stageElapsedMs===null?'':' (stage began at '+stageElapsedMs+'ms)')+lastCheck+'; inspect ProPresenter before retrying');throw failure('Preparation canceled; inspect ProPresenter before retrying');}
      if(!stillAllowed())throw failure('Preparation canceled; inspect ProPresenter before retrying');
      const result=(()=>{const stdout=reply.stdout,code=reply.code;try{let data;try{data=JSON.parse(stdout);}catch{throw new Error('Native preparation response mismatch');}if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Native preparation response mismatch');if(code!==0||data.ok!==true)throw new Error(preparationReason(data.code??'NATIVE_PREPARATION_UNCERTAIN'));if(data.outputRequests!==0||data.reference!==reference||data.translation!==translation||data.state!==(chapter?'chapter-prepared-no-output':'prepared-needs-operator-review')||(chapter&&(data.focusVerse!==focusVerse||typeof data.focusVisible!=='boolean'||(data.fromVerse===true)!==fromVerse))||data.saveCopyRequested!==saveCopy||typeof data.clippingWarning!=='boolean'||!Number.isInteger(data.referenceLabels)||data.referenceLabels<1||data.referenceLabels>1000)throw new Error('Native preparation response mismatch');return data;}catch(error){throw failure('Preparation not verified: '+error.message);}})();
      if(epoch!==this.epoch||!guard())throw new Error('Preparation canceled; already changed preparation may remain visible in ProPresenter');
      return {ok:true,state:chapter?'chapter-prepared-no-output':'prepared-needs-operator-review',reference,translation,...(chapter?{focusVerse,focusVisible:result.focusVisible===true,chapterVerses,fromVerse}:{}),...(chapter&&Array.isArray(result.installed)&&result.installed.length&&result.installed.length<=60&&result.installed.every(n=>typeof n==='string'&&n.length<=80)?{installed:result.installed}:{}),saveCopyRequested:saveCopy,referenceLabels:Number.isInteger(result.referenceLabels)?result.referenceLabels:null,clippingWarning:result.clippingWarning===true,outputRequests:0,workerElapsedMs:Math.round(performance.now()-started),nativeStageStartedAtMs:stageTimes(result.timingsMs),formattingVerified:false,outputObserved:false};
    }finally{this.busy=false;}
  }
}
module.exports={BiblePreparation,nativeFailureDiagnostics};
