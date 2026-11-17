'use strict';
const fs=require('node:fs/promises');
const {targetURL}=require('./connector.cjs');
const defaults=()=>({schemaVersion:1,host:'127.0.0.1',port:1025,translation:'KJV',audioDevice:'',channel:0,executable:'',model:''});
function validateSettings(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==1)throw new Error('Unsupported settings schema');
  const s=defaults();
  for(const key of ['host','translation','audioDevice','executable','model'])if(value[key]!==undefined){if(typeof value[key]!=='string'||value[key].length>1000)throw new Error('Invalid settings field');s[key]=value[key];}
  s.port=value.port??s.port;s.channel=value.channel??0;targetURL(s.host,s.port);
  if(!/^[- A-Z0-9]{2,30}$/.test(s.translation)||![0,1,2,3,4,5,6,7].includes(s.channel))throw new Error('Invalid translation or audio channel');
  return s;
}
async function load(file){try{return {settings:validateSettings(JSON.parse(await fs.readFile(file,'utf8'))),recovered:false};}catch(e){return {settings:defaults(),recovered:e.code!=='ENOENT'};}}
async function save(file,settings){const s=validateSettings(settings);await fs.mkdir(require('node:path').dirname(file),{recursive:true});const temp=file+'.tmp';await fs.writeFile(temp,JSON.stringify(s,null,2),{mode:0o600});await fs.copyFile(file,file+'.backup').catch(()=>{});await fs.rename(temp,file);return s;}
module.exports={defaults,validateSettings,load,save};
