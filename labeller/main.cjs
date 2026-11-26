'use strict';
// Recording labeller: a separate developer window (not packaged with VerseCue). A person plays an authorized recording
// and marks each Bible reference as they hear it. It never shows or reads VerseCue's recognized text, and it makes no
// network requests. Labels are saved under ignored test-results/auto-rehearsal/labels/.
const {app,BrowserWindow,ipcMain,dialog,session}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),{createHash}=require('node:crypto');
const labels=require('../core/rehearsal-labels.cjs');
const root=path.resolve(__dirname,'..');
const labelDir=()=>path.resolve(process.env.VERSECUE_LABELLER_DIR||path.join(root,'test-results','auto-rehearsal','labels'));
const labelPath=id=>{if(!labels.isId(id))throw Error('Invalid recording ID');return path.join(labelDir(),id+'.labels.json');};
const suggestId=name=>path.parse(name).name.replace(/[^A-Za-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'recording';
let win=null,recording=null;

async function readExisting(id,audioSha256){
  try{const file=labels.validateLabelFile(JSON.parse(await fs.readFile(labelPath(id),'utf8')));return file.audioSha256===audioSha256?{file,matches:true}:{matches:false};}
  catch(error){if(error.code==='ENOENT')return null;return {matches:false,error:'The saved labels file for this ID could not be read: '+error.message};}
}

ipcMain.handle('labeller:open',async()=>{
  let file=process.env.VERSECUE_LABELLER_RECORDING||null;
  if(!file){const pick=await dialog.showOpenDialog(win,{title:'Open a recording',properties:['openFile'],filters:[{name:'WAV recordings',extensions:['wav']}]});if(pick.canceled||!pick.filePaths[0])return {ok:false,canceled:true};file=pick.filePaths[0];}
  const bytes=await fs.readFile(file),durationSeconds=labels.wavDurationSeconds(bytes);
  if(!durationSeconds)return {ok:false,error:'Open a WAV recording. Convert other formats to WAV (PCM16 mono 16 kHz, the format the rehearsal builder uses) first.'};
  recording={audioSha256:createHash('sha256').update(bytes).digest('hex'),durationSeconds};
  const recordingId=suggestId(path.basename(file));
  return {ok:true,fileName:path.basename(file),recordingId,...recording,existing:await readExisting(recordingId,recording.audioSha256),bytes:new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength)};
});
ipcMain.handle('labeller:existing',async(_e,id)=>{if(!recording||!labels.isId(id))return null;return readExisting(id,recording.audioSha256);});
ipcMain.handle('labeller:check',(_e,text,translation)=>labels.canonicalReference(text,translation));
ipcMain.handle('labeller:save',async(_e,input)=>{
  try{
    if(!recording)throw Error('Open a recording first');
    const text=labels.serialize({...input,schemaVersion:1,kind:'versecue-rehearsal-labels',audioSha256:recording.audioSha256,durationSeconds:recording.durationSeconds});
    const target=labelPath(input.recordingId),existing=await readExisting(input.recordingId,recording.audioSha256);
    if(existing&&!existing.matches)throw Error('A labels file with this ID belongs to a different recording. Choose another recording ID.');
    await fs.mkdir(labelDir(),{recursive:true});const temp=target+'.saving';await fs.writeFile(temp,text,'utf8');await fs.rename(temp,target);
    return {ok:true,path:path.relative(root,target),annotationSha256:labels.annotationSha256(text)};
  }catch(error){return {ok:false,error:error.message};}
});

app.whenReady().then(()=>{
  // Local files and in-memory audio only: refuse every network request.
  session.defaultSession.webRequest.onBeforeRequest((details,done)=>done({cancel:!/^(file|blob|devtools|data):/.test(details.url)}));
  session.defaultSession.setPermissionRequestHandler((_wc,_permission,done)=>done(false));
  win=new BrowserWindow({width:980,height:820,minWidth:720,minHeight:600,title:'VerseCue recording labeller',backgroundColor:'#161618',show:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,sandbox:true,nodeIntegration:false}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',event=>event.preventDefault());
  win.once('ready-to-show',()=>win.show());win.loadFile(path.join(__dirname,'index.html'));
});
app.on('window-all-closed',()=>app.quit());
