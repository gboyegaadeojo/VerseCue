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
class LocalSpeech {
  constructor(){this.executable=null;this.model=null;this.child=null;this.busy=false;this.epoch=0;this.mode='cli';this.scratch=null;this.resident=new ResidentSpeech();}
  async initializeScratch(root){if(this.busy)throw Error('Stop recognition before scratch recovery');const scratch=new SpeechScratch(root);await scratch.initialize();this.scratch=scratch;}
  configure(executable,model,mode='cli'){if(this.busy)throw new Error('Stop recognition before changing worker');if(!['cli','resident'].includes(mode))throw new Error('Invalid local speech mode');this.resident.stop();this.executable=executable;this.model=model;this.mode=mode;}
  cancel(){this.epoch++;this.child?.kill();this.resident.stop();}
  async transcribe(samples){
    if(this.busy)throw new Error('Recognition busy; audio window dropped');
    if(!this.executable||!this.model)throw new Error('Select a trusted local whisper-cli executable and model in Setup');
    const bytes=wav(samples);this.busy=true;const epoch=this.epoch;let dir;
    try{
      if(this.mode==='resident'){
        const server=path.join(path.dirname(this.executable),process.platform==='win32'?'whisper-server.exe':'whisper-server');
        const start=performance.now(),text=await this.resident.recognize(bytes,server,this.model);
        if(epoch!==this.epoch)throw new Error('Recognition canceled');
        return {text,elapsedMs:Math.round(performance.now()-start),provider:'local whisper.cpp resident',final:true};
      }
      if(!this.scratch)throw Error('Speech scratch recovery must finish before recognition');const scratch=await this.scratch.create(bytes);dir=scratch.directory;const file=scratch.file;if(epoch!==this.epoch)throw Error('Recognition canceled');
      const start=performance.now();const output=await new Promise((resolve,reject)=>{
        const child=spawn(this.executable,['-m',this.model,'-f',file,'-l','en','-t','4','-ng','-bs','1','-bo','1','-nt','-np'],{windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
        this.child=child;let stdout='';let size=0;let timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;child.kill();},20000);
        child.stdout.on('data',b=>{size+=b.length;if(size>65536)child.kill();else stdout+=b.toString();});
        child.stderr.on('data',()=>{});
        child.once('error',()=>{clearTimeout(timer);reject(new Error('Local speech worker could not start'));});
        child.once('close',code=>{clearTimeout(timer);if(timedOut)reject(new Error('Recognition exceeded 20 seconds; window discarded'));else if(code!==0||size>65536)reject(new Error('Local speech worker failed'));else resolve(stdout.trim());});
      });
      if(epoch!==this.epoch)throw new Error('Recognition canceled');
      return {text:output.slice(0,8192),elapsedMs:Math.round(performance.now()-start),provider:'local whisper.cpp',final:true};
    }finally{this.child=null;this.busy=false;if(dir)try{await this.scratch.remove(dir);}catch{this.scratch.ready=false;throw Error('Temporary speech cleanup failed; stop recognition and restart VerseCue');}}
  }
}
module.exports={LocalSpeech,wav};
