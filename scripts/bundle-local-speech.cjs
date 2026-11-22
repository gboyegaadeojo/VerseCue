'use strict';
// Bundle the pinned whisper.cpp b5454 engine built from official source by .github/workflows/speech-engines.yml
// (Vulkan for any AMD/NVIDIA/Intel graphics card, every processor variant as fallback) and the verified model. No download.
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');const {spawnSync}=require('node:child_process');
async function bundle(resources){
  if(process.platform!=='win32')throw new Error('The available verified local speech archive is Windows x64 only. Supply and verify a native Mac build separately.');
  const root=path.resolve(__dirname,'..');const archive=path.join(root,'poc/private/tools/engines/whisper-b5454-vulkan-win-x64.zip');const model=path.join(root,'poc/private/models/ggml-base.en.bin');
  const sha=async file=>crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
  if(await sha(archive)!=='9c16b302a33997482d88154cac702ed030baf65d62d3580096bc6ddc09b03e6e')throw new Error('Speech engine archive hash mismatch');
  if(await sha(model)!=='a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002')throw new Error('Speech model hash mismatch');
  const destination=path.join(resources,'speech');await fs.mkdir(destination);const staging=await fs.mkdtemp(path.join(resources,'speech-stage-'));
  try{
    const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference='Stop'; Expand-Archive -LiteralPath $env:VERSECUE_SPEECH_ARCHIVE -DestinationPath $env:VERSECUE_SPEECH_STAGE"],{env:{...process.env,VERSECUE_SPEECH_ARCHIVE:archive,VERSECUE_SPEECH_STAGE:staging},windowsHide:true,encoding:'utf8'});
    if(r.error||r.status!==0)throw new Error(r.error?.message||r.stderr||'Speech extraction failed');
    const release=(await fs.readdir(staging)).includes('Release')?path.join(staging,'Release'):staging;for(const name of await fs.readdir(release))if(name==='whisper-cli.exe'||name==='whisper-server.exe'||name.endsWith('.dll'))await fs.copyFile(path.join(release,name),path.join(destination,name));
    await fs.copyFile(model,path.join(destination,'ggml-base.en.bin'));
    await fs.copyFile(path.join(root,'legal','WHISPER-LICENSE.txt'),path.join(destination,'WHISPER-LICENSE.txt'));
    await fs.copyFile(path.join(root,'legal','WHISPER-MODEL-LICENSE.txt'),path.join(destination,'WHISPER-MODEL-LICENSE.txt'));
  }finally{
    // mkdtemp returns an absolute direct child of our freshly created resources
    // directory. Resolve/contain before recursive cleanup.
    const relative=path.relative(path.resolve(resources),path.resolve(staging));if(relative.startsWith('..')||path.isAbsolute(relative)||!path.basename(staging).startsWith('speech-stage-'))throw new Error('Unsafe temporary cleanup path');await fs.rm(staging,{recursive:true,force:true});
  }
}
module.exports={bundle};
