'use strict';
function assessAuto(service,candidates,evidence={},{allowBusy=false}={}){
  if(service.mode!=='auto'||service.stopped||service.recovery?.required)return {eligible:false,reason:'Auto is paused or not enabled'};
  if(service.operationOwner)return {eligible:false,reason:'A passage operation is in progress'};
  if(service.busy&&!allowBusy)return {eligible:false,reason:'Another command is already in flight'};
  if(!service.capture?.active)return {eligible:false,reason:'No authorized audio session'};
  if(evidence.source!=='local-speech'||evidence.final!==true||evidence.endEvidence!=='silence'||evidence.droppedSamples!==0)return {eligible:false,reason:'Completed, loss-free speech with silence evidence is required'};
  if(!Number.isFinite(evidence.elapsedMs)||evidence.elapsedMs>4000||evidence.elapsedMs<0)return {eligible:false,reason:'Recognition is too slow or its age is unknown'};
  if(candidates.length!==1)return {eligible:false,reason:'Only one unambiguous reference can Auto-send'};
  const c=candidates[0],r=c.reference;
  if(c.manual||!c.authorized||c.recognition!=='reference'||r.relative||r.corrected||r.valid!==true||r.numberingSystem!=='KJV'||r.verse==null||r.overLimit||c.issues.length)return {eligible:false,reason:'This reference needs operator review; quotes never Auto-send'};
  if(!/\b(?:turn to|show|read|let us read|let['’]s read)\b/i.test(c.phrase)||/\b(?:he said|she said|last week|yesterday|we studied|in this song|lyrics|do not|don['’]t|not now|tomorrow)\b/i.test(c.phrase))return {eligible:false,reason:'An explicit current display/read instruction is required'};
  if(c.generation!==service.generation||service.clock()>=c.expiresAt)return {eligible:false,reason:'Reference expired or changed'};
  if(service.lastSend?.key===`${c.label}|${c.translation}`&&service.clock()-service.lastSend.at<10000)return {eligible:false,reason:'Repeated reference suppressed by duplicate cooldown'};
  if(!service.dryRun){const connector=service.connector,map=connector.mappings?.get(`${c.label}|${c.translation}`);if(!connector.armed||connector.status?.state!=='connected'||map?.autoVerified!==true)return {eligible:false,reason:'No complete cue explicitly verified for Auto test output'};}
  return {eligible:true,reason:service.dryRun?'Auto simulation ready; zero output requests':'Verified-cue Auto test output ready'};
}
class GuardedAuto {
  constructor(service,{delayMs=750,schedule=setTimeout,clear=clearTimeout}={}){if(!Number.isInteger(delayMs)||delayMs<750||delayMs>3000)throw new Error('Invalid Auto correction grace');Object.assign(this,{service,delayMs,schedule,clear});this.epoch=0;this.timer=null;}
  cancel(){this.epoch++;if(this.timer!==null)this.clear(this.timer);this.timer=null;}
  consider(candidates,evidence){
    this.cancel();const s=this.service;if(s.mode!=='auto')return;
    const decision=assessAuto(s,candidates,evidence);s.autoStatus={state:decision.eligible?'pending':'review',reason:decision.reason};
    if(!decision.eligible){for(const c of candidates)c.autoReviewReason=decision.reason;s.notify();return;}
    const c=candidates[0],epoch=this.epoch,inputEpoch=s.inputEpoch;let dispatching=false;c.autoEvidence={eligible:true,endEvidence:'silence',droppedSamples:0};
    const guard=()=>epoch===this.epoch&&inputEpoch===s.inputEpoch&&s.queue.at(-1)?.id===c.id&&assessAuto(s,[c],evidence,{allowBusy:dispatching}).eligible;
    this.timer=this.schedule(async()=>{this.timer=null;if(!guard()){s.autoStatus={state:'review',reason:'New speech or a session change canceled Auto'};s.notify();return;}try{dispatching=true;s.autoStatus={state:'sending',reason:'Checking the exact cue before Auto dispatch'};s.notify();const result=await s.send(c.id,{origin:'auto',additionalGuard:guard});s.autoStatus={state:result.state,reason:result.state==='simulated'?'Auto simulated; zero output requests':result.state==='readback-matched'?'Auto receipt/readback matched; physical output not independently observed':'Uncertain output; Auto paused'};}catch{s.connector.arm?.(false);s.setMode('paused');s.autoStatus={state:'paused',reason:'Auto validation/dispatch failed; inspect ProPresenter and resume in Confirm'};s.log('AUTO_BLOCKED_PAUSED','warning');}finally{s.notify();}},this.delayMs);this.timer?.unref?.();s.notify();
  }
}
module.exports={GuardedAuto,assessAuto};
