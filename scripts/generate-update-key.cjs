'use strict';
// Creates IFC's release-signing key pair. The private key must stay offline and outside this repository.
// Copy only the printed .pub.pem file into legal/update-keys/ so builds trust it.
const crypto=require('node:crypto'),fs=require('node:fs/promises'),path=require('node:path');const {keyId}=require('../core/update-verify.cjs');
(async()=>{
  const [outDir,name]=process.argv.slice(2);if(!outDir||!/^[A-Za-z0-9._-]{1,60}$/.test(name??''))throw Error('Usage: node scripts/generate-update-key.cjs <folder outside the repository> <key-name>');
  const target=path.resolve(outDir),repo=path.resolve(__dirname,'..'),relative=path.relative(repo,target);
  if(!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('Refusing to write a private signing key inside the repository');
  await fs.mkdir(target,{recursive:true});const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');
  const privatePath=path.join(target,name+'.private.pem'),publicPath=path.join(target,name+'.pub.pem');
  await fs.writeFile(privatePath,privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600,flag:'wx'});await fs.writeFile(publicPath,publicKey.export({type:'spki',format:'pem'}),{flag:'wx'});
  console.log(JSON.stringify({keyId:keyId(publicKey),publicKey:publicPath,privateKeyWritten:true,next:'Keep the private key offline. Copy the .pub.pem file into legal/update-keys/ to trust it in new builds.'}));
})().catch(error=>{console.error(error.code==='EEXIST'?'Refusing to overwrite an existing key':error.message);process.exitCode=1;});
