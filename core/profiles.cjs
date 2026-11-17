'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');const {validateSettings}=require('./settings.cjs');
function profileName(value){if(typeof value!=='string')throw new Error('Enter a profile name');const name=value.normalize('NFKC').trim();if(!name||name.length>60||/[\x00-\x1f\x7f]/.test(name))throw new Error('Use a profile name of 1–60 printable characters');return name;}
function validate(document){
  if(document?.schemaVersion!==1||!Array.isArray(document.profiles)||document.profiles.length>20)throw new Error('Invalid profile store');
  const ids=new Set(),names=new Set();const profiles=document.profiles.map(profile=>{if(typeof profile.id!=='string'||!/^[a-f0-9-]{36}$/i.test(profile.id)||ids.has(profile.id))throw new Error('Invalid profile identity');const name=profileName(profile.name),key=name.toLowerCase();if(names.has(key))throw new Error('Duplicate profile name');ids.add(profile.id);names.add(key);return {id:profile.id,name,settings:validateSettings(profile.settings)};});
  return {schemaVersion:1,profiles};
}
class Profiles {
  constructor(file){this.file=file;this.busy=false;}
  async read(){try{const bytes=await fs.readFile(this.file,'utf8');if(bytes.length>65536)throw new Error('Profile store too large');return validate(JSON.parse(bytes));}catch(error){if(error.code==='ENOENT')return {schemaVersion:1,profiles:[]};throw new Error('Profiles could not be read; existing profile file was preserved');}}
  async list(){return (await this.read()).profiles.map(({id,name})=>({id,name}));}
  async get(id){const profile=(await this.read()).profiles.find(profile=>profile.id===id);if(!profile)throw new Error('Profile no longer exists');return structuredClone(profile.settings);}
  async mutate(change){
    if(this.busy)throw new Error('A profile change is already in progress');this.busy=true;let temporary;
    try{const document=await this.read();change(document.profiles);const valid=validate(document),serialized=JSON.stringify(valid,null,2);if(serialized.length>65536)throw new Error('Profile storage limit reached; shorten local paths or remove a snapshot');await fs.mkdir(path.dirname(this.file),{recursive:true});temporary=this.file+'.'+randomUUID()+'.tmp';await fs.writeFile(temporary,serialized,{mode:0o600});await fs.copyFile(this.file,this.file+'.backup').catch(error=>{if(error.code!=='ENOENT')throw error;});await fs.rename(temporary,this.file);temporary=null;return valid.profiles.map(({id,name})=>({id,name}));}
    finally{this.busy=false;if(temporary)await fs.rm(temporary,{force:true}).catch(()=>{});}
  }
  save(name,settings){const safe=validateSettings(settings),normalized=profileName(name);return this.mutate(profiles=>{const current=profiles.find(profile=>profile.name.toLowerCase()===normalized.toLowerCase());if(current){current.name=normalized;current.settings=safe;}else{if(profiles.length>=20)throw new Error('Profile limit reached (20)');profiles.push({id:randomUUID(),name:normalized,settings:safe});}});}
  remove(id){return this.mutate(profiles=>{const index=profiles.findIndex(profile=>profile.id===id);if(index<0)throw new Error('Profile no longer exists');profiles.splice(index,1);});}
}
module.exports={Profiles,validate,profileName};
