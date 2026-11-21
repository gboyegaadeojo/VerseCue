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
const PROVISIONAL_TIMEOUT_MS=8000,SUPERSEDED='Provisional recognition superseded by a completed window';
class LocalSpeech {
  constructor(){this.executable=null;this.model=null;this.child=null;this.busy=false;this.epoch=0;this.mode='cli';this.scratch=null;this.resident=new ResidentSpeech();this.job=null;}
  async initializeScratch(root){if(this.busy)throw Error('Stop recognition before scratch recovery');const scratch=new SpeechScratch(root);await scratch.initialize();this.scratch=scratch;this.resident.scratch=scratch;}
  // acceleration 'gpu' lets a GPU-enabled engine (Metal, CUDA) use the graphics card; CPU-only engines ignore it.
  configure(executable,model,mode='cli',acceleration='gpu'){if(this.busy)throw new Error('Stop recognition before changing worker');if(!['cli','resident'].includes(mode))throw new Error('Invalid local speech mode');if(!['gpu','cpu'].includes(acceleration))throw new Error('Invalid speech acceleration');this.resident.stop();this.executable=executable;this.model=model;this.mode=mode;this.acceleration=acceleration;this.resident.acceleration=acceleration;this.resident.warmedUp=false;this.warmedUp=false;}
  capabilities(){return {provisional:this.mode==='cli',final:true};}
  cancel(){this.epoch++;this.child?.kill();this.resident.stop();}
  async transcribe(samples){
    const job=this.job;
    if(this.busy&&job?.provisional){job.preempted=true;job.child?.kill();await job.done;}
    if(this.busy)throw new Error('Recognition busy; audio window dropped');
    return this.run(samples,false);
  }
  async transcribeProvisional(samples){
    if(this.mode!=='cli')throw new Error('Provisional speech requires the bounded CLI worker');
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
        const start=performance.now(),text=await this.resident.recognize(bytes,server,this.model);
        canceled();
        return {text,elapsedMs:Math.round(performance.now()-start),provider:'local whisper.cpp resident',final:true};
      }
      if(!this.scratch)throw Error('Speech scratch recovery must finish before recognition');const scratch=await this.scratch.create(bytes);dir=scratch.directory;const file=scratch.file;canceled();
      // A graphics-card engine may compile its kernels on first use (about a minute once); allow that only for the first request.
      const limit=provisional?PROVISIONAL_TIMEOUT_MS:this.acceleration==='gpu'&&!this.warmedUp?90000:20000;
      const start=performance.now();const output=await new Promise((resolve,reject)=>{
        const child=spawn(this.executable,['-m',this.model,'-f',file,'-l','en','-t','4',...(this.acceleration==='cpu'?['-ng']:[]),'-bs','1','-bo','1','-nt','-np'],{windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
        this.child=child;job.child=child;let stdout='';let size=0;let timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;child.kill();},limit);
        child.stdout.on('data',b=>{size+=b.length;if(size>65536)child.kill();else stdout+=b.toString();});
        child.stderr.on('data',()=>{});
        child.once('error',()=>{clearTimeout(timer);reject(new Error(job.preempted?SUPERSEDED:'Local speech worker could not start'));});
        child.once('close',code=>{clearTimeout(timer);if(job.preempted)reject(new Error(SUPERSEDED));else if(timedOut)reject(new Error(provisional?'Provisional recognition exceeded 8 seconds; preview skipped':'Recognition exceeded 20 seconds; window discarded'));else if(code!==0||size>65536)reject(new Error('Local speech worker failed'));else resolve(stdout.trim());});
      });
      canceled();
      this.warmedUp=true;return {text:output.slice(0,8192),elapsedMs:Math.round(performance.now()-start),provider:'local whisper.cpp',final:true};
    }finally{
      try{this.child=null;this.busy=false;if(this.job===job)this.job=null;if(dir)try{await this.scratch.remove(dir);}catch{this.scratch.ready=false;throw Error('Temporary speech cleanup failed; stop recognition and restart VerseCue');}}
      finally{finish();}
    }
  }
}
module.exports={LocalSpeech,wav,PROVISIONAL_TIMEOUT_MS};
