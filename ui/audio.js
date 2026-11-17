'use strict';
// Authorized physical input only; memory bounded to twelve seconds at 16 kHz.
class PastorAudio {
  constructor({onLevel,onWindow,onHealth,onLost}){this.onLevel=onLevel;this.onWindow=onWindow;this.onHealth=onHealth;this.onLost=onLost;this.stream=null;this.ctx=null;this.node=null;this.samples=[];this.silent=0;this.active=false;this.inference=false;this.cancelEpoch=0;this.noSignal=0;}
  async start(deviceId,channel){
    await this.stop();if(!deviceId)throw new Error('Select a specific audio input in Setup');
    const epoch=++this.cancelEpoch;
    const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:deviceId},echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:{ideal:Math.max(channel+1,2)}},video:false});
    if(epoch!==this.cancelEpoch){stream.getTracks().forEach(t=>t.stop());return;}
    this.stream=stream;const track=stream.getAudioTracks()[0];
    track.onended=()=>{this.onHealth('Input lost · recognition stopped');this.stop();this.onLost?.();};
    // Browser-native device-rate conversion happens before the worklet.
    this.ctx=new AudioContext({sampleRate:16000});await this.ctx.audioWorklet.addModule('capture-worklet.js');
    const source=this.ctx.createMediaStreamSource(stream);
    this.node=new AudioWorkletNode(this.ctx,'versecue-capture',{processorOptions:{channel}});
    const gain=this.ctx.createGain();gain.gain.value=0;source.connect(this.node);this.node.connect(gain);gain.connect(this.ctx.destination);
    this.active=true;this.samples=[];this.silent=0;this.noSignal=0;this.onHealth(`Listening · ${track.label}`);
    this.node.port.onmessage=event=>{
      if(!this.active||epoch!==this.cancelEpoch)return;
      if(event.data.error){this.onHealth(event.data.error);this.stop();return;}
      const {samples,rms,peak}=event.data;this.onLevel(Math.min(1,rms*5));
      if(peak>=.99)this.onHealth('Clipping · reduce input gain');
      if(rms<.003)this.noSignal+=samples.length;else this.noSignal=0;
      if(this.noSignal>80000)this.onHealth('No signal · check selected channel');
      else if(peak<.99&&rms>=.003)this.onHealth(`Listening · ${track.label}`);
      // A busy worker drops incoming windows instead of accumulating stale audio.
      if(this.inference)return;
      if(!this.samples.length&&rms<.008)return;
      this.samples.push(...samples);this.silent=rms<.008?this.silent+samples.length:0;
      if((this.silent>=16000&&this.samples.length>=16000)||this.samples.length>=192000){
        const window=this.samples.slice(0,192000);this.samples=[];this.silent=0;this.inference=true;
        this.onHealth('Recognizing locally · incoming audio may be dropped');
        Promise.resolve(this.onWindow(window)).finally(()=>{this.inference=false;});
      }
    };
    return track.label;
  }
  async stop(){this.cancelEpoch++;this.active=false;this.samples=[];this.silent=0;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.node?.disconnect();this.node=null;if(this.ctx){await this.ctx.close().catch(()=>{});this.ctx=null;}this.onLevel(0);}
}
window.PastorAudio=PastorAudio;
