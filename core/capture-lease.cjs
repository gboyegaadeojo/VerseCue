'use strict';
class CaptureLease {
  constructor({canStart,onStop,onChange,setTimer=setTimeout,clearTimer=clearTimeout}){Object.assign(this,{canStart,onStop,onChange,setTimer,clearTimer});this.ownerId=null;this.purpose=null;this.timer=null;this.epoch=0;}
  snapshot(){return {active:this.ownerId!==null,ownerId:this.ownerId,purpose:this.purpose};}
  owns(ownerId){return this.ownerId!==null&&this.ownerId===ownerId;}
  acquire(ownerId,authorized,purpose='recognition'){if(!Number.isSafeInteger(ownerId)||ownerId<1||authorized!==true)throw new Error('Explicit authorization for the selected feed is required');if(!['recognition','input-test','accuracy-check'].includes(purpose))throw Error('Invalid audio capture purpose');if(this.ownerId!==null)throw new Error('Audio capture is already owned by a VerseCue window; stop it there first');if(!this.canStart())throw new Error('Resume the session and finish pending recognition/preparation before listening');const epoch=++this.epoch;this.ownerId=ownerId;this.purpose=purpose;this.onChange(this.snapshot());if(purpose==='input-test'&&this.epoch===epoch)this.timer=this.setTimer(()=>{if(this.epoch===epoch&&this.owns(ownerId))this.cancel();},10000);return this.snapshot();}
  release(ownerId){if(this.owns(ownerId))this.cancel();return this.snapshot();}
  cancel(){this.epoch++;this.clearTimer(this.timer);this.timer=null;const changed=this.ownerId!==null;this.ownerId=null;this.purpose=null;this.onStop();if(changed)this.onChange(this.snapshot());}
}
module.exports={CaptureLease};
