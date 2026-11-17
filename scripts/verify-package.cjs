'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const assert=require('node:assert/strict');
(async()=>{
  const version=require('../package.json').version;const folder=path.resolve('dist',`VerseCue-${version}-${process.platform}-${process.arch}`);const manifest=JSON.parse(await fs.readFile(path.join(folder,'SHA256-MANIFEST.json'),'utf8'));
  const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
  for(const entry of manifest.files){const target=path.resolve(folder,entry.path);const relative=path.relative(folder,target);assert.ok(!relative.startsWith('..')&&!path.isAbsolute(relative));assert.equal(sha(await fs.readFile(target)),entry.sha256,`Package hash mismatch: ${entry.path}`);assert.ok(!/\.(wav|mp3|mp4|vtt)$/i.test(entry.path),'No recordings in package');}
  for(const dir of ['core','desktop','ui','legal'])for(const name of await fs.readdir(dir)){const entry=manifest.files.find(f=>f.path===`resources/app/${dir}/${name}`);assert.ok(entry,`Missing application file ${dir}/${name}`);assert.equal(sha(await fs.readFile(path.join(dir,name))),entry.sha256,`Source differs from final package: ${dir}/${name}`);}
  const zip=folder+'.zip';const checksum=(await fs.readFile(zip+'.sha256','utf8')).split(/\s/)[0];const zipBytes=await fs.readFile(zip);assert.equal(sha(zipBytes),checksum);
  const desktop=JSON.parse(await fs.readFile('test-results/packaged-smoke.json','utf8'));const speech=JSON.parse(await fs.readFile('test-results/packaged-speech-integration.json','utf8'));assert.ok(desktop.passed&&speech.passed);
  const report={at:new Date().toISOString(),version,platform:process.platform,arch:process.arch,p0:'PENDING',release:'DEVELOPMENT_ONLY',manifestFilesVerified:manifest.files.length,currentSourceMatchesPackage:true,zipBytes:zipBytes.length,zipSha256:checksum,signed:false,packagedDesktop:desktop,packagedSpeech:speech};
  await fs.writeFile('docs/evidence/development-build-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({version,filesVerified:manifest.files.length,sourceMatches:true,zipSha256:checksum,desktopPassed:desktop.passed,speechPassed:speech.passed},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
