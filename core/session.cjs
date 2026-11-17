'use strict';
const {EventEmitter}=require('node:events');
const {randomUUID}=require('node:crypto');
const {parse}=require('./parser.cjs');
class Session extends EventEmitter {
  constructor(connector,{clock=()=>performance.timeOrigin+performance.now()}={}) {
    super();this.connector=connector;this.clock=clock;this.mode='confirm';this.stopped=false;this.dryRun=true;this.queue=[];this.history=[];this.events=[];this.generation=0;this.busy=false;this.translation='KJV';this.context=null;this.revisions=new Map();this.lastSend=null;
  }
  snapshot(){this.expire();return {mode:this.mode,stopped:this.stopped,dryRun:this.dryRun,queue:structuredClone(this.queue),history:structuredClone(this.history),events:structuredClone(this.events),busy:this.busy,translation:this.translation,capabilities:{auto:false,arbitraryLookup:false,clear:false},connection:this.connector.status??{state:'offline'}};}
  notify(){this.emit('change',this.snapshot());}
  log(code,state='info',metrics=null){const safe={};for(const key of ['nativeWorkerMs','sttWorkerMs'])if(Number.isFinite(metrics?.[key])&&metrics[key]>=0&&metrics[key]<=120000)safe[key]=Math.round(metrics[key]);this.events.push({id:randomUUID(),at:this.clock(),code,state,...(Object.keys(safe).length?{metrics:safe}:{})});this.events=this.events.slice(-100);}
  invalidate(){this.generation++;this.queue=[];this.context=null;}
  expire(){this.queue=this.queue.filter(c=>c.expiresAt>this.clock());}
  setMode(mode){if(!['confirm','suggest','paused'].includes(mode))throw new Error('Auto is unavailable until integration and speech acceptance pass');this.invalidate();this.mode=mode;this.log('MODE_CHANGED');this.notify();}
  stop(){this.stopped=true;this.mode='paused';this.invalidate();this.log('EMERGENCY_STOP','warning');this.notify();}
  resume(){this.stopped=false;this.mode='confirm';this.invalidate();this.log('REARMED_CONFIRM');this.notify();}
  configure({dryRun=true,translation='KJV'}={}){if(typeof dryRun!=='boolean'||!/^[- A-Z0-9]{2,30}$/.test(translation))throw new Error('Invalid session settings');this.invalidate();this.dryRun=dryRun;this.translation=translation;this.log('CONFIG_CHANGED');this.notify();}
  ingest(text,{id=randomUUID(),revision=1,final=true,manual=false,authorized=true}={}) {
    if(this.stopped||(!manual&&this.mode==='paused'))return [];
    if(typeof id!=='string'||id.length>100||!Number.isSafeInteger(revision)||revision<1)throw new Error('Invalid transcript identity');
    if((this.revisions.get(id)??0)>=revision)return [];
    this.revisions.set(id,revision);if(this.revisions.size>200)this.revisions.delete(this.revisions.keys().next().value);
    this.queue=this.queue.filter(c=>c.utteranceId!==id);
    if(!final){this.generation++;this.notify();return [];}
    const parsed=parse(text,{context:this.context,now:this.clock(),defaultTranslation:this.translation});
    // A new explicit book/reference or a failed parse cannot preserve a prior
    // remote context for later relative references.
    if(parsed.references.some(r=>!r.relative)||parsed.issues.length)this.context=null;
    if(parsed.corrected)this.invalidate();
    const candidates=parsed.references.map(r=>({id:randomUUID(),utteranceId:id,revision,reference:r,label:r.label,translation:r.translation??this.translation,phrase:text.slice(0,1000),detectedAt:this.clock(),expiresAt:this.clock()+15000,generation:this.generation,manual,authorized,state:authorized?'review':'blocked',issues:[...parsed.issues,...r.issues,...(!authorized?['Audio source not authorized']:[])]}));
    this.queue.push(...candidates);this.queue=this.queue.slice(-5);this.notify();return candidates;
  }
  reject(id){this.queue=this.queue.filter(c=>c.id!==id);this.log('CANDIDATE_DISMISSED');this.notify();}
  reset(){this.invalidate();this.revisions.clear();this.history=[];this.stopped=false;this.mode='confirm';this.dryRun=true;this.lastSend=null;this.log('SESSION_RESET');this.notify();}
  async send(id,{additionalGuard=()=>true}={}){
    this.expire();const c=this.queue.find(c=>c.id===id);
    if(!c||this.stopped||this.mode!=='confirm'||this.busy||!c.authorized||c.generation!==this.generation)throw new Error('Send blocked: expired, paused, stopped, busy or invalidated');
    if(c.reference.verse==null||c.reference.valid===false||c.reference.overLimit||c.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw new Error('Edit this incomplete, prohibited, out-of-bounds or over-limit reference before sending');
    const key=`${c.label}|${c.translation}`;
    if(this.lastSend?.key===key&&this.clock()-this.lastSend.at<10000)throw new Error('Duplicate cooldown: wait before intentionally repeating');
    this.busy=true;const gen=this.generation;this.notify();
    try {
      const result=await this.connector.send(c,{dryRun:this.dryRun,guard:()=>!this.stopped&&this.mode==='confirm'&&gen===this.generation&&this.clock()<c.expiresAt&&additionalGuard()});
      this.lastSend={key,at:this.clock()};this.queue=this.queue.filter(x=>x.id!==id);
      this.history.unshift({...c,phrase:undefined,state:result.state,at:this.clock()});this.history=this.history.slice(0,20);
      // Simulation never establishes real remote passage context.
      this.context=result.state==='readback-matched'?{...c.reference,translation:c.translation,verified:true,verifiedAt:this.clock()}:null;
      if(result.state==='uncertain'){this.invalidate();this.mode='paused';}
      this.log(result.state.toUpperCase(),result.state==='uncertain'?'warning':'info');return result;
    }finally{this.busy=false;this.notify();}
  }
}
module.exports={Session};
