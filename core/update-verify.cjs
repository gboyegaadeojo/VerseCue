'use strict';
// FR-060 / NFR-014 (manual signed updates, MVP). Ed25519 signatures over a small release manifest.
// This is release-integrity checking with IFC's own key. It is not Windows Authenticode or Apple notarization.
const crypto=require('node:crypto'),fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path');
const fail=message=>{throw Object.assign(new Error(message),{code:'UPDATE_REJECTED'});};
const MANIFEST_KEYS=['schemaVersion','product','fileName','version','size','sha256'];
function canonical(manifest){return JSON.stringify(Object.fromEntries(MANIFEST_KEYS.map(key=>[key,manifest[key]])));}
function keyId(publicKey){const key=publicKey instanceof crypto.KeyObject&&publicKey.type==='public'?publicKey:crypto.createPublicKey(publicKey);return crypto.createHash('sha256').update(key.export({type:'spki',format:'der'})).digest('hex').slice(0,16);}
function validateManifest(m){
  if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).some(k=>!MANIFEST_KEYS.includes(k)))fail('The signature file is not a VerseCue release manifest');
  if(m.schemaVersion!==1||m.product!=='VerseCue')fail('The signature file is for a different product or format');
  if(typeof m.fileName!=='string'||!/^[A-Za-z0-9._-]{1,200}$/.test(m.fileName)||typeof m.version!=='string'||!/^\d+\.\d+\.\d+$/.test(m.version))fail('The release name or version is invalid');
  if(!Number.isSafeInteger(m.size)||m.size<1||typeof m.sha256!=='string'||!/^[a-f0-9]{64}$/.test(m.sha256))fail('The release size or hash is invalid');
  return m;
}
async function digestFile(file){return new Promise((resolve,reject)=>{const hash=crypto.createHash('sha256');let size=0;fs.createReadStream(file).on('data',chunk=>{size+=chunk.length;hash.update(chunk);}).on('error',reject).on('end',()=>resolve({size,sha256:hash.digest('hex')}));});}
async function signRelease(file,privateKeyPem,version){
  const {size,sha256}=await digestFile(file),manifest=validateManifest({schemaVersion:1,product:'VerseCue',fileName:path.basename(file),version,size,sha256});
  const key=crypto.createPrivateKey(privateKeyPem);if(key.asymmetricKeyType!=='ed25519')fail('Release signing requires an Ed25519 key');
  return {manifest,keyId:keyId(crypto.createPublicKey(key)),signature:crypto.sign(null,Buffer.from(canonical(manifest)),key).toString('base64')};
}
function compareVersions(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i]?1:-1;}return 0;}
async function verifyRelease(file,signed,trustedPublicKeys,currentVersion){
  if(!Array.isArray(trustedPublicKeys)||!trustedPublicKeys.length)fail('No trusted update key is installed in this build');
  if(!signed||typeof signed!=='object'||typeof signed.signature!=='string'||typeof signed.keyId!=='string')fail('The signature file is malformed');
  const manifest=validateManifest(signed.manifest);
  const trusted=trustedPublicKeys.map(pem=>({pem,id:keyId(pem)})).find(k=>k.id===signed.keyId);if(!trusted)fail('The release was signed with a key this build does not trust');
  let ok=false;try{ok=crypto.verify(null,Buffer.from(canonical(manifest)),crypto.createPublicKey(trusted.pem),Buffer.from(signed.signature,'base64'));}catch{ok=false;}
  if(!ok)fail('The release signature is not valid');
  if(path.basename(file)!==manifest.fileName)fail('The file name does not match the signed release');
  const actual=await digestFile(file);if(actual.size!==manifest.size||actual.sha256!==manifest.sha256)fail('The file was changed after signing');
  return {valid:true,version:manifest.version,sha256:manifest.sha256,keyId:trusted.id,currentVersion,newer:currentVersion?compareVersions(manifest.version,currentVersion)>0:null};
}
async function loadTrustedKeys(directory){let names=[];try{names=await fsp.readdir(directory);}catch(error){if(error.code==='ENOENT')return [];throw error;}const keys=[];for(const name of names.filter(n=>/^[A-Za-z0-9._-]+\.pub\.pem$/.test(n)).sort()){const pem=await fsp.readFile(path.join(directory,name),'utf8');try{if(crypto.createPublicKey(pem).asymmetricKeyType==='ed25519')keys.push(pem);}catch{}}return keys;}
module.exports={signRelease,verifyRelease,loadTrustedKeys,keyId,compareVersions};
