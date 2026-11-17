'use strict';
// Authorized physical input only; memory bounded to twelve seconds at 16 kHz.
class PastorAudio {
  constructor({onLevel,onWindow,onHealth,onLost}){this.onLevel=onLevel;this.onWindow=onWindow;this.onHealth=onHealth;this.onLost=onLost;this.stream=null;this.ctx=null;this.node=null;this.active=false;this.cancelEpoch=0;this.noSignal=0;this.droppedSamples=0;this.buffer=new AudioWindowBuffer({onWindow:async samples=>{this.onHealth('Recognizing locally · capture continues in a bounded buffer');await this.onWindow(samples);},onDrop:drop=>{this.droppedSamples+=drop.samples;this.onHealth(`Audio ${drop.reason==='stale'?'expired':'overflow'} · ${(this.droppedSamples/16000).toFixed(1)}s dropped; recognition cannot keep up`);},onError:()=>this.onHealth('Recognition failed · review speech setup')});}
  async start(deviceId,channel,guard=()=>true){
    await this.stop();if(!guard())throw new Error('Audio session authorization was revoked');if(!deviceId)throw new Error('Select a specific audio input in Setup');
    const epoch=++this.cancelEpoch;
    const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:deviceId},echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:{ideal:Math.max(channel+1,2)}},video:false});
    if(epoch!==this.cancelEpoch||!guard()){stream.getTracks().forEach(t=>t.stop());return;}
    this.stream=stream;const track=stream.getAudioTracks()[0];
    track.onended=()=>{this.onHealth('Input lost · recognition stopped');this.stop();this.onLost?.();};
    // Browser-native device-rate conversion happens before the worklet.
    const context=new AudioContext({sampleRate:16000});
    try{await context.audioWorklet.addModule('capture-worklet.js');}catch(error){stream.getTracks().forEach(t=>t.stop());await context.close().catch(()=>{});throw error;}
    if(epoch!==this.cancelEpoch||!guard()){stream.getTracks().forEach(t=>t.stop());await context.close().catch(()=>{});return;}
    this.ctx=context;
    const source=this.ctx.createMediaStreamSource(stream);
    this.node=new AudioWorkletNode(this.ctx,'versecue-capture',{processorOptions:{channel}});
    const gain=this.ctx.createGain();gain.gain.value=0;source.connect(this.node);this.node.connect(gain);gain.connect(this.ctx.destination);
    this.active=true;this.buffer.start();this.droppedSamples=0;this.noSignal=0;this.onHealth(`Listening · ${track.label}`);
    this.node.port.onmessage=event=>{
      if(!this.active||epoch!==this.cancelEpoch)return;
      if(event.data.error){this.onHealth(event.data.error);this.stop();return;}
      const {samples,rms,peak}=event.data;this.onLevel(Math.min(1,rms*5));
      if(peak>=.99)this.onHealth('Clipping · reduce input gain');
      if(rms<.003)this.noSignal+=samples.length;else this.noSignal=0;
      if(this.noSignal>80000)this.onHealth('No signal · check selected channel');
      else if(peak<.99&&rms>=.003)this.onHealth(this.droppedSamples?`Listening · ${(this.droppedSamples/16000).toFixed(1)}s audio dropped this session; review suggestions`:`Listening · ${track.label}`);
      this.buffer.push(samples,rms);
    };
    return track.label;
  }
  async stop(){this.cancelEpoch++;this.active=false;this.buffer.stop();this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.node?.disconnect();this.node=null;if(this.ctx){await this.ctx.close().catch(()=>{});this.ctx=null;}this.onLevel(0);}
}
window.PastorAudio=PastorAudio;
