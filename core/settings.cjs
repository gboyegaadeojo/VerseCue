'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const {randomUUID,createHash}=require('node:crypto');
const MAX_SETTINGS_BYTES=16384,writes=new Set();
const {targetURL}=require('./connector.cjs');
const defaults=()=>({schemaVersion:1,host:'127.0.0.1',port:1025,translation:'KJV',audioDevice:'',channel:0,executable:'',model:'',speechMode:'cli',duplicateCooldownSeconds:10});
function validateSettings(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==1)throw new Error('Unsupported settings schema');
  const s=defaults();
  for(const key of ['host','translation','audioDevice','executable','model'])if(value[key]!==undefined){if(typeof value[key]!=='string'||value[key].length>1000)throw new Error('Invalid settings field');s[key]=value[key];}
  if(value.duplicateCooldownSeconds!==undefined){if(!Number.isSafeInteger(value.duplicateCooldownSeconds)||value.duplicateCooldownSeconds<1||value.duplicateCooldownSeconds>300)throw Error('Invalid duplicate cooldown');s.duplicateCooldownSeconds=value.duplicateCooldownSeconds;}
  s.port=value.port??s.port;s.channel=value.channel??0;targetURL(s.host,s.port);
  if(value.speechMode!==undefined){if(!['cli','resident'].includes(value.speechMode))throw new Error('Invalid speech mode');s.speechMode=value.speechMode;}
  if(!/^[- A-Z0-9]{2,30}$/.test(s.translation)||![0,1,2,3,4,5,6,7].includes(s.channel))throw new Error('Invalid translation or audio channel');
  return s;
}

function invalidFile(){return Object.assign(Error('Settings file is invalid or oversized'),{code:'INVALID_SETTINGS'});}
async function readValidated(file){
 const handle=await fs.open(file,'r');let bytes;
 try{const stat=await handle.stat();if(!stat.isFile()||stat.size>MAX_SETTINGS_BYTES)throw invalidFile();const buffer=Buffer.alloc(MAX_SETTINGS_BYTES+1);let count=0;while(count<buffer.length){const read=await handle.read(buffer,count,buffer.length-count,null);if(!read.bytesRead)break;count+=read.bytesRead;}if(count>MAX_SETTINGS_BYTES)throw invalidFile();bytes=buffer.subarray(0,count);}finally{await handle.close();}
 try{const settings=validateSettings(JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')));serialized(settings);return {settings,fingerprint:createHash('sha256').update(bytes).digest('hex')};}catch{throw invalidFile();}
}
async function optionalValid(file){try{return await readValidated(file);}catch(error){if(error.code==='ENOENT'||error.code==='INVALID_SETTINGS')return null;throw error;}}
function backupPath(file,slot){if(![1,2].includes(slot))throw Error('Choose a saved backup slot');return file+(slot===1?'.backup':'.backup2');}
async function backups(file){const snapshots=[],issues=[],seen=new Set();for(const slot of [1,2]){try{const value=await readValidated(backupPath(file,slot)),key=JSON.stringify(value.settings);if(seen.has(key)){issues.push({slot,reason:'duplicate'});continue;}seen.add(key);snapshots.push({slot,...value});}catch(error){issues.push({slot,reason:error.code==='ENOENT'?'missing':error.code==='INVALID_SETTINGS'?'invalid':'unreadable'});}}return {snapshots,issues};}
async function load(file){try{return {settings:(await readValidated(file)).settings,recovered:false};}catch(error){return {settings:defaults(),recovered:error.code!=='ENOENT'};}}
function serialized(settings){let value=JSON.stringify(settings,null,2);if(Buffer.byteLength(value)>MAX_SETTINGS_BYTES)value=JSON.stringify(settings);if(Buffer.byteLength(value)>MAX_SETTINGS_BYTES)throw Error('Settings exceed the file size limit');return value;}
async function atomicWrite(file,settings){const bytes=serialized(settings),temporary=file+'.'+randomUUID()+'.tmp';try{await fs.writeFile(temporary,bytes,{mode:0o600,flag:'wx'});await fs.rename(temporary,file);}finally{await fs.rm(temporary,{force:true}).catch(()=>{});}}
async function save(file,settings){
 const safe=validateSettings(settings);serialized(safe);const resolved=path.resolve(file),key=process.platform==='win32'?resolved.toLowerCase():resolved;if(writes.has(key))throw Error('A settings write is already in progress');writes.add(key);
 try{await fs.mkdir(path.dirname(file),{recursive:true});const history=[],seen=new Set(),current=await optionalValid(file),unchanged=current&&JSON.stringify(current.settings)===JSON.stringify(safe);const sources=[unchanged?null:current,await optionalValid(backupPath(file,1)),await optionalValid(backupPath(file,2))];for(const value of sources){if(value){const id=JSON.stringify(value.settings);if(!seen.has(id)){seen.add(id);history.push(value.settings);}}}if(history[1])await atomicWrite(backupPath(file,2),history[1]);if(history[0])await atomicWrite(backupPath(file,1),history[0]);await atomicWrite(file,safe);return safe;}finally{writes.delete(key);}
}
async function restore(file,{slot,fingerprint}={}){if(![1,2].includes(slot)||typeof fingerprint!=='string'||!/^[a-f0-9]{64}$/.test(fingerprint))throw Error('Review a valid saved backup before restoring');const selected=await readValidated(backupPath(file,slot));if(selected.fingerprint!==fingerprint)throw Error('Saved backup changed; review it again before restoring');return save(file,selected.settings);}
module.exports={defaults,validateSettings,load,save,backups,restore};
