'use strict';
class Capture extends AudioWorkletProcessor {
  constructor(options){super();this.channel=options.processorOptions.channel??0;this.nextSample=0;this.position=0;this.buffer=[];this.energy=0;this.peak=0;}
  process(inputs){
    const channels=inputs[0];if(!channels?.length)return true;
    const input=channels[this.channel];if(!input){this.port.postMessage({error:'Selected pastor channel is unavailable · choose the correct channel'});return false;}
    const ratio=sampleRate/16000;
    for(let i=0;i<input.length;i++,this.position++)if(this.position>=this.nextSample){const sample=input[i];this.buffer.push(sample);this.energy+=sample*sample;this.peak=Math.max(this.peak,Math.abs(sample));this.nextSample+=ratio;}
    if(this.buffer.length>=1600){this.port.postMessage({samples:this.buffer,rms:Math.sqrt(this.energy/this.buffer.length),peak:this.peak});this.buffer=[];this.energy=0;this.peak=0;}
    return true;
  }
}
registerProcessor('versecue-capture',Capture);
