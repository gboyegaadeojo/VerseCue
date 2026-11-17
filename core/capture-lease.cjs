'use strict';
class CaptureLease {
  constructor({canStart,onStop,onChange}){Object.assign(this,{canStart,onStop,onChange});this.ownerId=null;}
  snapshot(){return {active:this.ownerId!==null,ownerId:this.ownerId};}
  owns(ownerId){return this.ownerId!==null&&this.ownerId===ownerId;}
  acquire(ownerId,authorized){if(!Number.isSafeInteger(ownerId)||ownerId<1||authorized!==true)throw new Error('Explicit authorization for the selected feed is required');if(this.ownerId!==null)throw new Error('Audio capture is already owned by a VerseCue window; stop it there first');if(!this.canStart())throw new Error('Resume the session and finish pending recognition/preparation before listening');this.ownerId=ownerId;this.onChange(this.snapshot());return this.snapshot();}
  release(ownerId){if(this.owns(ownerId))this.cancel();return this.snapshot();}
  cancel(){const changed=this.ownerId!==null;this.ownerId=null;this.onStop();if(changed)this.onChange(this.snapshot());}
}
module.exports={CaptureLease};
