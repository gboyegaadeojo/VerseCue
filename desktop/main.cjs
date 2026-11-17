'use strict';
const {app,BrowserWindow,ipcMain,dialog,session,systemPreferences,clipboard}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const {Connector}=require('../core/connector.cjs');
const {Session}=require('../core/session.cjs');
const {LocalSpeech}=require('../core/stt.cjs');
const store=require('../core/settings.cjs');
const {LocalControlAPI}=require('../core/control-api.cjs');
const {BiblePreparation}=require('../core/bible-preparation.cjs');
const {PreparationController}=require('../core/preparation-controller.cjs');
const connector=new Connector();const service=new Session(connector);const speech=new LocalSpeech();
let preparation,preparationController;
async function prepareBible(reference,translation,guard=()=>true){
  if(!preparationController)throw new Error('Preparation controller is not ready');return preparationController.prepare(reference,translation,guard);
}
const privateApi=new LocalControlAPI(service,{onStop:()=>{speech.cancel();preparation?.cancel();connector.arm(false);service.stop();},onPrepare:prepareBible,onRevoke:()=>preparation?.cancel(),onEvent:code=>{service.log(code);service.notify();}});
let settings,settingsFile,mainWindow,compactWindow,healthTimer,healthBusy=false;const windows=new Set();
const ui=pathToFileURL(path.join(__dirname,'../ui/index.html')).href;
function trusted(e){if(!windows.has(BrowserWindow.fromWebContents(e.sender))||e.senderFrame!==e.sender.mainFrame||e.senderFrame.url.split('?')[0]!==ui)throw new Error('Untrusted caller');}
function handler(name,callback){ipcMain.handle(name,async(e,...args)=>{try{trusted(e);return {ok:true,value:await callback(...args)};}catch(error){return {ok:false,error:error.message};}});}
function createWindow(compact=false){
  const win=new BrowserWindow({width:compact?450:1280,height:compact?630:900,minWidth:compact?360:800,minHeight:550,title:'VerseCue',backgroundColor:'#10151d',show:false,alwaysOnTop:compact,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  windows.add(win);win.setMenuBarVisibility(false);win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.on('closed',()=>{windows.delete(win);if(compact)compactWindow=null;});win.once('ready-to-show',()=>win.show());win.loadURL(ui+(compact?'?compact=1':''));return win;
}
function update(){for(const win of windows)if(!win.isDestroyed())win.webContents.send('state-update',service.snapshot());}
service.on('change',update);
async function choose(kind){
  if(speech.busy)throw new Error('Stop recognition before changing speech files');
  const result=await dialog.showOpenDialog(mainWindow,{title:kind==='worker'?'Select trusted whisper-cli executable':'Select local Whisper GGML model',properties:['openFile'],filters:kind==='model'?[{name:'Whisper model',extensions:['bin']}]:[]});
  if(result.canceled)return null;const file=result.filePaths[0];const stat=await fs.stat(file);if(!stat.isFile())throw new Error('Select a file');
  if(kind==='worker')settings.executable=file;else settings.model=file;
  speech.cancel();speech.configure(settings.executable,settings.model,settings.speechMode);await store.save(settingsFile,settings);return settings;
}
async function bootstrap(){
  settingsFile=path.join(app.getPath('userData'),'settings.json');const loaded=await store.load(settingsFile);settings=loaded.settings;
  const helper=app.isPackaged?path.join(process.resourcesPath,'native','VerseCue.BibleBridge.exe'):path.join(__dirname,'../native/bin/VerseCue.BibleBridge.exe');
  let helperExists=false;try{await fs.access(helper);helperExists=true;}catch{}
  preparation=new BiblePreparation({helper:helperExists?helper:null});
  preparationController=new PreparationController({service,connector,speech,preparation,getTranslation:()=>settings.translation});
  // Optional verified offline resources are local development-package assets,
  // not downloaded or executed automatically during startup.
  const speechDir=path.join(process.resourcesPath,'speech');
  const bundledWorker=path.join(speechDir,process.platform==='win32'?'whisper-cli.exe':'whisper-cli');
  if(!settings.executable&&!settings.model){
    try{await fs.access(bundledWorker);await fs.access(path.join(speechDir,'ggml-base.en.bin'));settings.executable=bundledWorker;settings.model=path.join(speechDir,'ggml-base.en.bin');}catch{}
  }
  connector.configure(settings.host,settings.port);service.configure({translation:settings.translation,dryRun:true});speech.configure(settings.executable,settings.model,settings.speechMode);
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
  handler('private-api-status',()=>({...privateApi.status(),nativePreparationAvailable:preparation.available()}));
  handler('private-api-start',async options=>{if(options?.allowPreparation&&!preparation.available())throw new Error('Native preparation is unavailable on this platform/build');return {...await privateApi.start(options),nativePreparationAvailable:preparation.available()};});
  handler('private-api-stop',()=>privateApi.stop());
  handler('private-api-copy-token',()=>{if(!privateApi.accepting||!privateApi.token)throw new Error('Enable the private API first');clipboard.writeText(privateApi.token);return true;});
  handler('save-settings',async value=>{const valid=store.validateSettings(value);speech.cancel();preparation.cancel();if(speech.busy)throw new Error('Recognition is stopping; retry in a moment');settings=await store.save(settingsFile,valid);connector.configure(settings.host,settings.port);speech.configure(settings.executable,settings.model,settings.speechMode);service.configure({translation:settings.translation,dryRun:true});return settings;});
  handler('choose-worker',()=>choose('worker'));handler('choose-model',()=>choose('model'));
  handler('command',async(command,payload)=>{
    switch(command){
      case 'ingest':if(typeof payload?.text!=='string')throw new Error('Invalid reference');return service.ingest(payload.text,{manual:true});
      case 'mode':speech.cancel();preparation.cancel();return service.setMode(payload);
      case 'stop':speech.cancel();preparation.cancel();connector.arm(false);return service.stop();
      case 'resume':preparation.cancel();return service.resume();
      case 'reset':speech.cancel();preparation.cancel();connector.arm(false);return service.reset();
      case 'prepare-bible':if(payload?.acknowledgeFocusChange!==true)throw new Error('Acknowledge experimental preparation and focus change');return prepareBible(payload.reference,settings.translation);
      case 'prepare-candidate':{
        if(payload?.acknowledgeFocusChange!==true)throw new Error('Acknowledge experimental preparation and focus change');
        return preparationController.prepareCandidate(payload.id);
      }
      case 'reject':return service.reject(payload);
      case 'send':return service.send(payload);
      case 'test':try{return await connector.test();}finally{service.notify();}
      case 'map':return connector.prepare(payload);
      case 'dry-run':preparation.cancel();connector.arm(false);service.configure({dryRun:true,translation:settings.translation});return;
      case 'arm':if(payload!==true)throw new Error('Explicit test-target acknowledgment required');if(preparation.busy)throw new Error('Finish or cancel Bible preparation before arming output');connector.arm(true);service.configure({dryRun:false,translation:settings.translation});return;
      default:throw new Error('Unknown command');
    }
  });
  handler('audio',async samples=>{
    if(service.stopped||service.mode==='paused')throw new Error('Listening is paused');const epoch=service.generation;
    const result=await speech.transcribe(samples);
    if(epoch!==service.generation||service.stopped||service.mode==='paused')throw new Error('Stale recognition discarded');
    service.log('STT_WINDOW_COMPLETE','info',{sttWorkerMs:result.elapsedMs});service.ingest(result.text,{authorized:true});return result;
  });
  handler('export-settings',async()=>{const r=await dialog.showSaveDialog(mainWindow,{defaultPath:'VerseCue-settings.json'});if(!r.canceled){const safe={...settings,executable:'',model:'',audioDevice:''};await fs.writeFile(r.filePath,JSON.stringify(safe,null,2));return true;}return false;});
  handler('import-settings',async()=>{const r=await dialog.showOpenDialog(mainWindow,{properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});if(r.canceled)return null;const bytes=await fs.readFile(r.filePaths[0],'utf8');if(bytes.length>16384)throw new Error('Settings file too large');const incoming=store.validateSettings(JSON.parse(bytes));incoming.executable='';incoming.model='';incoming.audioDevice='';speech.cancel();preparation.cancel();if(speech.busy)throw new Error('Stop recognition before import');settings=await store.save(settingsFile,incoming);connector.configure(settings.host,settings.port);speech.configure('','',settings.speechMode);service.reset();service.configure({translation:settings.translation});return settings;});
  handler('export-diagnostics',async()=>{const preview={schemaVersion:1,appVersion:app.getVersion(),platform:process.platform,p0:'PENDING',events:service.events,capabilities:service.snapshot().capabilities};const r=await dialog.showMessageBox(mainWindow,{type:'info',buttons:['Cancel','Save redacted diagnostics'],defaultId:0,message:`Export ${preview.events.length} event codes and times, app/platform versions and capability flags. No references, transcripts, audio, paths or addresses are included.`});if(r.response!==1)return false;const dest=await dialog.showSaveDialog(mainWindow,{defaultPath:'VerseCue-diagnostics.json'});if(!dest.canceled)await fs.writeFile(dest.filePath,JSON.stringify(preview,null,2));return !dest.canceled;});
  handler('compact',()=>{if(compactWindow)compactWindow.focus();else compactWindow=createWindow(true);});
  healthTimer=setInterval(async()=>{
    if(!connector.version||healthBusy)return;healthBusy=true;
    const previous=connector.status.state,version=connector.version.host_description;
    try{
      const result=await connector.test();
      if(result.version!==version){connector.arm(false);connector.mappings.clear();service.setMode('paused');service.log('TARGET_VERSION_CHANGED','warning');}
      else if(previous!=='connected'){connector.arm(false);service.setMode('paused');service.log('LINK_RECOVERED_REARM_REQUIRED','warning');}
    }catch{
      if(previous==='connected'){speech.cancel();connector.arm(false);service.setMode('paused');service.log('LINK_LOST','warning');}
    }finally{healthBusy=false;service.notify();}
  },2000);
  mainWindow=createWindow();
}
if(!app.requestSingleInstanceLock())app.quit();else{
  app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}});
  app.whenReady().then(bootstrap).catch(()=>{dialog.showErrorBox('VerseCue startup','Unable to initialize safe local settings. Check file access and restart.');app.quit();});
  app.on('window-all-closed',()=>app.quit());app.on('before-quit',()=>{clearInterval(healthTimer);speech.cancel();preparation?.cancel();privateApi.stop().catch(()=>{});});
  app.on('web-contents-created',(_event,contents)=>contents.on('will-attach-webview',event=>event.preventDefault()));
}
