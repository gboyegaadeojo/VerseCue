'use strict';
// Bounded capture continues while one inference request owns the worker.
class AudioWindowBuffer {
  constructor({onWindow,onDrop=()=>{},onError=()=>{},clock=()=>performance.now(),capacity=192000,maxPendingAgeMs=4000}){Object.assign(this,{onWindow,onDrop,onError,clock,capacity,maxPendingAgeMs});this.busy=false;this.epoch=0;this.active=false;this.clear();}
  clear(){this.samples=[];this.silent=0;this.readyAt=null;}
  start(){this.epoch++;this.clear();this.active=true;}
  stop(){this.epoch++;this.active=false;this.clear();}
  push(samples,rms){
    if(!this.active)return;
    if(!this.samples.length&&rms<.008)return;
    this.samples.push(...samples);this.silent=rms<.008?this.silent+samples.length:0;
    const overflow=this.samples.length-this.capacity;
    if(overflow>0){this.samples.splice(0,overflow);this.onDrop({reason:'overflow',samples:overflow});}
    if(this.readyAt===null&&((this.silent>=16000&&this.samples.length>=16000)||this.samples.length>=this.capacity))this.readyAt=this.clock();
    this.drain();
  }
  drain(){
    if(!this.active||this.busy||this.readyAt===null)return;
    if(this.clock()-this.readyAt>this.maxPendingAgeMs){const count=this.samples.length;this.clear();this.onDrop({reason:'stale',samples:count});return;}
    const samples=this.samples,endEvidence=this.silent>=16000?'silence':'window-limit';this.clear();this.busy=true;const epoch=this.epoch;
    Promise.resolve().then(()=>this.active&&epoch===this.epoch?this.onWindow(samples,{endEvidence}):undefined).catch(error=>{if(this.active&&epoch===this.epoch)this.onError(error);}).finally(()=>{this.busy=false;this.drain();});
  }
}
if(typeof module!=='undefined'&&module.exports)module.exports={AudioWindowBuffer};else window.AudioWindowBuffer=AudioWindowBuffer;
