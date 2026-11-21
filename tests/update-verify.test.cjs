'use strict';
// SYNTHETIC release files and throwaway keys only.
const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {signRelease,verifyRelease,loadTrustedKeys,compareVersions}=require('../core/update-verify.cjs');
async function fixture(){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'versecue-update-test-'));const file=path.join(dir,'VerseCue-0.7.0-win32-x64.zip');await fs.writeFile(file,crypto.randomBytes(4096));const {publicKey,privateKey}=crypto.generateKeyPairSync('ed25519');return {dir,file,pub:publicKey.export({type:'spki',format:'pem'}),priv:privateKey.export({type:'pkcs8',format:'pem'})};}
test('a release signed by a trusted key verifies and reports whether it is newer',async()=>{
  const f=await fixture();try{const signed=await signRelease(f.file,f.priv,'0.7.0');const r=await verifyRelease(f.file,signed,[f.pub],'0.6.0');assert.equal(r.valid,true);assert.equal(r.version,'0.7.0');assert.equal(r.newer,true);assert.equal((await verifyRelease(f.file,signed,[f.pub],'0.7.0')).newer,false);}finally{await fs.rm(f.dir,{recursive:true,force:true});}
});
test('tampering, an untrusted key, a forged manifest, a renamed file and missing keys are rejected',async()=>{
  const f=await fixture();try{
    const signed=await signRelease(f.file,f.priv,'0.7.0');
    const other=crypto.generateKeyPairSync('ed25519').publicKey.export({type:'spki',format:'pem'});
    await assert.rejects(verifyRelease(f.file,signed,[other]),/does not trust/);
    await assert.rejects(verifyRelease(f.file,signed,[]),/No trusted update key/);
    await assert.rejects(verifyRelease(f.file,{...signed,manifest:{...signed.manifest,version:'9.9.9'}},[f.pub]),/signature is not valid/);
    await assert.rejects(verifyRelease(f.file,{...signed,signature:'AAAA'},[f.pub]),/signature is not valid/);
    await assert.rejects(verifyRelease(f.file,{...signed,manifest:{...signed.manifest,product:'Other'}},[f.pub]),/different product/);
    await assert.rejects(verifyRelease(f.file,{...signed,manifest:{...signed.manifest,extra:1}},[f.pub]),/not a VerseCue release manifest/);
    await assert.rejects(verifyRelease(f.file,null,[f.pub]),/malformed/);
    const renamed=path.join(f.dir,'VerseCue-0.7.1-win32-x64.zip');await fs.copyFile(f.file,renamed);await assert.rejects(verifyRelease(renamed,signed,[f.pub]),/file name does not match/);
    const bytes=await fs.readFile(f.file);bytes[100]^=0xff;await fs.writeFile(f.file,bytes);await assert.rejects(verifyRelease(f.file,signed,[f.pub]),/changed after signing/);
  }finally{await fs.rm(f.dir,{recursive:true,force:true});}
});
test('trusted keys load only Ed25519 .pub.pem files and an empty folder means none',async()=>{
  const f=await fixture();try{const keys=path.join(f.dir,'keys');assert.deepEqual(await loadTrustedKeys(keys),[]);await fs.mkdir(keys);await fs.writeFile(path.join(keys,'ifc.pub.pem'),f.pub);await fs.writeFile(path.join(keys,'notes.txt'),'x');await fs.writeFile(path.join(keys,'rsa.pub.pem'),crypto.generateKeyPairSync('rsa',{modulusLength:1024}).publicKey.export({type:'spki',format:'pem'}));await fs.writeFile(path.join(keys,'bad.pub.pem'),'not a key');assert.deepEqual(await loadTrustedKeys(keys),[f.pub]);
  assert.deepEqual(await loadTrustedKeys(path.join(__dirname,'..','legal','update-keys')),[],'The repository ships with no trusted key');}finally{await fs.rm(f.dir,{recursive:true,force:true});}
});
test('the key generator refuses the repository and the signer writes a verifiable signature',async()=>{
  const f=await fixture();try{
    assert.throws(()=>execFileSync(process.execPath,[path.join(__dirname,'..','scripts','generate-update-key.cjs'),path.join(__dirname,'..','test-results','never-key'),'x'],{stdio:'pipe'}));
    const out=JSON.parse(execFileSync(process.execPath,[path.join(__dirname,'..','scripts','generate-update-key.cjs'),path.join(f.dir,'keys'),'ifc'],{encoding:'utf8'}));assert.equal(out.privateKeyWritten,true);
    execFileSync(process.execPath,[path.join(__dirname,'..','scripts','sign-release.cjs'),f.file,path.join(f.dir,'keys','ifc.private.pem'),'0.7.0'],{encoding:'utf8'});
    const signed=JSON.parse(await fs.readFile(f.file+'.sig.json','utf8'));const r=await verifyRelease(f.file,signed,[await fs.readFile(path.join(f.dir,'keys','ifc.pub.pem'),'utf8')],'0.6.0');assert.equal(r.valid,true);
    assert.equal(compareVersions('0.10.0','0.9.9'),1);
  }finally{await fs.rm(f.dir,{recursive:true,force:true});}
});
