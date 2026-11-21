'use strict';
// Audio-loss rule for Auto (FR-006, NFR-004, NR-010). Every loss still resets speech context and cancels
// pending work. Auto pauses and disarms only when losses persist, because then recognition cannot keep up.
// A single loss blocks Auto only for windows that themselves lost audio (per-window evidence).
const LOSS_LIMIT=3,LOSS_WINDOW_MS=60000;
class AudioLossPolicy{
  constructor({limit=LOSS_LIMIT,windowMs=LOSS_WINDOW_MS}={}){if(!Number.isSafeInteger(limit)||limit<1||!Number.isFinite(windowMs)||windowMs<=0)throw Error('Invalid audio-loss policy');Object.assign(this,{limit,windowMs});this.times=[];}
  reset(){this.times=[];}
  record(now){if(!Number.isFinite(now))throw Error('Invalid audio-loss time');this.times=this.times.filter(t=>now-t<this.windowMs&&t<=now);this.times.push(now);const persistent=this.times.length>=this.limit;if(persistent)this.times=[];return {pauseAuto:persistent,recentLosses:persistent?this.limit:this.times.length};}
}
module.exports={AudioLossPolicy,LOSS_LIMIT,LOSS_WINDOW_MS};
