'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{createHash,randomUUID}=require('node:crypto');
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
// Forward-only accounting. Contains no reference, Bible text, audio, address or token.
// Persist a reservation before native access; uncertain/crashed saves retain it.
class NativeCopyLedger{
 constructor(file,{limit=500}={}){if(!Number.isInteger(limit)||limit<1||limit>500)throw Error('Invalid managed-copy limit');Object.assign(this,{file,limit});this.rows=[];this.loaded=false;this.failure=null;this.busy=false;}
 async load(){
  if(this.busy)throw Error('Managed-copy ledger is busy');this.busy=true;
  try{const stat=await fs.lstat(this.file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>256000)throw Error('Invalid managed-copy ledger file');const data=JSON.parse(await fs.readFile(this.file,'utf8'));
   if(!data||data.schemaVersion!==1||!Array.isArray(data.rows)||data.rows.length>500||Object.keys(data).some(k=>!['schemaVersion','rows'].includes(k)))throw Error('Invalid managed-copy ledger');
   const ids=new Set();for(const row of data.rows){if(!row||Object.keys(row).some(k=>!['id','target','state','uuid','fingerprint','clippingWarning'].includes(k))||!uuid(row.id)||ids.has(row.id)||!digest(row.target)||!['reserved','verified'].includes(row.state)||row.state==='reserved'&&(row.uuid!==null||row.fingerprint!==null||row.clippingWarning!==null)||row.state==='verified'&&(!uuid(row.uuid)||!digest(row.fingerprint)||typeof row.clippingWarning!=='boolean'))throw Error('Invalid managed-copy ledger entry');ids.add(row.id);}this.rows=data.rows;this.failure=null;
  }catch(error){if(error.code==='ENOENT'){this.rows=[];this.failure=null;}else this.failure='Managed-copy accounting could not be verified. Use saved passages or prepare manually; the existing ledger was kept.';}
  finally{this.loaded=true;this.busy=false;}return this.status();
 }
 status(){const remaining=Math.max(0,this.limit-this.rows.length);return {accountingVerified:this.loaded&&!this.failure,available:this.loaded&&!this.failure&&!this.busy&&remaining>0,managedCopies:this.rows.filter(row=>row.state==='verified').length,uncertainReservations:this.rows.filter(row=>row.state==='reserved').length,managedCopySlotsRemaining:remaining,managedCopyLimit:this.limit,reason:!this.loaded?'Managed-copy accounting is loading.':this.failure??(this.busy?'Managed-copy accounting is busy.':remaining===0?'The managed-copy limit across app restarts was reached. Reuse saved passages or manage copies in ProPresenter; no content was deleted.':null)};}
 targetKey(base){if(typeof base!=='string'||!/^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(base)||Number(base.split(':').at(-1))>65535)throw Error('Managed native copies require the verified local target');return createHash('sha256').update(base).digest('hex');}
 async persist(rows){
  await fs.mkdir(path.dirname(this.file),{recursive:true});const temp=this.file+'.'+randomUUID()+'.tmp';
  // Never discard an uncertain ledger or automatically reset accounting.
  let created=false;try{const handle=await fs.open(temp,'wx',0o600);created=true;try{await handle.writeFile(JSON.stringify({schemaVersion:1,rows}));await handle.sync();}finally{await handle.close();}
   await fs.rename(temp,this.file);this.rows=rows;
  }catch(error){if(created)await fs.unlink(temp).catch(()=>{});throw error;}
 }
 async reserve(base){
  const target=this.targetKey(base),status=this.status();if(!status.available)throw Error(status.reason??'Managed-copy accounting is unavailable');this.busy=true;
  try{const row={id:randomUUID(),target,state:'reserved',uuid:null,fingerprint:null,clippingWarning:null};await this.persist([...this.rows,row]);return row.id;}
  catch{this.failure='Managed-copy reservation could not be saved. Native preparation is blocked; inspect local storage before continuing.';throw Error(this.failure);}finally{this.busy=false;}
 }
 async complete(id,base,receipt){
  if(this.busy||!this.loaded||this.failure)throw Error('Managed-copy accounting is unavailable');const target=this.targetKey(base),row=this.rows.find(row=>row.id===id&&row.target===target&&row.state==='reserved');
  if(!row||!uuid(receipt?.uuid)||!digest(receipt?.fingerprint)||typeof receipt?.clippingWarning!=='boolean')throw Error('Managed-copy completion identity is invalid');this.busy=true;
  try{await this.persist(this.rows.map(item=>item===row?{...item,state:'verified',uuid:receipt.uuid,fingerprint:receipt.fingerprint,clippingWarning:receipt.clippingWarning}:item));}
  catch{this.failure='The copy may exist, but its accounting could not be saved. Inspect ProPresenter and local storage; no retry was sent.';throw Error(this.failure);}finally{this.busy=false;}
 }
 knownClipping(base,id,fingerprint){let target;try{target=this.targetKey(base);}catch{return false;}return this.rows.some(row=>row.target===target&&row.state==='verified'&&row.uuid===id&&row.fingerprint===fingerprint&&row.clippingWarning===true);}
 async reconcile(base,existingIds,guard=()=>true){
  if(this.busy||!this.loaded||this.failure)throw Error('Managed-copy accounting is unavailable');const target=this.targetKey(base);
  if(!(existingIds instanceof Set)||existingIds.size>10000||[...existingIds].some(id=>!uuid(id))||!guard())throw Error('A complete current catalog is required to reconcile managed copies');
  const rows=this.rows.filter(row=>row.target!==target||row.state!=='verified'||existingIds.has(row.uuid)),released=this.rows.length-rows.length;if(!released)return {released:0,...this.status()};this.busy=true;
  try{if(!guard())throw Error('Managed-copy reconciliation canceled');await this.persist(rows);}
  catch{this.failure='Managed-copy reconciliation could not be saved. Existing accounting was retained where possible; inspect local storage.';throw Error(this.failure);}finally{this.busy=false;}
  return {released,...this.status()};
 }
}
module.exports={NativeCopyLedger};
