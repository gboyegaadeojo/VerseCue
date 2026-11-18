'use strict';
const {createHash}=require('node:crypto');
function targetURL(host,port) {
  if(typeof host!=='string'||!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid host or port');
  // Literal loopback/private IPv4 only. No redirects, DNS rebinding or discovery.
  const labels=host.split('.'),parts=labels.map(Number);
  if(!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)||parts.some((x,i)=>x<0||x>255||String(x)!==labels[i])||!(parts[0]===127||parts[0]===10||(parts[0]===192&&parts[1]===168)||(parts[0]===172&&parts[1]>=16&&parts[1]<=31)))throw new Error('Use a canonical loopback or trusted private IPv4 address without leading zeros');
  return `http://${host}:${port}`;
}
const fingerprint=p=>createHash('sha256').update(JSON.stringify(p)).digest('hex');
class Connector {
  constructor({fetchImpl=fetch}={}){this.fetch=fetchImpl;this.status={state:'offline'};this.base=null;this.version=null;this.mappings=new Map();this.armed=false;this.generation=0;}
  configure(host,port){this.base=targetURL(host,port);this.generation++;this.version=null;this.armed=false;this.mappings.clear();this.status={state:'offline'};}
  async read(path){if(!this.base)throw new Error('Configure the target first');const base=this.base,generation=this.generation;const response=await this.fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(2000)});if(!response.ok)throw new Error(`ProPresenter HTTP ${response.status}`);const data=await response.text();if(generation!==this.generation||base!==this.base)throw new Error('Target changed during request; stale response discarded');if(data.length>2000000)throw new Error('Response too large');return JSON.parse(data);}
  async test(){const generation=this.generation;try{const v=await this.read('/version');if(typeof v.host_description!=='string'||!/ProPresenter/.test(v.host_description))throw new Error('Unexpected target identity');this.version=v;this.status={state:'connected',version:v.host_description};return this.status;}catch(e){if(generation===this.generation){this.armed=false;this.status={state:'offline'};}throw e;}}
  arm(value){if(value&&!this.version)throw new Error('Test connection before arming');this.armed=value===true;}
  async inspect(uuid){if(typeof uuid!=='string'||!/^[a-f0-9-]{36}$/i.test(uuid))throw new Error('Invalid presentation UUID');const raw=await this.read(`/v1/presentation/${uuid}`);const p=raw.presentation??raw;return {p,slides:(p.groups??[]).flatMap(g=>g.slides??[])};}
  async prepare({uuid,cue,reference,translation,verified,autoVerified=false}){
    const generation=this.generation;
    if(verified!==true)throw new Error('Verify actual Bible text, translation, theme and Looks in ProPresenter first');
    if(!Number.isInteger(cue)||cue<0||cue>10000||typeof reference!=='string'||typeof translation!=='string')throw new Error('Invalid mapping');
    const {p,slides}=await this.inspect(uuid);const s=slides[cue];
    if(typeof autoVerified!=='boolean'||autoVerified&&slides.length!==1)throw new Error('Auto verification requires one complete, unambiguous cue in the saved presentation');
    if(p.id?.uuid!==uuid||p.destination!=='presentation'||p.has_timeline||!s?.enabled||s.label!==reference)throw new Error('Presentation identity, destination, label or cue does not match');
    const mapping={uuid,cue,reference,translation,autoVerified,fingerprint:fingerprint(p),version:this.version?.host_description};
    if(generation!==this.generation)throw new Error('Target changed during mapping; verify again');
    if(!mapping.version)throw new Error('Test the target first');this.mappings.set(`${reference}|${translation}`,mapping);
    return {reference,translation,cue,prepared:true};
  }
  async send(candidate,{dryRun,guard,automatic=false}){
    if(dryRun){if(!guard())throw new Error('Send canceled');return {state:'simulated',networkRequests:0};}
    const generation=this.generation,base=this.base;
    if(!this.armed)throw new Error('Output is disarmed');
    const m=this.mappings.get(`${candidate.label}|${candidate.translation}`);
    if(!m)throw new Error('Prepare this exact passage in ProPresenter and verify a cue mapping. Arbitrary Bible lookup is not verified.');
    if(automatic&&m.autoVerified!==true)throw new Error('This cue has not been explicitly verified for Auto');
    const v=await this.read('/version');
    if(v.host_description!==m.version)throw new Error('ProPresenter version changed; retest and remap');
    const {p,slides}=await this.inspect(m.uuid);
    if(fingerprint(p)!==m.fingerprint)throw new Error('Presentation changed; verify a new mapping');
    if(generation!==this.generation||base!==this.base||!this.armed||!guard())throw new Error('Send canceled before dispatch');
    let r;
    try{r=await this.fetch(`${this.base}/v1/presentation/${m.uuid}/${m.cue}/trigger`,{redirect:'error',signal:AbortSignal.timeout(2000)});}catch{this.armed=false;return {state:'uncertain',retry:false};}
    if(r.status!==204){this.armed=false;throw new Error(`Trigger rejected: HTTP ${r.status}; no retry`);}
    if(generation!==this.generation||base!==this.base){this.armed=false;return {state:'uncertain',outputObserved:false,retry:false};}
    try{
      const [index,slide]=await Promise.all([this.read('/v1/presentation/slide_index'),this.read('/v1/status/slide')]);
      const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
      const match=index.presentation_index?.presentation_id?.uuid===m.uuid&&index.presentation_index?.index===m.cue&&clean(slide.current?.text)===clean(slides[m.cue].text);
      if(!match)this.armed=false;return {state:match?'readback-matched':'uncertain',outputObserved:false,retry:false};
    }catch{this.armed=false;return {state:'uncertain',outputObserved:false,retry:false};}
  }
}
module.exports={Connector,targetURL};
