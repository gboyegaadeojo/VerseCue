'use strict';
// Authorized physical input only; capture bounded to ten seconds, with two seconds pending inference at 16 kHz.
class PastorAudio {
  static inputInformation(track,channel){
    let settings={},capabilities={};try{settings=track?.getSettings?.()??{};}catch{}try{capabilities=track?.getCapabilities?.()??{};}catch{}
    const positive=value=>Number.isSafeInteger(value)&&value>0?value:null;
    const range=value=>value&&positive(value.min)&&positive(value.max)&&value.min<=value.max?{min:value.min,max:value.max}:null;
    return {channel:channel+1,channelCount:positive(settings.channelCount),sampleRate:positive(settings.sampleRate),sampleSize:positive(settings.sampleSize),channels:range(capabilities.channelCount),rates:range(capabilities.sampleRate),sizes:range(capabilities.sampleSize)};
  }
  static inputError(error,platform=''){
    if(['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name))return `Microphone access was denied. ${/Mac/i.test(platform)?'Open System Settings > Privacy & Security > Microphone and allow VerseCue.':/Win/i.test(platform)?'Open Windows Settings > Privacy & security > Microphone and check desktop app access.':'Check microphone permission for VerseCue in your system settings.'} Then explicitly start the selected input again.`;
    if(['NotFoundError','DevicesNotFoundError','OverconstrainedError'].includes(error?.name))return 'The selected input is unavailable or cannot provide the requested format. Reconnect it and review the saved device and channel; no other input was selected.';
    if(['NotReadableError','TrackStartError','AbortError'].includes(error?.name))return 'The selected input could not start. Check its connection and whether another application is using it, then explicitly retry.';
    return error?.message||'The selected audio input could not start.';
  }
  constructor({onLevel,onWindow,onHealth,onLost,onDiscontinuity,onInputInfo,onProvisional=null,provisionalEnabled=()=>false}){this.onInputInfo=onInputInfo;this.onLevel=onLevel;this.onWindow=onWindow;this.onHealth=onHealth;this.onLost=onLost;this.onDiscontinuity=onDiscontinuity;this.stream=null;this.ctx=null;this.node=null;this.active=false;this.cancelEpoch=0;this.noSignal=0;this.droppedSamples=0;this.clippedSamples=0;this.buffer=new AudioWindowBuffer({onWindow:async (samples,metadata)=>{this.onHealth('Recognizing locally · capture continues in a bounded buffer');await this.onWindow(samples,{...metadata,droppedSamples:this.droppedSamples,clippedSamples:this.clippedSamples});},onDrop:drop=>{const firstLoss=this.droppedSamples===0;this.droppedSamples+=drop.samples;if(firstLoss)this.onDiscontinuity?.(drop);this.onHealth(`Audio ${drop.reason==='stale'?'expired':'overflow'} · ${(this.droppedSamples/16000).toFixed(1)}s dropped; recognition cannot keep up`);},onError:()=>this.onHealth('Recognition failed · review speech setup'),onProvisional,provisionalEnabled});}
  async start(deviceId,channel,guard=()=>true,{meterOnly=false}={}){
    await this.stop();if(!guard())throw new Error('Audio session authorization was revoked');if(!deviceId)throw new Error('Select a specific audio input in Setup');
    if(!Number.isSafeInteger(channel)||channel<0||channel>7)throw new Error('Select a pastor channel from 1 to 8 in Setup');
    const epoch=++this.cancelEpoch;
    const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:deviceId},echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:{ideal:Math.max(channel+1,2)}},video:false});
    if(epoch!==this.cancelEpoch||!guard()){stream.getTracks().forEach(t=>t.stop());return;}
    this.stream=stream;const track=stream.getAudioTracks()[0];
    try{
      if(!track)throw new Error('The selected input returned no audio track');
      let reported={};try{reported=track.getSettings?.()??{};}catch{}
      if(typeof reported.deviceId==='string'&&reported.deviceId&&reported.deviceId!==deviceId)throw new Error('The returned input does not match the selected device. Capture stopped; review the saved input.');
      const info=PastorAudio.inputInformation(track,channel);
      if(info.channelCount!==null&&channel>=info.channelCount)throw new Error(`Pastor channel ${channel+1} is unavailable: the selected input reports ${info.channelCount} channel(s). Capture stopped; choose an available channel.`);

    }catch(error){await this.stop();throw error;}
    track.onended=()=>{this.onHealth('Input lost · recognition stopped');this.stop();this.onLost?.();};
    // Browser-native device-rate conversion happens before the worklet.
    const context=new AudioContext({sampleRate:16000});
    try{await context.audioWorklet.addModule('capture-worklet.js');}catch(error){stream.getTracks().forEach(t=>t.stop());await context.close().catch(()=>{});throw error;}
    if(epoch!==this.cancelEpoch||!guard()){stream.getTracks().forEach(t=>t.stop());await context.close().catch(()=>{});return;}
    this.ctx=context;
    const source=this.ctx.createMediaStreamSource(stream);
    this.node=new AudioWorkletNode(this.ctx,'versecue-capture',{processorOptions:{channel}});
    const gain=this.ctx.createGain();gain.gain.value=0;source.connect(this.node);this.node.connect(gain);gain.connect(this.ctx.destination);
    this.active=true;this.onInputInfo?.(PastorAudio.inputInformation(track,channel));this.buffer.start();this.droppedSamples=0;this.clippedSamples=0;this.nextCaptureSample=0;this.noSignal=0;this.onHealth(`Listening · ${track.label}`);
    context.onstatechange=()=>{if(this.active&&['suspended','interrupted','closed'].includes(context.state)){this.onHealth('Audio context interrupted; restart the selected input explicitly');this.stop();this.onLost?.();}};
    this.node.port.onmessage=event=>{
      if(!this.active||epoch!==this.cancelEpoch)return;
      if(event.data.error){this.onHealth(event.data.error);this.stop();this.onLost?.();return;}
      const {samples,rms,peak,sampleOffset,capturedAtContextSeconds}=event.data;
      if(!Array.isArray(samples)||!Number.isSafeInteger(sampleOffset)||sampleOffset<0||!Number.isFinite(capturedAtContextSeconds)){this.onHealth('Capture timing lost; restart the selected input');this.stop();this.onLost?.();return;}
      if(sampleOffset!==this.nextCaptureSample){const missing=Math.max(1,sampleOffset-this.nextCaptureSample);this.droppedSamples+=missing;this.buffer.clear();this.onDiscontinuity?.({reason:'capture-gap',samples:missing});if(sampleOffset<this.nextCaptureSample)return;}
      this.nextCaptureSample=sampleOffset+samples.length;const deliveryLagMs=Math.max(0,(this.ctx.currentTime-capturedAtContextSeconds)*1000);
      this.onLevel(Math.min(1,rms*5));
      if(peak>=.99){if(this.clippedSamples===0)this.onDiscontinuity?.({reason:'clipping',samples:samples.length});this.clippedSamples+=samples.length;this.onHealth('Clipping · reduce input gain');}
      if(rms<.003)this.noSignal+=samples.length;else this.noSignal=0;
      if(this.noSignal>80000)this.onHealth('No signal · check selected channel');
      else if(peak<.99&&rms>=.003)this.onHealth(this.droppedSamples?`Listening · ${(this.droppedSamples/16000).toFixed(1)}s audio dropped this session; review suggestions`:`Listening · ${track.label}`);
      if(!meterOnly)this.buffer.push(samples,rms,deliveryLagMs);
    };
    return track.label;
  }
  async stop(){this.cancelEpoch++;this.active=false;this.onInputInfo?.(null);this.buffer.stop();this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.node?.disconnect();this.node=null;if(this.ctx){await this.ctx.close().catch(()=>{});this.ctx=null;}this.onLevel(0);}
}
window.PastorAudio=PastorAudio;
