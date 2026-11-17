'use strict';
const {spawn}=require('node:child_process');const {parse}=require('./parser.cjs');
class BiblePreparation {
  constructor({helper,platform=process.platform,spawnImpl=spawn}={}){this.helper=helper;this.platform=platform;this.spawn=spawnImpl;this.busy=false;this.child=null;this.epoch=0;}
  available(){return this.platform==='win32'&&Boolean(this.helper);}
  cancel(){this.epoch++;this.child?.kill();}
  async prepare(reference,translation,{guard=()=>true}={}){
    if(!this.available())throw new Error('Native Bible preparation is not available on this platform/build');
    if(this.busy)throw new Error('Bible preparation is already in progress');
    const parsed=parse(reference);const r=parsed.references[0];
    if(parsed.references.length!==1||!r||r.label!==reference||r.verse==null||r.issues.some(i=>/Invalid/.test(i))||typeof translation!=='string'||!['KJV','ASV','NIV','NKJV','AMP','AMPC','MSG'].includes(translation))throw new Error('Use one exact canonical book/chapter/verse reference and a supported installed translation');
    if(!guard())throw new Error('Preparation canceled');this.busy=true;const epoch=this.epoch;
    try{
      const result=await new Promise((resolve,reject)=>{
        const child=this.spawn(this.helper,[],{stdio:['pipe','pipe','pipe'],shell:false,windowsHide:true});this.child=child;let stdout='',size=0,timedOut=false;
        const timer=setTimeout(()=>{timedOut=true;child.kill();},8000);
        child.stdout.on('data',chunk=>{size+=chunk.length;if(size>16384)child.kill();else stdout+=chunk.toString();});child.stderr.on('data',()=>{});child.stdin.on('error',()=>{});
        child.once('error',()=>{clearTimeout(timer);reject(new Error('Native preparation helper could not start'));});
        child.once('close',code=>{clearTimeout(timer);if(timedOut)return reject(new Error('Native preparation timed out; inspect ProPresenter before retrying'));try{const data=JSON.parse(stdout);if(code!==0||!data.ok)throw new Error(data.code??'NATIVE_PREPARATION_UNCERTAIN');if(data.outputRequests!==0||data.reference!==reference||data.translation!==translation||data.state!=='prepared-needs-operator-review')throw new Error('Native preparation response mismatch');resolve(data);}catch(error){reject(new Error('Preparation not verified: '+error.message));}});
        child.stdin.end(JSON.stringify({operation:'prepare',reference,translation})+'\n');
      });
      if(epoch!==this.epoch||!guard())throw new Error('Preparation canceled; already changed preparation may remain visible in ProPresenter');
      return {...result,formattingVerified:false,outputObserved:false};
    }finally{this.child=null;this.busy=false;}
  }
}
module.exports={BiblePreparation};
