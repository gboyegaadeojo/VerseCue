'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
function inventory(root=path.resolve(__dirname,'..')){
  const bytes=fs.readFileSync(path.join(root,'package-lock.json')),lock=JSON.parse(bytes),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  if(lock.packages?.['']?.version!==pkg.version)throw Error('Package and lockfile application versions differ');
  const entries=Object.entries(lock.packages).filter(([name])=>name).map(([name,p])=>({packagePath:name,name:name.split('node_modules/').at(-1),version:p.version,license:p.license??'SEE_UPSTREAM',integrity:p.integrity??null,developmentOnly:p.dev===true}));
  return {schemaVersion:2,applicationVersion:pkg.version,lockfileHashNormalization:'UTF-8 with CRLF normalized to LF',lockfileSha256:createHash('sha256').update(bytes.toString('utf8').replace(/\r\n/g,'\n')).digest('hex'),components:entries,runtimeNotices:'Packaged Electron LICENSE and LICENSES.chromium.html',optionalSpeech:'WHISPER-LICENSE.txt, WHISPER-MODEL-LICENSE.txt; pinned hashes in bundle-local-speech.cjs',note:'Inventory, not an independent license/security attestation'};
}
function verify(root=path.resolve(__dirname,'..')){
  const expected=inventory(root),actual=JSON.parse(fs.readFileSync(path.join(root,'legal/dependency-inventory.json'),'utf8'));
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Dependency inventory is stale; run node scripts/dependency-inventory.cjs and review the change');
  return expected.components.length;
}
module.exports={inventory,verify};
if(require.main===module){try{const args=process.argv.slice(2);if(args.length&&(args.length!==1||args[0]!=='--check'))throw Error('Use no arguments to generate, or --check to verify');if(args[0]==='--check')console.log(`${verify()} pinned dependency components verified.`);else{const value=inventory();fs.writeFileSync(path.resolve(__dirname,'../legal/dependency-inventory.json'),JSON.stringify(value,null,2)+'\n');console.log(`${value.components.length} pinned dependency components inventoried.`);}}catch(error){console.error(error.message);process.exitCode=1;}}
