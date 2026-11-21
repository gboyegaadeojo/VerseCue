'use strict';
const {app,BrowserWindow,ipcMain,dialog,session,systemPreferences,clipboard,powerSaveBlocker,powerMonitor}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const {Connector}=require('../core/connector.cjs');
const {PreparedCatalog}=require('../core/prepared-catalog.cjs');
const {SavedBibleWorkflow}=require('../core/saved-bible-workflow.cjs');
const {NativeCopyLedger}=require('../core/native-copy-ledger.cjs');
const {ReferencePassages}=require('../core/reference-passages.cjs');
const {PassageCoordinator}=require('../core/passage-coordinator.cjs');
const {ReferencePreparation}=require('../core/reference-preparation.cjs');
const {Session}=require('../core/session.cjs');
const {referenceMetadataVersions}=require('../core/reference-metadata-versions.cjs');
const {LocalSpeech}=require('../core/stt.cjs');
const {speechEvidence}=require('../core/speech-evidence.cjs');
const {CitationStabilizer}=require('../core/citation-stabilizer.cjs');
const store=require('../core/settings.cjs');
const {ConfigurationTransition}=require('../core/configuration-transition.cjs');
const {LocalControlAPI}=require('../core/control-api.cjs');
const {BiblePreparation}=require('../core/bible-preparation.cjs');
const {PreparationController}=require('../core/preparation-controller.cjs');
const {Profiles}=require('../core/profiles.cjs');
const {CaptureLease}=require('../core/capture-lease.cjs');
const {PowerRecovery}=require('../core/power-recovery.cjs');
const {GuardedAuto}=require('../core/guarded-auto.cjs');const {AudioLossPolicy}=require('../core/audio-loss-policy.cjs');const {verifyRelease,loadTrustedKeys}=require('../core/update-verify.cjs');
const connector=new Connector();const catalog=new PreparedCatalog(connector);const service=new Session(connector);const speech=new LocalSpeech();
const citationStabilizer=new CitationStabilizer({onExpire:()=>{service.speechStabilization={state:'expired',reason:'Incomplete reference expired. Repeat the full book, chapter and verse.'};service.notify();}});
function resetSpeechStabilization(){citationStabilizer.reset();service.speechStabilization={state:'idle'};}
const automatic=new GuardedAuto(service);const audioLoss=new AudioLossPolicy();
let nativeCopyLedger=null;
const referencePassages=new ReferencePassages({connector,catalog,getRangeLimit:()=>service.maxPassageVerses,knownClipping:(base,id,fingerprint)=>nativeCopyLedger?.knownClipping(base,id,fingerprint)===true,knownNativeCopy:(base,id,fingerprint)=>nativeCopyLedger?.hasVerifiedCopy(base,id,fingerprint)===true});
let preparation,preparationController,savedBible,passageCoordinator,referencePreparation,reviewOwnerId=null,preparationOwner=null,suspensionBlocker=null;
function updateBackgroundCapture(active){if(active&&suspensionBlocker===null)suspensionBlocker=powerSaveBlocker.start('prevent-app-suspension');if(!active&&suspensionBlocker!==null){powerSaveBlocker.stop(suspensionBlocker);suspensionBlocker=null;}}
const capture=new CaptureLease({canStart:()=>!service.recovery?.required&&!service.stopped&&service.mode!=='paused'&&!speech.busy&&!preparation?.busy&&!savedBible?.busy&&!passageCoordinator?.busy,onStop:()=>{resetSpeechStabilization();automatic.cancel();speech.cancel();updateBackgroundCapture(false);},onChange:value=>{updateBackgroundCapture(value.active);service.capture={...value,backgroundProtected:suspensionBlocker!==null&&powerSaveBlocker.isStarted(suspensionBlocker)};service.notify();}});
function cancelPreparation(){reviewOwnerId=null;referencePreparation?.cancel();if(passageCoordinator)passageCoordinator.cancel();else savedBible?.cancel();preparation?.cancel();}
async function ownedPreparation(event,operation){if(preparationOwner)throw new Error('Another window is preparing a Bible passage');const owner={id:event.sender.id};preparationOwner=owner;try{const result=await operation();if(['review-required','part-shown','readback-matched','auto-approved'].includes(result?.phase))reviewOwnerId=owner.id;return result;}finally{if(preparationOwner===owner)preparationOwner=null;}}
function cancelAudio(){referencePreparation?.configure(false);automatic.cancel();capture.cancel();}
async function prepareBible(reference,translation,guard=()=>true){
  if(!preparationController)throw new Error('Preparation controller is not ready');if(savedBible?.busy||passageCoordinator?.busy)throw new Error('Finish the passage preparation first');return preparationController.prepare(reference,translation,guard);
}
async function reviewApiPassage(id,guard){
  if(!passageCoordinator||!guard())throw Error('Passage review is unavailable or revoked');
  const owner=[...windows].find(win=>!win.isDestroyed()&&capture.owns(win.webContents.id))??mainWindow;
  if(!owner||owner.isDestroyed()||owner.webContents.isDestroyed())throw Error('Open the VerseCue workspace to review a passage');
  automatic.cancel();return ownedPreparation({sender:owner.webContents},()=>passageCoordinator.prepare(id,{additionalGuard:guard}));
}
const privateApi=new LocalControlAPI(service,{onStop:()=>{cancelAudio();cancelPreparation();connector.arm(false);service.stop();},onPrepare:prepareBible,onReview:reviewApiPassage,onRevoke:()=>cancelPreparation(),onEvent:code=>{if(code==='PRIVATE_API_REFERENCE_REVIEW')resetSpeechStabilization();service.log(code);service.notify();}});
const configurationTransition=new ConfigurationTransition({enterSafe:()=>{cancelAudio();cancelPreparation();connector.arm(false);connector.mappings.clear();service.setMode('paused');service.configure({translation:service.translation,dryRun:true});return privateApi.stop();}});
async function changeConfiguration(operation,{restoreMode=true}={}){const previousMode=service.mode==='auto'?'confirm':service.mode;return configurationTransition.run(async()=>{const result=await operation();service.settingsRecoveryRequired=false;service.notify();if(restoreMode&&!service.stopped&&!service.recovery?.required&&service.mode==='paused')service.setMode(previousMode);return result;});}
let settings,settingsFile,profiles,mainWindow,compactWindow,healthTimer,healthBusy=false;const windows=new Set();
const ui=pathToFileURL(path.join(__dirname,'../ui/index.html')).href;
function trusted(e){if(!windows.has(BrowserWindow.fromWebContents(e.sender))||e.senderFrame!==e.sender.mainFrame||e.senderFrame.url.split('?')[0]!==ui)throw new Error('Untrusted caller');}
// NR-010: saved Auto start preference and hold window. Start mode applies only at launch/reset (Session.applyStartMode).
function applySessionPreferences(){automatic.configureDelay(settings.autoHoldMs);service.startMode=settings.startMode;}
function handler(name,callback,{withEvent=false}={}){ipcMain.handle(name,async(e,...args)=>{try{trusted(e);if(configurationTransition.busy&&!['state','settings','quote-status','private-api-status','profiles-list','window-identity','audio-stop','private-api-stop','command'].includes(name))throw Error('Settings are changing; wait for setup to finish');return {ok:true,value:await callback(...(withEvent?[e,...args]:args))};}catch(error){return {ok:false,error:error.message};}});}
function createWindow(compact=false){
  const win=new BrowserWindow({width:compact?450:1280,height:compact?630:900,minWidth:compact?360:800,minHeight:550,title:'VerseCue',backgroundColor:'#10151d',show:false,alwaysOnTop:compact,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:false}});
  windows.add(win);win.setMenuBarVisibility(false);win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());const captureOwnerId=win.webContents.id;
  const releaseUnavailableOwner=code=>{const approved=[...connector.mappings].filter(([,map])=>map.autoApproval===true&&map.ownerId===captureOwnerId);if(!capture.owns(captureOwnerId)&&preparationOwner?.id!==captureOwnerId&&reviewOwnerId!==captureOwnerId&&!referencePreparation?.owns(captureOwnerId)&&!approved.length)return;for(const [key]of approved)connector.mappings.delete(key);cancelAudio();cancelPreparation();privateApi.stop().catch(()=>{});connector.arm(false);service.setMode('paused');service.log(code,'warning');service.notify();};
  win.webContents.on('render-process-gone',()=>releaseUnavailableOwner('AUDIO_OWNER_RENDERER_GONE'));
  win.webContents.on('did-start-navigation',details=>{if(details.isMainFrame)releaseUnavailableOwner('AUDIO_OWNER_RELOADED');});
  win.on('closed',()=>{releaseUnavailableOwner('AUDIO_OWNER_CLOSED');windows.delete(win);if(compact)compactWindow=null;});win.once('ready-to-show',()=>win.show());win.loadURL(ui+(compact?'?compact=1':''));return win;
}
let enforcingSafeCapture=false;
function update(){if(referencePreparation)service.referencePreparation=referencePreparation.status();if(!enforcingSafeCapture&&capture.snapshot().active&&(service.stopped||service.mode==='paused'||service.recovery?.required||(capture.purpose==='input-test'&&(!service.dryRun||service.mode!=='suggest')))){enforcingSafeCapture=true;try{cancelAudio();}finally{enforcingSafeCapture=false;}}for(const win of windows)if(!win.isDestroyed())win.webContents.send('state-update',service.snapshot());}
service.on('change',update);
async function choose(kind){
  if(speech.busy)throw new Error('Stop recognition before changing speech files');
  const result=await dialog.showOpenDialog(mainWindow,{title:kind==='worker'?'Select trusted whisper-cli executable':'Select local Whisper GGML model',properties:['openFile'],filters:kind==='model'?[{name:'Whisper model',extensions:['bin']}]:[]});
  if(result.canceled)return null;const file=result.filePaths[0];const stat=await fs.stat(file);if(!stat.isFile())throw new Error('Select a file');
  return changeConfiguration(async()=>{if(speech.busy)throw Error('Recognition is stopping; retry in a moment');const next={...settings,[kind==='worker'?'executable':'model']:file};settings=await store.save(settingsFile,next);speech.configure(settings.executable,settings.model,settings.speechMode);return settings;});
}
async function bootstrap(){
  await fs.mkdir(app.getPath('userData'),{recursive:true});await speech.initializeScratch(path.join(app.getPath('userData'),'speech-scratch'));
  settingsFile=path.join(app.getPath('userData'),'settings.json');const loaded=await store.load(settingsFile);settings=loaded.settings;service.settingsRecoveryRequired=loaded.recovered;
  profiles=new Profiles(path.join(app.getPath('userData'),'profiles.json'));
  const helper=app.isPackaged?path.join(process.resourcesPath,'native','VerseCue.BibleBridge.exe'):path.join(__dirname,'../native/bin/VerseCue.BibleBridge.exe');
  let helperExists=false;try{await fs.access(helper);helperExists=true;}catch{}
  preparation=new BiblePreparation({helper:helperExists?helper:null});
  preparationController=new PreparationController({service,connector,speech:{cancel:cancelAudio},cancelRecognition:()=>{resetSpeechStabilization();speech.cancel();},preparation,getTranslation:()=>settings.translation});
  nativeCopyLedger=new NativeCopyLedger(path.join(app.getPath('userData'),'native-copy-ledger.json'));await nativeCopyLedger.load();
  if(nativeCopyLedger.failure)service.log('NATIVE_COPY_LEDGER_UNVERIFIED','warning');
  savedBible=new SavedBibleWorkflow({service,connector,catalog,controller:preparationController,ledger:nativeCopyLedger,onPreparedCopy:receipt=>referencePassages.rememberNativeCopy(receipt),onUncertain:()=>referencePreparation?.revokeNative()});
  passageCoordinator=new PassageCoordinator({service,connector,resolver:referencePassages,savedBible,onChange:value=>{service.passagePreparation=value;service.notify();}});
  referencePreparation=new ReferencePreparation({service,coordinator:passageCoordinator,nativeReadiness:()=>savedBible.readiness(),canPrepare:()=>!preparationOwner&&!passageCoordinator.busy&&!savedBible.busy&&!preparation.busy&&!service.busy&&!service.operationOwner,prepare:(id,event,options)=>ownedPreparation(event,()=>passageCoordinator.prepare(id,options)),onChange:value=>{service.referencePreparation=value;service.notify();}});
  if(nativeCopyLedger.status().uncertainReservations>0)referencePreparation.revokeNative();
  const recovery=new PowerRecovery({service,connector,cancelAudio,cancelPreparation:()=>cancelPreparation(),revokeApi:()=>privateApi.stop(),getTarget:()=>settings});
  powerMonitor.on('suspend',()=>recovery.handle('suspend'));powerMonitor.on('resume',()=>recovery.handle('resume'));
  // Optional verified offline resources are local development-package assets,
  // not downloaded or executed automatically during startup.
  const speechDir=path.join(process.resourcesPath,'speech');
  const bundledWorker=path.join(speechDir,process.platform==='win32'?'whisper-cli.exe':'whisper-cli');
  if(!settings.executable&&!settings.model){
    try{await fs.access(bundledWorker);await fs.access(path.join(speechDir,'ggml-base.en.bin'));settings.executable=bundledWorker;settings.model=path.join(speechDir,'ggml-base.en.bin');}catch{}
  }
  connector.configure(settings.host,settings.port);service.configure({translation:settings.translation,dryRun:true,duplicateCooldownSeconds:settings.duplicateCooldownSeconds,maxPassageVerses:settings.maxPassageVerses});applySessionPreferences();speech.configure(settings.executable,settings.model,settings.speechMode);if(!service.settingsRecoveryRequired)service.applyStartMode();
  if(loaded.recovered)service.log('CORRUPT_SETTINGS_RECOVERED','warning');
  session.defaultSession.setPermissionRequestHandler(async(webContents,permission,callback,details)=>{
    const win=BrowserWindow.fromWebContents(webContents);const local=windows.has(win)&&webContents.getURL().split('?')[0]===ui;
    if(!local||permission!=='media'||!details.mediaTypes?.includes('audio')||details.mediaTypes.includes('video'))return callback(false);
    if(process.platform==='darwin')return callback(await systemPreferences.askForMediaAccess('microphone'));callback(true);
  });
  session.defaultSession.setPermissionCheckHandler((webContents,permission,origin,details)=>windows.has(BrowserWindow.fromWebContents(webContents))&&webContents?.getURL().split('?')[0]===ui&&permission==='media'&&details.mediaType==='audio');
  // Renderer needs local assets only. All ProPresenter traffic is mediated by the core.
  session.defaultSession.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!details.url.startsWith('file://')&&!details.url.startsWith('devtools://')}));
  handler('state',()=>service.snapshot());handler('settings',()=>settings);
  handler('settings-backups',()=>store.backups(settingsFile));
  handler('restore-settings-backup',options=>{if(options?.acknowledged!==true)throw Error('Review and acknowledge the saved setup before restoring');return changeConfiguration(async()=>{if(speech.busy)throw Error('Recognition is stopping; retry in a moment');settings=await store.restore(settingsFile,{slot:options.slot,fingerprint:options.fingerprint});connector.configure(settings.host,settings.port);speech.configure(settings.executable,settings.model,settings.speechMode);service.configure({translation:settings.translation,dryRun:true,duplicateCooldownSeconds:settings.duplicateCooldownSeconds,maxPassageVerses:settings.maxPassageVerses});applySessionPreferences();service.log('SETTINGS_BACKUP_RESTORED');return settings;},{restoreMode:false});});
  handler('quote-status',()=>service.quoteStatus());
  handler('quote-enable',enabled=>service.enableQuotes(enabled));
  handler('quote-import',async options=>{
    if(options?.rightsAcknowledged!==true)throw new Error('Acknowledge permission to use this local passage text');
    const result=await dialog.showOpenDialog(mainWindow,{title:'Import a local, rights-cleared passage index',properties:['openFile'],filters:[{name:'Passage index JSON',extensions:['json']}]});if(result.canceled)return service.quoteStatus();
    const file=result.filePaths[0],stat=await fs.stat(file);if(!stat.isFile()||stat.size>16000000)throw new Error('Quote index must be a JSON file of at most 16 MB');
    const bytes=await fs.readFile(file,'utf8');if(bytes.length>16000000)throw new Error('Quote index too large');return service.loadQuoteIndex(JSON.parse(bytes.replace(/^\uFEFF/,'')),true);
  });
  handler('window-identity',event=>({id:event.sender.id}),{withEvent:true});
  handler('audio-start',(event,options)=>{
    const purpose=options?.purpose??'recognition';
    if(purpose==='input-test'){if(options?.authorized!==true)throw Error('Explicit authorization for the selected feed is required');if(capture.snapshot().active||!capture.canStart())throw Error('Stop existing capture and finish preparation before testing input');if(!service.dryRun||service.mode==='auto')throw Error('Return to dry run before testing the input');service.setMode('suggest');}
    return capture.acquire(event.sender.id,options?.authorized,purpose);
  },{withEvent:true});
  handler('audio-stop',event=>capture.release(event.sender.id),{withEvent:true});
  handler('profiles-list',()=>profiles.list());
  handler('profiles-save',name=>profiles.save(name,settings));
  handler('profiles-remove',id=>profiles.remove(id));
  handler('profiles-load',id=>changeConfiguration(async()=>{
    if(speech.busy)throw new Error('Recognition is stopping; retry profile load in a moment');
    const incoming=await profiles.get(id);incoming.startMode=settings.startMode;settings=await store.save(settingsFile,incoming);connector.configure(settings.host,settings.port);speech.configure(settings.executable,settings.model,settings.speechMode);service.configure({translation:settings.translation,dryRun:true,duplicateCooldownSeconds:settings.duplicateCooldownSeconds,maxPassageVerses:settings.maxPassageVerses});applySessionPreferences();return settings;
  },{restoreMode:false}));
  handler('private-api-status',()=>({...privateApi.status(),nativePreparationAvailable:preparation.available()}));
  handler('private-api-start',async options=>{if(options?.allowPreparation&&!preparation.available())throw new Error('Native preparation is unavailable on this platform/build');return {...await privateApi.start(options),nativePreparationAvailable:preparation.available()};});
  handler('private-api-stop',()=>privateApi.stop());
  handler('private-api-copy-token',()=>{if(!privateApi.accepting||!privateApi.token)throw new Error('Enable the private API first');clipboard.writeText(privateApi.token);return true;});
  handler('save-settings',value=>{const valid=store.validateSettings(value);return changeConfiguration(async()=>{if(speech.busy)throw new Error('Recognition is stopping; retry in a moment');settings=await store.save(settingsFile,valid);connector.configure(settings.host,settings.port);speech.configure(settings.executable,settings.model,settings.speechMode);service.configure({translation:settings.translation,dryRun:true,duplicateCooldownSeconds:settings.duplicateCooldownSeconds,maxPassageVerses:settings.maxPassageVerses});applySessionPreferences();return settings;});});
  handler('choose-worker',()=>choose('worker'));handler('choose-model',()=>choose('model'));
  handler('command',async(event,command,payload)=>{
    if(configurationTransition.busy&&!['stop','reset'].includes(command))throw Error('Settings are changing; wait for setup to finish');
    switch(command){
      case 'ingest':{if(typeof payload?.text!=='string')throw new Error('Invalid reference');resetSpeechStabilization();if(preparation.busy||savedBible?.busy||passageCoordinator?.busy||passageCoordinator?.review||passageCoordinator?.active)cancelPreparation();const candidates=await service.ingestChecked(payload.text,{manual:true});referencePreparation.consider(candidates,event);return candidates;}
      case 'audio-loss':{if(!capture.owns(event.sender.id)||!['overflow','stale','clipping','capture-gap'].includes(payload?.reason)||!Number.isSafeInteger(payload.samples)||payload.samples<1)throw Error('Invalid audio discontinuity');resetSpeechStabilization();automatic.cancel();cancelPreparation();service.invalidate();if(service.mode==='auto'){const loss=audioLoss.record(service.clock());if(loss.pauseAuto){connector.arm(false);service.setMode('paused');service.log('AUTO_PAUSED_PERSISTENT_AUDIO_LOSS','warning');}else service.autoStatus={state:'review',reason:'Audio was dropped. Auto continues with the next complete reference heard without loss.'};}service.log('AUDIO_LOSS_CONTEXT_RESET','warning');service.notify();return true;}
      case 'reference-preparation':if(service.stopped||service.recovery?.required)throw Error('Resume Confirm before enabling preparation');return referencePreparation.configure(payload,event.sender.id);
      case 'reconcile-native-copies':return ownedPreparation(event,async()=>{
        if(service.busy||service.operationOwner||service.stopped||service.recovery?.required)throw Error('Resume Confirm and finish pending operations before checking managed copies');
        const owner={},target=connector.generation,base=connector.base,generation=service.generation,deadline=performance.now()+8000;nativeCopyLedger.targetKey(base);service.operationOwner=owner;
        const valid=()=>!event.sender.isDestroyed()&&connector.generation===target&&connector.base===base&&service.generation===generation&&!service.stopped&&!service.recovery?.required&&performance.now()<deadline;
        const check=()=>{if(!valid())throw Error('Managed-copy catalog check canceled or expired');};
        try{const libraries=await catalog.libraries();check();if(libraries.length>10)throw Error('Too many libraries for a complete bounded copy check');const ids=new Set();for(const library of libraries){const rows=await catalog.presentations(library.uuid);check();if(rows.length>1000)throw Error('Library exceeds the bounded managed-copy check');for(const row of rows)ids.add(row.uuid);}check();const result=await nativeCopyLedger.reconcile(base,ids,valid);service.log('NATIVE_COPY_LEDGER_RECONCILED');return result;}
        finally{if(service.operationOwner===owner)service.operationOwner=null;service.notify();}
      });
      case 'mode':cancelAudio();cancelPreparation();return service.setMode(payload);
      case 'enable-auto':audioLoss.reset();if(preparation.busy||savedBible?.busy||passageCoordinator?.busy)throw new Error('Finish Bible preparation before enabling Auto');referencePreparation.configure(false);resetSpeechStabilization();automatic.cancel();speech.cancel();return service.enableAuto({acknowledged:payload?.acknowledged===true,citationPolicy:payload?.citationPolicy??'explicit-command',acknowledgeBareCitations:payload?.acknowledgeBareCitations===true,ownerId:event.sender.id});
      case 'stop':cancelAudio();cancelPreparation();connector.arm(false);return service.stop();
      case 'resume':cancelPreparation();return service.resume();
      case 'reset':audioLoss.reset();cancelAudio();cancelPreparation();connector.arm(false);return service.reset();
      case 'hold-auto':return automatic.hold();
      case 'prepare-bible':if(payload?.acknowledgeFocusChange!==true)throw new Error('Acknowledge experimental preparation and focus change');return ownedPreparation(event,()=>prepareBible(payload.reference,settings.translation));
      case 'prepare-save-candidate':{
        if(payload?.acknowledgeFocusChange!==true||payload?.acknowledgeCreateCopy!==true)throw new Error('Acknowledge focus changes and creation of a saved Bible copy');
        return ownedPreparation(event,()=>savedBible.prepareCandidate(payload.id,{libraryId:payload.libraryId??null}));
      }
      case 'prepare-candidate':{
        if(payload?.acknowledgeFocusChange!==true)throw new Error('Acknowledge experimental preparation and focus change');
        if(savedBible?.busy)throw new Error('Finish the saved-copy preparation first');
        return ownedPreparation(event,()=>preparationController.prepareCandidate(payload.id));
      }
      case 'reject':cancelPreparation();return service.reject(payload);
      case 'navigate':cancelPreparation();return service.navigate(payload?.id,payload?.direction);
      case 'send':return service.send(payload);
      case 'test':try{return await connector.test();}finally{service.notify();}
      case 'cancel-passage-preparation':cancelPreparation();return true;
      case 'advance-passage':automatic.cancel();return ownedPreparation(event,()=>passageCoordinator.advance(payload?.activeToken));
      case 'passage-thumbnail':return passageCoordinator.thumbnail(payload?.reviewToken,payload?.partIndex);
      case 'rebuild-clipped-passage':automatic.cancel();return ownedPreparation(event,()=>passageCoordinator.rebuildClipped(payload?.reviewToken,{formattingCorrected:payload?.formattingCorrected===true,acknowledgeFocusChange:payload?.acknowledgeFocusChange===true,acknowledgeCreateCopy:payload?.acknowledgeCreateCopy===true}));
      case 'confirm-passage':automatic.cancel();return ownedPreparation(event,()=>passageCoordinator.confirm(payload?.reviewToken,{verified:payload?.verified===true,acknowledgeTestOutput:payload?.acknowledgeTestOutput===true}));
      case 'approve-passage-auto':if(referencePreparation.status().running)throw Error('Wait for detected preparation to finish before approving Auto');referencePreparation.configure(false);automatic.cancel();return ownedPreparation(event,()=>passageCoordinator.approveAuto(payload?.reviewToken,{verified:payload?.verified===true,acknowledgeTestOutput:payload?.acknowledgeTestOutput===true,acknowledgeAuto:payload?.acknowledgeAuto===true,ownerId:event.sender.id}));
      case 'prepare-passage-candidate':automatic.cancel();return ownedPreparation(event,()=>passageCoordinator.prepare(payload?.id,{acknowledgeFocusChange:payload?.acknowledgeFocusChange===true,acknowledgeCreateCopy:payload?.acknowledgeCreateCopy===true,selectedUuid:payload?.selectedUuid??null,expectedFingerprint:payload?.expectedFingerprint??null}));
      case 'resolve-candidate':return referencePassages.findCandidate(service,payload?.id);
      case 'catalog-libraries':return catalog.libraries();
      case 'catalog-presentations':return catalog.presentations(payload);
      case 'catalog-cues':return catalog.cues(payload);
      case 'map':return connector.prepare(payload);
      case 'dry-run':cancelPreparation();connector.arm(false);service.configure({dryRun:true,translation:settings.translation});return;
      case 'arm':if(service.recovery?.required)throw new Error('Complete wake connection preflight and resume first');if(payload!==true)throw new Error('Explicit test-target acknowledgment required');if(preparation.busy||savedBible?.busy)throw new Error('Finish or cancel Bible preparation before arming output');connector.arm(true);service.configure({dryRun:false,translation:settings.translation});return;
      default:throw new Error('Unknown command');
    }
  },{withEvent:true});
  handler('audio',async(event,samples,metadata)=>{
    if(!capture.owns(event.sender.id))throw new Error('This window does not own an authorized audio session');
    if(capture.purpose!=='recognition')throw Error('Input test is meter-only; recognition is disabled');
    if(service.stopped||service.mode==='paused')throw new Error('Listening is paused');const epoch=service.generation,receivedAt=service.clock(),leaseEpoch=capture.epoch;
    const sameLease=()=>capture.epoch===leaseEpoch&&capture.owns(event.sender.id);
    const stillAuthorized=()=>sameLease()&&epoch===service.generation&&!service.stopped&&service.mode!=='paused';
    const result=await speech.transcribe(samples);
    if(!stillAuthorized())throw new Error('Stale recognition discarded');
    const evidence=speechEvidence(metadata,samples.length,receivedAt,service.clock());
    const stabilized=citationStabilizer.feed({text:result.text,final:result.final,metadata,evidence,receivedAt,now:service.clock(),scope:`${event.sender.id}/${service.referenceEpoch??0}/${service.mode}/${service.maxPassageVerses}`,translation:service.translation,maxVerses:service.maxPassageVerses});
    if(stabilized.suppress){
      if(stabilized.state==='duplicate')return {...result,text:'',discarded:true,reason:'Duplicate recognition window discarded.'};
      automatic.cancel();cancelPreparation();service.invalidate();service.speechStabilization={state:stabilized.state,reason:stabilized.reason};service.notify();return evidence.stale?{...result,text:'',discarded:true,reason:'Audio evidence expired during recognition. Repeat the full reference.'}:{...result,stabilization:service.speechStabilization};
    }
    service.speechStabilization={state:stabilized.assembled?'assembled':'idle',...(stabilized.assembled?{fragmentCount:stabilized.fragmentCount,reason:'Reference assembled from adjacent speech windows. Review before showing.'}:{})};
    if(!evidence.contextUsable){service.context=null;service.queue=[];automatic.cancel();if(passageCoordinator?.review||passageCoordinator?.busy)cancelPreparation();}
    service.log('STT_WINDOW_COMPLETE','info',{sttWorkerMs:result.elapsedMs});const candidates=await service.ingestChecked(stabilized.text,{authorized:true,...(evidence.windowId?{id:evidence.windowId}:{}),sourceAgeMs:stabilized.sourceAgeMs,additionalGuard:stillAuthorized});
    if(!sameLease())throw new Error('Stale recognition discarded');
    if(stabilized.assembled)for(const candidate of candidates){candidate.phrase=stabilized.sourcePhrase;candidate.reference.autoEligible=false;candidate.issues.push('Assembled from adjacent speech windows; confirm the complete reference.');candidate.stabilization={fragmentCount:stabilized.fragmentCount};}
    if(candidates.length&&(passageCoordinator?.active||passageCoordinator?.review||passageCoordinator?.busy))cancelPreparation();
    if(!evidence.timingKnown||!evidence.lossFree)for(const candidate of candidates)candidate.issues.push(!evidence.timingKnown?'Original audio timing is unavailable; review this full reference.':'Audio was dropped, clipped or its quality is unknown; review the full reference before continuing.');
    referencePreparation.consider(candidates,event);automatic.consider(candidates,{source:'local-speech',final:result.final===true,elapsedMs:result.elapsedMs,endEvidence:evidence.endEvidence,droppedSamples:metadata?.droppedSamples,endAgeMs:evidence.endAgeMs,observedAt:evidence.receivedAt});service.notify();return evidence.stale?{...result,text:'',discarded:true,reason:'Audio evidence expired during recognition. Repeat the full reference.'}:result;
  },{withEvent:true});
  // Display-only preview of a still-growing window. It never reaches the stabilizer, candidates, Auto, preparation or output.
  handler('audio-provisional',async(event,samples)=>{
    if(!capture.owns(event.sender.id))throw new Error('This window does not own an authorized audio session');
    if(capture.purpose!=='recognition')throw Error('Input test is meter-only; recognition is disabled');
    if(service.stopped||service.mode==='paused')throw new Error('Listening is paused');const epoch=service.generation,leaseEpoch=capture.epoch;
    const result=await speech.transcribeProvisional(samples);
    if(capture.epoch!==leaseEpoch||!capture.owns(event.sender.id)||epoch!==service.generation||service.stopped||service.mode==='paused')throw new Error('Stale provisional speech discarded');
    return {text:String(result.text).trim().slice(0,500),final:false,elapsedMs:result.elapsedMs};
  },{withEvent:true});
  // FR-060 manual signed updates: verify only, never install, and only outside a service.
  handler('check-update',async()=>{
    if(capture.snapshot().active||!service.dryRun||connector.armed)throw Error('Update checks wait until the service ends: stop listening and return to dry run.');
    const keys=await loadTrustedKeys(path.join(app.getAppPath(),'legal','update-keys'));
    if(!keys.length)return {valid:false,reason:'No trusted update key is installed in this build. IFC must add its public signing key before releases can be verified.'};
    const pick=await dialog.showOpenDialog(mainWindow,{properties:['openFile'],filters:[{name:'VerseCue release',extensions:['zip']}]});if(pick.canceled||!pick.filePaths[0])return null;
    const file=pick.filePaths[0];let signed;try{const text=await fs.readFile(file+'.sig.json','utf8');if(text.length>16384)throw Error('oversized');signed=JSON.parse(text);}catch{return {valid:false,reason:'The matching .sig.json signature file was not found or could not be read next to the release.'};}
    try{return await verifyRelease(file,signed,keys,app.getVersion());}catch(error){if(error.code==='UPDATE_REJECTED')return {valid:false,reason:error.message};throw error;}
  });  handler('export-settings',async()=>{const r=await dialog.showSaveDialog(mainWindow,{defaultPath:'VerseCue-settings.json'});if(!r.canceled){const safe={...settings,executable:'',model:'',audioDevice:''};await fs.writeFile(r.filePath,JSON.stringify(safe,null,2));return true;}return false;});
  handler('import-settings',async()=>{const r=await dialog.showOpenDialog(mainWindow,{properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return null;const bytes=await fs.readFile(r.filePaths[0],'utf8');if(bytes.length>16384)throw new Error('Settings file too large');const incoming=store.validateSettings(JSON.parse(bytes));incoming.executable='';incoming.startMode=settings.startMode;incoming.model='';incoming.audioDevice='';return changeConfiguration(async()=>{if(speech.busy)throw new Error('Stop recognition before import');settings=await store.save(settingsFile,incoming);connector.configure(settings.host,settings.port);speech.configure('','',settings.speechMode);service.configure({translation:settings.translation,dryRun:true,duplicateCooldownSeconds:settings.duplicateCooldownSeconds,maxPassageVerses:settings.maxPassageVerses});applySessionPreferences();return settings;});});
  handler('export-diagnostics',async()=>{const preview={schemaVersion:1,appVersion:app.getVersion(),referenceMetadata:referenceMetadataVersions(),platform:process.platform,p0:'PENDING',events:service.events,capabilities:service.snapshot().capabilities};const r=await dialog.showMessageBox(mainWindow,{type:'info',buttons:['Cancel','Save redacted diagnostics'],defaultId:0,message:`Export ${preview.events.length} event codes and times, app/platform and reference dictionary/versification versions, and capability flags. No references, transcripts, audio, paths or addresses are included.`});if(r.response!==1)return false;const dest=await dialog.showSaveDialog(mainWindow,{defaultPath:'VerseCue-diagnostics.json'});if(!dest.canceled)await fs.writeFile(dest.filePath,JSON.stringify(preview,null,2));return !dest.canceled;});
  handler('compact',()=>{if(compactWindow)compactWindow.focus();else compactWindow=createWindow(true);});
  healthTimer=setInterval(async()=>{
    if(!connector.version||healthBusy)return;healthBusy=true;
    const previous=connector.status.state,version=connector.version.host_description,targetGeneration=connector.generation;
    try{
      const result=await connector.test();
      if(targetGeneration!==connector.generation)return;
      if(result.version!==version){cancelAudio();cancelPreparation();connector.arm(false);connector.mappings.clear();service.setMode('paused');service.log('TARGET_VERSION_CHANGED','warning');}
      else if(previous!=='connected'){cancelAudio();cancelPreparation();connector.arm(false);service.setMode('paused');service.log('LINK_RECOVERED_REARM_REQUIRED','warning');}
      else if(await passageCoordinator.checkOwnership()){reviewOwnerId=null;cancelAudio();}
    }catch{
      if(targetGeneration===connector.generation&&previous==='connected'){cancelAudio();connector.arm(false);service.setMode('paused');service.log('LINK_LOST','warning');}
    }finally{healthBusy=false;service.notify();}
  },2000);
  mainWindow=createWindow();
}
if(!app.requestSingleInstanceLock())app.quit();else{
  app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}});
  app.whenReady().then(bootstrap).catch(()=>{dialog.showErrorBox('VerseCue startup','Unable to initialize safe local settings. Check file access and restart.');app.quit();});
  app.on('window-all-closed',()=>app.quit());app.on('before-quit',()=>{clearInterval(healthTimer);cancelAudio();cancelPreparation();privateApi.stop().catch(()=>{});});
  app.on('web-contents-created',(_event,contents)=>contents.on('will-attach-webview',event=>event.preventDefault()));
}
