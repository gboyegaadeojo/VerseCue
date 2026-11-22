'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto');
const ownedName=/^run-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
// Called only after the desktop's per-user-data single-instance lock is held.
// No recursive removal or global temporary-directory scanning.
class SpeechScratch {
 constructor(root){if(!path.isAbsolute(root))throw Error('Speech scratch must use an absolute app-owned directory');this.root=path.resolve(root);this.ready=false;}
 async verifyRoot(){const stat=await fs.lstat(this.root);if(!stat.isDirectory()||stat.isSymbolicLink()||path.relative(this.root,await fs.realpath(this.root))!=='')throw Error('Speech scratch directory is not a regular app-owned directory');}
 async initialize(){
  this.ready=false;
  // Resolve the configured parent (for example macOS /var -> /private/var),
  // while retaining lstat refusal of a linked scratch root or run directory.
  this.root=path.join(await fs.realpath(path.dirname(this.root)),path.basename(this.root));
  await fs.mkdir(this.root,{mode:0o700}).catch(error=>{if(error.code!=='EEXIST')throw error;});await this.verifyRoot();
  for(const name of await fs.readdir(this.root))if(ownedName.test(name))await this.remove(path.join(this.root,name));
  this.ready=true;
 }
 // Empty owned run folder for the resident worker's --public directory; removed like any other run.
 async createDirectory(){if(!this.ready)throw Error('Speech scratch recovery must finish before recognition');await this.verifyRoot();const directory=path.join(this.root,'run-'+randomUUID());await fs.mkdir(directory,{mode:0o700});return directory;}
 async create(bytes){
  if(!this.ready)throw Error('Speech scratch recovery must finish before recognition');await this.verifyRoot();
  const directory=path.join(this.root,'run-'+randomUUID());await fs.mkdir(directory,{mode:0o700});
  try{const file=path.join(directory,'input.wav');await fs.writeFile(file,bytes,{mode:0o600,flag:'wx'});return {directory,file};}catch(error){await this.remove(directory);throw error;}
 }
 async remove(directory){
  await this.verifyRoot();if(path.dirname(directory)!==this.root||!ownedName.test(path.basename(directory)))throw Error('Refusing out-of-scope speech scratch cleanup');
  let stat;try{stat=await fs.lstat(directory);}catch(error){if(error.code==='ENOENT')return;throw error;}
  if(!stat.isDirectory()||stat.isSymbolicLink()||path.relative(directory,await fs.realpath(directory))!=='')throw Error('Refusing linked speech scratch cleanup');
  const names=await fs.readdir(directory);// input.wav is the audio window; out.json is whisper-cli's word-probability output (-ojf, heard clarity). Anything else stops recognition.
  if(names.some(name=>name!=='input.wav'&&name!=='out.json'))throw Error('Unexpected file in speech scratch; recognition remains unavailable');
  for(const name of names){const file=path.join(directory,name),fileStat=await fs.lstat(file);if(!fileStat.isFile()||fileStat.isSymbolicLink())throw Error('Refusing linked speech audio cleanup');await fs.unlink(file);}
  await fs.rmdir(directory);
 }
}
module.exports={SpeechScratch};
