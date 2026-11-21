'use strict';
// Signs a built release archive with IFC's offline Ed25519 key. Writes <archive>.sig.json beside it.
const fs=require('node:fs/promises');const {signRelease}=require('../core/update-verify.cjs');
(async()=>{
  const [archive,privateKeyFile,version]=process.argv.slice(2);if(!archive||!privateKeyFile||!/^\d+\.\d+\.\d+$/.test(version??''))throw Error('Usage: node scripts/sign-release.cjs <release.zip> <private-key.pem> <version>');
  const signed=await signRelease(archive,await fs.readFile(privateKeyFile,'utf8'),version);
  await fs.writeFile(archive+'.sig.json',JSON.stringify(signed,null,2),{flag:'wx'});
  console.log(JSON.stringify({signed:true,keyId:signed.keyId,version,sha256:signed.manifest.sha256}));
})().catch(error=>{console.error(error.code==='EEXIST'?'Refusing to overwrite an existing signature':error.message);process.exitCode=1;});
