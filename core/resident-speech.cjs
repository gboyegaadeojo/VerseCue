'use strict';
const {spawn}=require('node:child_process');const net=require('node:net');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const {randomBytes}=require('node:crypto');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function unusedPort(){return new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(error=>error?reject(error):resolve(port));});});}
// verbose_json carries per-word probabilities (or an average log probability per segment); display only.
function serverConfidence(data){const words=(data.segments??[]).flatMap(s=>s.words??[]).filter(w=>typeof w?.word==='string'&&/[A-Za-z0-9]/.test(w.word)).map(w=>w.probability).filter(Number.isFinite);if(words.length)return Math.round(words.reduce((a,b)=>a+Math.max(0,Math.min(1,b)),0)/words.length*1000)/1000;const logs=(data.segments??[]).map(s=>s.avg_logprob).filter(Number.isFinite);return logs.length?Math.round(Math.exp(logs.reduce((a,b)=>a+b,0)/logs.length)*1000)/1000:null;}
class ResidentSpeech {
  constructor(){this.acceleration='gpu';this.warmedUp=false;this.scratch=null;this.child=null;this.base=null;this.directory=null;this.epoch=0;this.controller=null;this.idle=null;this.starting=null;}
  stop(){this.epoch++;clearTimeout(this.idle);this.controller?.abort();this.controller=null;const child=this.child;this.child=null;this.base=null;child?.kill();const directory=this.directory;this.directory=null;this.discard(directory);}
  // App-owned scratch folders are recovered at startup; the temp-folder fallback is only for callers without scratch.
  discard(directory){if(!directory)return;if(this.scratch&&path.dirname(directory)===this.scratch.root)this.scratch.remove(directory).catch(()=>{});else if(path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('versecue-worker-'))fs.rm(directory,{recursive:true,force:true}).catch(()=>{});}
  async start(executable,model,deadline,epoch){
    const directory=this.scratch?await this.scratch.createDirectory():await fs.mkdtemp(path.join(os.tmpdir(),'versecue-worker-'));
    if(epoch!==this.epoch){this.discard(directory);throw new Error('Recognition canceled');}
    this.directory=directory;const port=await unusedPort();
    if(epoch!==this.epoch)throw new Error('Recognition canceled');
    const prefix='/'+randomBytes(32).toString('hex');this.startedAcceleration=this.acceleration;
    const child=spawn(executable,['--host','127.0.0.1','--port',String(port),'--public',directory,'--request-path',prefix,'-m',model,'-t','4','-p','1','-ac','768',...(this.acceleration==='cpu'?['-ng']:[]),'-l','en','-bs','1','-bo','1'],{windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
    this.child=child;let exited=false;child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});child.once('error',()=>{exited=true;});child.once('close',()=>{exited=true;if(this.child===child){this.child=null;this.base=null;}if(this.directory===directory)this.directory=null;this.discard(directory);});
    const base=`http://127.0.0.1:${port}${prefix}`;
    while(Date.now()<deadline&&!exited&&epoch===this.epoch){
      try{const response=await fetch(base+'/health',{redirect:'error',signal:AbortSignal.timeout(Math.min(300,Math.max(1,deadline-Date.now())))});if(response.ok&&(await response.json()).status==='ok'&&!exited&&epoch===this.epoch){this.base=base;return;}}catch{}
      await sleep(100);
    }
    throw new Error(epoch!==this.epoch?'Recognition canceled':'Resident speech worker could not become ready');
  }
  async recognize(bytes,executable,model){
    // A running worker started on the other processor (CPU vs graphics card) is restarted once.
    if(this.child&&this.startedAcceleration!==this.acceleration)this.stop();
    const epoch=this.epoch;clearTimeout(this.idle);let deadline=Date.now()+20000;
    try{
      // Loading the model (and the graphics driver) has its own 60 s budget; each phrase then keeps the 20 s limit.
      if(!this.child||!this.base){await this.start(executable,model,Date.now()+60000,epoch);deadline=Date.now()+20000;}
      if(epoch!==this.epoch||!this.base||!this.child)throw new Error('Recognition canceled');
      const child=this.child,body=new FormData();body.set('file',new Blob([bytes],{type:'audio/wav'}),'window.wav');body.set('response_format','verbose_json');body.set('language','en');body.set('temperature','0.0');body.set('temperature_inc','0.2');
      this.controller=new AbortController();const timer=setTimeout(()=>this.controller?.abort(),Math.max(1,deadline-Date.now()));let response;
      try{response=await fetch(this.base+'/inference',{method:'POST',body,redirect:'error',signal:this.controller.signal});if(!response.ok)throw new Error('Inference rejected');const text=await response.text();if(text.length>65536)throw new Error('Oversized result');const data=JSON.parse(text);if(epoch!==this.epoch||this.child!==child)throw new Error('Recognition canceled');if(typeof data.text!=='string')throw new Error('Invalid response');this.warmedUp=true;return {text:data.text.trim().slice(0,8192),confidence:serverConfidence(data)};}finally{clearTimeout(timer);this.controller=null;}
    }catch(error){this.stop();throw new Error(error.message==='Recognition canceled'?'Recognition canceled':'Resident recognition failed or exceeded 20 seconds; worker stopped');}
    finally{if(this.child){this.idle=setTimeout(()=>this.stop(),600000);this.idle.unref?.();}}
  }
}
module.exports={ResidentSpeech};
