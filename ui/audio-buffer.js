'use strict';
// Bounded capture continues while one inference request owns the worker.
// 2026-11-21: queued speech while recognizing is 5 s (was 2 s). CPU recognition takes about 2 s per window, so a 2 s
// queue dropped speech constantly during continuous preaching. Age checks in the main process still apply.
class AudioWindowBuffer {
  // Optional provisional snapshots copy a still-growing window for display only. They never clear or delay it.
  constructor({onWindow,onDrop=()=>{},onError=()=>{},clock=()=>performance.now(),capacity=160000,pendingCapacity=80000,maxPendingAgeMs=5000,onProvisional=null,provisionalEnabled=()=>false,provisionalMinSamples=16000,provisionalStepSamples=16000,silenceSamples=11200,onSpeculate=null,onSpeculationCancel=()=>{},speculateSilenceSamples=4800}){Object.assign(this,{onSpeculate,onSpeculationCancel,speculateSilenceSamples,silenceSamples,onWindow,onDrop,onError,clock,capacity,pendingCapacity,maxPendingAgeMs,onProvisional,provisionalEnabled,provisionalMinSamples,provisionalStepSamples});this.busy=false;this.provisionalBusy=false;this.epoch=0;this.active=false;this.clear();}
  clear(){this.samples=[];this.silent=0;this.readyAt=null;this.firstSampleAt=null;this.lastVoicedAt=null;this.pendingAt=null;this.provisionalMark=0;}
  start(){this.epoch++;this.clear();this.captureSessionId=globalThis.crypto.randomUUID();this.windowSequence=0;this.active=true;}
  stop(){this.epoch++;this.active=false;this.cancelSpeculation();this.clear();}
  // Early recognition (NR-027): after 0.3 s of silence the window so far is recognised in the background. If the pause
  // reaches 0.7 s the window closes as usual and that result is used (commit); if speech resumes it is discarded.
  cancelSpeculation(){const spec=this.spec;this.spec=null;if(spec){spec.cancelled=true;try{this.onSpeculationCancel(spec.windowId);}catch{}}}
  speculate(){
    const samples=this.samples.slice(),windowId=globalThis.crypto.randomUUID(),epoch=this.epoch;
    const metadata={windowId,captureSessionId:this.captureSessionId,windowSequence:this.windowSequence+1,endEvidence:'speculative',windowDurationMs:samples.length/16,bufferedAgeMs:Math.max(samples.length/16,this.clock()-this.firstSampleAt),speechEndAgeMs:this.lastVoicedAt===null?null:Math.max(0,this.clock()-this.lastVoicedAt),timingBasis:'capture-monotonic-proxy'};
    const spec={windowId,sampleCount:samples.length,settled:false,ok:false,cancelled:false};this.spec=spec;
    Promise.resolve().then(()=>this.active&&epoch===this.epoch?this.onSpeculate(samples,metadata):undefined).then(result=>{spec.ok=result?.speculative===true;},()=>{spec.ok=false;}).finally(()=>{spec.settled=true;if(this.spec===spec&&this.active&&epoch===this.epoch)this.drain();});
  }
  push(samples,rms,deliveryLagMs=0){
    if(!this.active)return;
    if(!this.samples.length&&rms<.008)return;
    const now=this.clock(),capturedAt=now-Math.max(0,deliveryLagMs);if(this.firstSampleAt===null)this.firstSampleAt=capturedAt-samples.length/16;if(rms>=.008)this.lastVoicedAt=capturedAt;
    if(this.busy&&this.pendingAt===null)this.pendingAt=now;
    if(this.spec&&rms>=.008)this.cancelSpeculation();
    this.samples.push(...samples);this.silent=rms<.008?this.silent+samples.length:0;
    const limit=this.busy?Math.min(this.capacity,this.pendingCapacity):this.capacity;
    const overflow=this.samples.length-limit;
    if(overflow>0){this.samples.splice(0,overflow);this.firstSampleAt+=overflow/16;this.provisionalMark=Math.max(0,this.provisionalMark-overflow);this.onDrop({reason:'overflow',samples:overflow});if(!this.active)return;}
    // 0.7 s of silence ends a window (was 1.0 s): every trigger is about 0.3 s sooner. A reference split by a longer pause is joined by the citation stabilizer.
    if(this.readyAt===null&&((this.silent>=this.silenceSamples&&this.samples.length>=16000)||this.samples.length>=limit))this.readyAt=this.clock();
    else if(this.readyAt===null&&this.onSpeculate&&!this.busy&&!this.spec&&this.silent>=this.speculateSilenceSamples&&this.samples.length>=16000)this.speculate();
    this.drain();
    this.provisional();
  }
  provisional(){
    if(!this.onProvisional||!this.active||this.busy||this.provisionalBusy||this.readyAt!==null||this.silent>0||!this.provisionalEnabled())return;
    if(this.samples.length<this.provisionalMinSamples||this.samples.length-this.provisionalMark<this.provisionalStepSamples)return;
    const samples=this.samples.slice(),epoch=this.epoch,metadata={captureSessionId:this.captureSessionId,windowSequence:this.windowSequence+1,snapshotDurationMs:samples.length/16};
    this.provisionalMark=this.samples.length;this.provisionalBusy=true;
    Promise.resolve().then(()=>this.active&&epoch===this.epoch?this.onProvisional(samples,metadata):undefined).catch(()=>{}).finally(()=>{this.provisionalBusy=false;});
  }
  drain(){
    if(!this.active||this.busy)return;
    if(this.pendingAt!==null&&this.clock()-this.pendingAt>this.maxPendingAgeMs){const count=this.samples.length;this.clear();this.onDrop({reason:'stale',samples:count});return;}
    if(this.readyAt===null)return;
    // Use the early result when the pause was confirmed with no speech since it started (only silence was added).
    if(this.spec){const spec=this.spec;if(!spec.settled)return;this.spec=null;
      if(spec.ok&&!spec.cancelled&&this.silent>=this.silenceSamples&&this.samples.length>=spec.sampleCount&&this.clock()-this.readyAt<=this.maxPendingAgeMs){
        const samples=this.samples,windowSequence=++this.windowSequence,captureSessionId=this.captureSessionId,firstSampleAt=this.firstSampleAt,lastVoicedAt=this.lastVoicedAt;this.clear();this.busy=true;const epoch=this.epoch;
        Promise.resolve().then(()=>this.active&&epoch===this.epoch?this.onWindow(samples,{windowId:spec.windowId,speculativeWindowId:spec.windowId,captureSessionId,windowSequence,endEvidence:'silence',windowDurationMs:samples.length/16,bufferedAgeMs:Math.max(samples.length/16,this.clock()-firstSampleAt),speechEndAgeMs:lastVoicedAt===null?null:Math.max(0,this.clock()-lastVoicedAt),timingBasis:'capture-monotonic-proxy'}):undefined).catch(error=>{if(this.active&&epoch===this.epoch)this.onError(error);}).finally(()=>{this.busy=false;this.drain();if(!this.busy)this.pendingAt=null;});
        return;}
      try{this.onSpeculationCancel(spec.windowId);}catch{}}
    if(this.clock()-this.readyAt>this.maxPendingAgeMs){const count=this.samples.length;this.clear();this.onDrop({reason:'stale',samples:count});return;}
    const samples=this.samples,endEvidence=this.silent>=this.silenceSamples?'silence':'window-limit',firstSampleAt=this.firstSampleAt,lastVoicedAt=this.lastVoicedAt,windowId=globalThis.crypto.randomUUID(),captureSessionId=this.captureSessionId,windowSequence=++this.windowSequence;this.clear();this.busy=true;const epoch=this.epoch;
    Promise.resolve().then(()=>this.active&&epoch===this.epoch?this.onWindow(samples,{windowId,captureSessionId,windowSequence,endEvidence,windowDurationMs:samples.length/16,bufferedAgeMs:Math.max(samples.length/16,this.clock()-firstSampleAt),speechEndAgeMs:lastVoicedAt===null?null:Math.max(0,this.clock()-lastVoicedAt),timingBasis:'capture-monotonic-proxy'}):undefined).catch(error=>{if(this.active&&epoch===this.epoch)this.onError(error);}).finally(()=>{this.busy=false;this.drain();if(!this.busy)this.pendingAt=null;});
  }
}
if(typeof module!=='undefined'&&module.exports)module.exports={AudioWindowBuffer};else window.AudioWindowBuffer=AudioWindowBuffer;
