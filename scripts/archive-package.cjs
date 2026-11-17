'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const {spawnSync}=require('node:child_process');
(async()=>{
  const version=require('../package.json').version;const folder=path.resolve('dist',`VerseCue-${version}-${process.platform}-${process.arch}`),zip=folder+'.zip';
  if(await fs.access(zip).then(()=>true,()=>false))throw new Error('Archive exists; do not overwrite a reviewed artifact');
  const manifest=JSON.parse(await fs.readFile(path.join(folder,'SHA256-MANIFEST.json'),'utf8'));if(manifest.version!==version)throw new Error('Package version mismatch');
  const known=new Set(manifest.files.map(f=>f.path).concat('SHA256-MANIFEST.json'));
  async function verify(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name),relative=path.relative(folder,file).replaceAll('\\','/');if(entry.isSymbolicLink())throw new Error('Unexpected package symlink');if(entry.isDirectory())await verify(file);else if(!known.has(relative)||/\.(wav|mp3|mp4|vtt)$/i.test(relative))throw new Error('Unlisted/private file in package');}}
  await verify(folder);
  for(const item of manifest.files){const file=path.resolve(folder,item.path);const relative=path.relative(folder,file);if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Invalid package manifest path');const bytes=await fs.readFile(file);if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw new Error('Package hash mismatch');await fs.utimes(file,new Date('2000-01-01T12:00:00Z'),new Date('2000-01-01T12:00:00Z'));}
  let result;
  if(process.platform==='win32')result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference='Stop'; Compress-Archive -LiteralPath $env:VERSECUE_PACKAGE_FOLDER -DestinationPath $env:VERSECUE_PACKAGE_ZIP -CompressionLevel Fastest"],{env:{...process.env,VERSECUE_PACKAGE_FOLDER:folder,VERSECUE_PACKAGE_ZIP:zip},windowsHide:true,encoding:'utf8'});
  else if(process.platform==='darwin')result=spawnSync('/usr/bin/ditto',['-c','-k','--sequesterRsrc','--keepParent',folder,zip],{encoding:'utf8'});
  else throw new Error('Unsupported native packaging platform');
  if(result.error||result.status!==0)throw new Error(result.error?.message||result.stderr||'Archive creation failed');
  const bytes=await fs.readFile(zip);const sha=crypto.createHash('sha256').update(bytes).digest('hex');await fs.writeFile(zip+'.sha256',sha+'  '+path.basename(zip)+'\n');console.log(JSON.stringify({version,bytes:bytes.length,sha256:sha,archive:path.basename(zip)}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
