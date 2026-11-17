'use strict';
const {spawn}=require('node:child_process');const net=require('node:net');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const {randomBytes}=require('node:crypto');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function unusedPort(){return new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(error=>error?reject(error):resolve(port));});});}
class ResidentSpeech {
  constructor(){this.child=null;this.base=null;this.directory=null;this.epoch=0;this.controller=null;this.idle=null;this.starting=null;}
  stop(){this.epoch++;clearTimeout(this.idle);this.controller?.abort();this.controller=null;const child=this.child;this.child=null;this.base=null;child?.kill();const directory=this.directory;this.directory=null;if(directory&&path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('versecue-worker-'))fs.rm(directory,{recursive:true,force:true}).catch(()=>{});}
  async start(executable,model,deadline,epoch){
    const directory=await fs.mkdtemp(path.join(os.tmpdir(),'versecue-worker-'));
    if(epoch!==this.epoch){await fs.rm(directory,{recursive:true,force:true});throw new Error('Recognition canceled');}
    this.directory=directory;const port=await unusedPort();
    if(epoch!==this.epoch)throw new Error('Recognition canceled');
    const prefix='/'+randomBytes(32).toString('hex');
    const child=spawn(executable,['--host','127.0.0.1','--port',String(port),'--public',directory,'--request-path',prefix,'-m',model,'-t','4','-p','1','-ng','-l','en','-bs','1','-bo','1'],{windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
    this.child=child;let exited=false;child.stdout.on('data',()=>{});child.stderr.on('data',()=>{});child.once('error',()=>{exited=true;});child.once('close',()=>{exited=true;if(this.child===child){this.child=null;this.base=null;}if(path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('versecue-worker-'))fs.rm(directory,{recursive:true,force:true}).catch(()=>{});});
    const base=`http://127.0.0.1:${port}${prefix}`;
    while(Date.now()<deadline&&!exited&&epoch===this.epoch){
      try{const response=await fetch(base+'/health',{redirect:'error',signal:AbortSignal.timeout(Math.min(300,Math.max(1,deadline-Date.now())))});if(response.ok&&(await response.json()).status==='ok'&&!exited&&epoch===this.epoch){this.base=base;return;}}catch{}
      await sleep(100);
    }
    throw new Error(epoch!==this.epoch?'Recognition canceled':'Resident speech worker could not become ready');
  }
  async recognize(bytes,executable,model){
    const epoch=this.epoch,deadline=Date.now()+20000;clearTimeout(this.idle);
    try{
      if(!this.child||!this.base)await this.start(executable,model,deadline,epoch);
      if(epoch!==this.epoch||!this.base||!this.child)throw new Error('Recognition canceled');
      const child=this.child,body=new FormData();body.set('file',new Blob([bytes],{type:'audio/wav'}),'window.wav');body.set('response_format','json');body.set('language','en');body.set('temperature','0.0');body.set('temperature_inc','0.2');
      this.controller=new AbortController();const timer=setTimeout(()=>this.controller?.abort(),Math.max(1,deadline-Date.now()));let response;
      try{response=await fetch(this.base+'/inference',{method:'POST',body,redirect:'error',signal:this.controller.signal});if(!response.ok)throw new Error('Inference rejected');const text=await response.text();if(text.length>65536)throw new Error('Oversized result');const data=JSON.parse(text);if(epoch!==this.epoch||this.child!==child)throw new Error('Recognition canceled');if(typeof data.text!=='string')throw new Error('Invalid response');return data.text.trim().slice(0,8192);}finally{clearTimeout(timer);this.controller=null;}
    }catch(error){this.stop();throw new Error(error.message==='Recognition canceled'?'Recognition canceled':'Resident recognition failed or exceeded 20 seconds; worker stopped');}
    finally{if(this.child){this.idle=setTimeout(()=>this.stop(),90000);this.idle.unref?.();}}
  }
}
module.exports={ResidentSpeech};
