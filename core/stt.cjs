'use strict';
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises');
const path=require('node:path');
const {SpeechScratch}=require('./speech-scratch.cjs');
const {ResidentSpeech}=require('./resident-speech.cjs');
function wav(samples){
  if(!Array.isArray(samples)||samples.length<3200||samples.length>160000||samples.some(n=>!Number.isFinite(n)||n< -1||n>1))throw new Error('Invalid audio window');
  const b=Buffer.alloc(44+samples.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);samples.forEach((s,i)=>b.writeInt16LE(Math.round(s<0?s*32768:s*32767),44+i*2));return b;
}
// Provisional runs are display-only snapshots of a still-growing window. A completed window preempts them.
// Windows are at most 10 s, so a 15.36 s audio context (768) is enough; the default 30 s context wastes most of the encoder's work.
// The context must stay longer than any window: a shorter one makes whisper loop. Change both together.
const AUDIO_CONTEXT='768',MAX_WINDOW_SECONDS=10;
// How clearly the words were heard: the mean probability of the engine's word tokens (0-1). Display only; never used to decide output.
function heardConfidence(tokens){if(!Array.isArray(tokens))return null;const p=tokens.filter(t=>typeof t?.text==='string'&&!/^\s*\[/.test(t.text)&&/[A-Za-z0-9]/.test(t.text)&&Number.isFinite(t.p)).map(t=>Math.max(0,Math.min(1,t.p)));return p.length?Math.round(p.reduce((a,b)=>a+b,0)/p.length*1000)/1000:null;}
const PROVISIONAL_TIMEOUT_MS=8000,SUPERSEDED='Provisional recognition superseded by a completed window';
class LocalSpeech {
  constructor(){this.executable=null;this.model=null;this.child=null;this.busy=false;this.epoch=0;this.mode='cli';this.scratch=null;this.resident=new ResidentSpeech();this.job=null;this.gpuReady=false;this.gpuState='cpu';this.warmEpoch=0;this.warmup=null;}
  async initializeScratch(root){if(this.busy)throw Error('Stop recognition before scratch recovery');const scratch=new SpeechScratch(root);await scratch.initialize();this.scratch=scratch;this.resident.scratch=scratch;}
  // acceleration 'gpu' lets a GPU-enabled engine (Metal, CUDA) use the graphics card; CPU-only engines ignore it.
  configure(executable,model,mode='cli',acceleration='gpu'){if(this.busy)throw new Error('Stop recognition before changing worker');if(!['cli','resident'].includes(mode))throw new Error('Invalid local speech mode');if(!['gpu','cpu'].includes(acceleration))throw new Error('Invalid speech acceleration');this.resident.stop();this.executable=executable;this.model=model;this.mode=mode;this.acceleration=acceleration;this.resident.acceleration='cpu';this.resident.warmedUp=false;this.gpuReady=false;this.gpuState=acceleration==='gpu'?'pending':'cpu';this.warmEpoch++;this.warmup=null;this.warmedUp=false;}
  // The kept-loaded engine runs unfinished speech only when it has proved fast here (a finished phrase under 1 s),
  // so a provisional run never noticeably delays the phrase that follows it.
  provisionalReady(){return this.mode==='cli'||Number.isFinite(this.lastFinalMs)&&this.lastFinalMs<1000;}
  capabilities(){return {provisional:this.provisionalReady(),final:true};}
  cancel(){this.epoch++;this.child?.kill();this.resident.stop();}
  // Drop the recognition in flight but keep a loaded model (used when a passage is prepared).
  interrupt(){this.epoch++;this.child?.kill();if(this.mode==='resident')this.resident.abort();else this.resident.stop();}
  async transcribe(samples){
    const job=this.job;
    // A CLI provisional run is ended at once; a kept-loaded engine's short provisional request is allowed to finish.
    if(this.busy&&job?.provisional){if(this.mode!=='resident'){job.preempted=true;job.child?.kill();}await job.done;}
    if(this.busy)throw new Error('Recognition busy; audio window dropped');
    return this.run(samples,false);
  }
  async transcribeProvisional(samples){
    if(!this.provisionalReady())throw new Error('Provisional speech skipped until the kept-loaded engine proves fast on this computer');
    if(this.busy)throw new Error('Recognition busy; provisional preview skipped');
    return {...await this.run(samples,true),final:false};
  }
  async run(samples,provisional){
    if(!this.executable||!this.model)throw new Error('Select a trusted local whisper-cli executable and model in Setup');
    const bytes=wav(samples);this.busy=true;const epoch=this.epoch;let dir,finish;
    const job={provisional,preempted:false,child:null,done:new Promise(resolve=>finish=resolve)};this.job=job;
    const canceled=()=>{if(job.preempted)throw new Error(SUPERSEDED);if(epoch!==this.epoch)throw new Error('Recognition canceled');};
    try{
      if(this.mode==='resident'){
        const server=path.join(path.dirname(this.executable),process.platform==='win32'?'whisper-server.exe':'whisper-server');
        this.resident.acceleration=this.acceleration==='gpu'&&this.gpuReady?'gpu':'cpu';
        const start=performance.now(),{text,confidence}=await this.resident.recognize(bytes,server,this.model);
        canceled();if(!provisional)this.lastFinalMs=performance.now()-start;
        return {text,heardConfidence:confidence,elapsedMs:Math.round(performance.now()-start),provider:'local whisper.cpp resident',final:true};
      }
      if(!this.scratch)throw Error('Speech scratch recovery must finish before recognition');const scratch=await this.scratch.create(bytes);dir=scratch.directory;const file=scratch.file;canceled();
      // A graphics-card engine may compile its kernels on first use (about a minute once); allow that only for the first request.
      // The graphics card is used only after warmUp() proved it (first-run shader compilation can take minutes), so every request keeps the normal limit.
      const limit=provisional?PROVISIONAL_TIMEOUT_MS:20000;
      const start=performance.now();const output=await new Promise((resolve,reject)=>{
        const child=spawn(this.executable,['-m',this.model,'-f',file,'-l','en','-t','4',...(this.acceleration==='cpu'||!this.gpuReady?['-ng']:[]),'-bs','1','-bo','1','-ac',AUDIO_CONTEXT,'-nt','-np',...(provisional?[]:['-ojf','-of',path.join(dir,'out')])],{windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
        this.child=child;job.child=child;let stdout='';let size=0;let timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;child.kill();},limit);
        child.stdout.on('data',b=>{size+=b.length;if(size>65536)child.kill();else stdout+=b.toString();});
        child.stderr.on('data',()=>{});
        child.once('error',()=>{clearTimeout(timer);reject(new Error(job.preempted?SUPERSEDED:'Local speech worker could not start'));});
        child.once('close',code=>{clearTimeout(timer);if(job.preempted)reject(new Error(SUPERSEDED));else if(timedOut)reject(new Error(provisional?'Provisional recognition exceeded 8 seconds; preview skipped':'Recognition exceeded 20 seconds; window discarded'));else if(code!==0||size>65536)reject(new Error('Local speech worker failed'));else resolve(stdout.trim());});
      });
      canceled();
      let confidence=null;if(!provisional){try{const json=JSON.parse(await fs.readFile(path.join(dir,'out.json'),'utf8'));confidence=heardConfidence((json.transcription??[]).flatMap(s=>s.tokens??[]));}catch{}}
      this.warmedUp=true;return {text:output.slice(0,8192),heardConfidence:confidence,elapsedMs:Math.round(performance.now()-start),provider:'local whisper.cpp',final:true};
    }finally{
      try{this.child=null;this.busy=false;if(this.job===job)this.job=null;if(dir)try{await this.scratch.remove(dir);}catch{this.scratch.ready=false;throw Error('Temporary speech cleanup failed; stop recognition and restart VerseCue');}}
      finally{finish();}
    }
  }
}
// Warm the graphics card up in the background: one second of silence through the engine on the GPU. Recognition stays on
// the processor until this proves a GPU backend loaded (Vulkan, CUDA or Metal); a failure or no card keeps the processor.
LocalSpeech.prototype.warmUp=function({timeoutMs=300000,spawnImpl=spawn}={}){
  if(this.acceleration!=='gpu'||!this.executable||!this.model||!this.scratch?.ready)return Promise.resolve({state:this.gpuState});
  if(this.warmup)return this.warmup;
  const epoch=this.warmEpoch,executable=this.executable,model=this.model;this.gpuState='warming';
  this.warmup=(async()=>{
    let dir;
    try{
      // Its own temporary file: the warm-up never touches the recognition scratch folder.
      dir=await fs.mkdtemp(path.join(require('node:os').tmpdir(),'versecue-warmup-'));const scratch={file:path.join(dir,'silence.wav')};await fs.writeFile(scratch.file,wav(new Array(16000).fill(0)));
      const result=await new Promise(resolve=>{
        const child=spawnImpl(executable,['-m',model,'-f',scratch.file,'-l','en','-t','4','-bs','1','-bo','1','-ac',AUDIO_CONTEXT,'-nt'],{windowsHide:true,shell:false,stdio:['ignore','ignore','pipe']});
        let err='';const timer=setTimeout(()=>child.kill(),timeoutMs);
        child.stderr.on('data',b=>{err=(err+b).slice(-20000);});
        child.once('error',()=>{clearTimeout(timer);resolve({ok:false});});
        child.once('close',code=>{clearTimeout(timer);const gpu=/loaded (CUDA|Vulkan) backend|using (Metal|Vulkan|CUDA)|ggml_metal_init: (found|picking|GPU name)/i.test(err);resolve({ok:code===0&&gpu,gpu,device:/(?:Device 0|0 =|GPU name):?\s*([^|,\r\n]+)/.exec(err)?.[1]?.trim()??null});});
      });
      if(epoch!==this.warmEpoch)return {state:'superseded'};
      this.gpuReady=result.ok;this.gpuState=result.ok?'ready':'unavailable';this.gpuDevice=result.device;
      return {state:this.gpuState,device:result.device};
    }catch{if(epoch===this.warmEpoch){this.gpuState='unavailable';}return {state:'unavailable'};}
    finally{if(dir)await fs.rm(dir,{recursive:true,force:true}).catch(()=>{});}
  })();
  return this.warmup;
};
module.exports={LocalSpeech,wav,PROVISIONAL_TIMEOUT_MS,heardConfidence,AUDIO_CONTEXT,MAX_WINDOW_SECONDS};
