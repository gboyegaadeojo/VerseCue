'use strict';
// Guided NVIDIA (CUDA) speech engine setup. VerseCue never downloads or redistributes NVIDIA files:
// the operator downloads the two official archives, VerseCue checks their pinned SHA-256 digests,
// unpacks them into its own app folder and selects the CUDA whisper-cli.
const fs=require('node:fs');const fsp=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const {spawn}=require('node:child_process');

const OFFICIAL={
  whisper:{label:'whisper.cpp b5454 CUDA 11.8 build (x64)',page:'https://github.com/ggml-org/whisper.cpp/releases/tag/b5454',sha256:'e81c86c542be6e3d7b7245392d4e1c52ab6e5c61dbe38721754bc0ab59d4d027'},
  cublas:{label:'NVIDIA cuBLAS 11.11.3.6 for Windows x64',page:'https://developer.download.nvidia.com/compute/cuda/redist/libcublas/windows-x86_64/libcublas-windows-x86_64-11.11.3.6-archive.zip',sha256:'67b0934a6359e4ee26fff823c356021589d392c4fd49ca12624f570edc08e2b9'}
};
const ENGINE_FOLDER='whisper-b5454-cuda-11.8.0';
const REQUIRED=['whisper-cli.exe','whisper-server.exe','ggml-cuda.dll','cudart64_110.dll','cublas64_11.dll','cublasLt64_11.dll'];

function sha256(file){return new Promise((resolve,reject)=>{const hash=crypto.createHash('sha256');fs.createReadStream(file).on('error',reject).on('data',chunk=>hash.update(chunk)).on('end',()=>resolve(hash.digest('hex')));});}
function extract(tar,zip,dest){return new Promise((resolve,reject)=>{const child=spawn(tar,['-xf',zip,'-C',dest],{windowsHide:true,shell:false,stdio:['ignore','ignore','pipe']});let err='';child.stderr.on('data',b=>{err=(err+b).slice(-2000);});child.once('error',()=>reject(Error('Could not unpack the archive')));child.once('close',code=>code===0?resolve():reject(Error('Could not unpack the archive'+(err?': '+err.trim().split('\n').pop():''))));});}
async function find(dir,name,depth=0){if(depth>6)return null;for(const entry of await fsp.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isFile()&&entry.name.toLowerCase()===name.toLowerCase())return full;if(entry.isDirectory()&&!entry.isSymbolicLink()){const hit=await find(full,name,depth+1);if(hit)return hit;}}return null;}

// Identify each chosen archive by its digest, so the order and file names the operator chose do not matter.
async function identify(files,official=OFFICIAL){
  if(!Array.isArray(files)||files.length!==2)throw Error('Choose both official archives: the whisper.cpp CUDA build and NVIDIA cuBLAS');
  const found={};for(const file of files){const digest=await sha256(file);const kind=Object.keys(official).find(key=>official[key].sha256===digest);if(!kind)throw Error(path.basename(file)+' is not one of the two expected official archives (its SHA-256 does not match)');found[kind]=file;}
  if(!found.whisper||!found.cublas)throw Error('Choose one whisper.cpp CUDA archive and one cuBLAS archive');
  return found;
}

async function installCudaEngine(files,{root,tar=path.join(process.env.SystemRoot||'C:\\Windows','System32','tar.exe'),official=OFFICIAL,platform=process.platform}={}){
  if(platform!=='win32')throw Error('The NVIDIA engine is for Windows PCs; Macs use the bundled Metal engine');
  if(typeof root!=='string'||!path.isAbsolute(root))throw Error('Invalid engine folder');
  const found=await identify(files,official);
  const target=path.join(root,ENGINE_FOLDER),staging=path.join(root,ENGINE_FOLDER+'.staging-'+crypto.randomBytes(4).toString('hex'));
  await fsp.mkdir(path.join(staging,'whisper'),{recursive:true});await fsp.mkdir(path.join(staging,'cublas'),{recursive:true});
  try{
    await extract(tar,found.whisper,path.join(staging,'whisper'));await extract(tar,found.cublas,path.join(staging,'cublas'));
    const cli=await find(path.join(staging,'whisper'),'whisper-cli.exe');if(!cli)throw Error('whisper-cli.exe was not found in the whisper.cpp archive');
    const bin=path.dirname(cli);
    for(const dll of ['cublas64_11.dll','cublasLt64_11.dll']){const source=await find(path.join(staging,'cublas'),dll);if(!source)throw Error(dll+' was not found in the cuBLAS archive');await fsp.copyFile(source,path.join(bin,dll));}
    for(const name of REQUIRED)if(!fs.existsSync(path.join(bin,name)))throw Error(name+' is missing after unpacking');
    await fsp.rm(target,{recursive:true,force:true});await fsp.rename(bin,target);
    const receipt={schemaVersion:1,installedAt:new Date().toISOString(),sources:Object.fromEntries(Object.entries(official).map(([k,v])=>[k,{label:v.label,sha256:v.sha256}])),note:'Unpacked from official archives chosen by the operator. Not redistributed by VerseCue.'};
    await fsp.writeFile(path.join(target,'versecue-engine.json'),JSON.stringify(receipt,null,2));
    return {executable:path.join(target,'whisper-cli.exe'),folder:target};
  }finally{await fsp.rm(staging,{recursive:true,force:true}).catch(()=>{});}
}
// Run one second of silence through the engine and read which backend it loaded.
// The first run compiles the card's kernels (about a minute once), which also warms it up for the service.
function checkCudaEngine(executable,model,{timeoutMs=150000,spawnImpl=spawn}={}){
  return new Promise(async(resolve)=>{
    let file;try{const {wav}=require('./stt.cjs');file=path.join(path.dirname(executable),'versecue-check.wav');await fsp.writeFile(file,wav(new Array(16000).fill(0)));}catch{return resolve({ok:false,reason:'VerseCue could not prepare the graphics card check.'});}
    const started=Date.now();let err='',timedOut=false;
    const child=spawnImpl(executable,['-m',model,'-f',file,'-l','en','-t','4','-bs','1','-bo','1','-nt'],{windowsHide:true,shell:false,stdio:['ignore','ignore','pipe']});
    const timer=setTimeout(()=>{timedOut=true;child.kill();},timeoutMs);
    child.stderr.on('data',b=>{err=(err+b).slice(-20000);});
    const done=async result=>{clearTimeout(timer);await fsp.rm(file,{force:true}).catch(()=>{});resolve({...result,elapsedMs:Date.now()-started});};
    child.once('error',()=>done({ok:false,reason:'The NVIDIA engine could not start. Windows may have blocked it, or a file is missing.'}));
    child.once('close',code=>{
      const devices=Number(/found (\d+) CUDA devices?/i.exec(err)?.[1]??0),name=/Device 0: ([^,\r\n]+)/.exec(err)?.[1]?.trim()??null,cuda=/loaded CUDA backend/i.test(err);
      if(timedOut)return done({ok:false,reason:'The graphics card check took longer than '+Math.round(timeoutMs/1000)+' seconds. The card may be busy or the NVIDIA driver may be too old.'});
      if(/no GPU found|CUDA driver version is insufficient|no CUDA-capable device/i.test(err)||devices===0||!cuda)return done({ok:false,reason:/insufficient/i.test(err)?'The NVIDIA driver on this PC is too old for CUDA 11.8. Update the NVIDIA driver, then try again.':'No NVIDIA graphics card was detected by the engine. Check that the NVIDIA driver is installed.'});
      if(code!==0)return done({ok:false,reason:'The NVIDIA engine found the card but stopped with an error.'});
      done({ok:true,devices,device:name});
    });
  });
}
module.exports={OFFICIAL,ENGINE_FOLDER,REQUIRED,installCudaEngine,checkCudaEngine,identify,sha256};
