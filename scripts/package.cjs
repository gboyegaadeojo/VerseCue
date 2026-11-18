'use strict';
// Electron's documented manual distribution layout. No signing credentials needed
// for local development packaging; this does not create a signed service release.
const fs=require('node:fs/promises');const path=require('node:path');const {spawnSync}=require('node:child_process');const crypto=require('node:crypto');
(async()=>{
  const root=path.resolve(__dirname,'..');const pkg=require('../package.json');
  if(!['win32','darwin'].includes(process.platform))throw new Error('Build on Windows or macOS for that native package');
  // On macOS the executable lives inside Electron.app/Contents/MacOS; copying
  // its parent would omit the app bundle, frameworks and resources.
  const runtime=path.join(path.dirname(require.resolve('electron/package.json')),'dist');const name=`VerseCue-${pkg.version}-${process.platform}-${process.arch}`;
  const out=path.join(root,'dist',name);await fs.mkdir(path.dirname(out),{recursive:true});
  // Refuse overwriting an existing package; never recursively delete a build.
  await fs.mkdir(out);await fs.cp(runtime,out,{recursive:true,verbatimSymlinks:true});
  let resources;
  if(process.platform==='win32'){
    await fs.rename(path.join(out,'electron.exe'),path.join(out,'VerseCue.exe'));
    await fs.rename(path.join(out,'electron_wer.dll'),path.join(out,'VerseCue_wer.dll')).catch(()=>{});
    resources=path.join(out,'resources');
  }else{
    const old=path.join(out,'Electron.app'),bundle=path.join(out,'VerseCue.app');await fs.rename(old,bundle);
    resources=path.join(bundle,'Contents','Resources');const plist=path.join(bundle,'Contents','Info.plist');let xml=await fs.readFile(plist,'utf8');
    xml=xml.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,'$1VerseCue$2').replace(/(<key>CFBundleName<\/key>\s*<string>)[^<]*(<\/string>)/,'$1VerseCue$2').replace(/(<key>CFBundleIdentifier<\/key>\s*<string>)[^<]*(<\/string>)/,'$1church.immanuel.versecue$2').replace(/<\/dict>\s*<\/plist>\s*$/, '<key>NSMicrophoneUsageDescription</key><string>VerseCue processes the selected pastor audio input locally to suggest Scripture references.</string></dict></plist>');await fs.writeFile(plist,xml);
  }
  await fs.rm(path.join(resources,'default_app.asar'),{force:true});
  if(process.argv.includes('--with-local-speech'))await require('./bundle-local-speech.cjs').bundle(resources);
  const nativeHelper=path.join(root,'native/bin/VerseCue.BibleBridge.exe');
  if(process.platform==='win32'&&await fs.access(nativeHelper).then(()=>true,()=>false)){await fs.mkdir(path.join(resources,'native'));await fs.copyFile(nativeHelper,path.join(resources,'native','VerseCue.BibleBridge.exe'));}
  const app=path.join(resources,'app');await fs.mkdir(app,{recursive:true});
  for(const dir of ['desktop','core','ui','legal'])await fs.cp(path.join(root,dir),path.join(app,dir),{recursive:true});
  await fs.writeFile(path.join(app,'package.json'),JSON.stringify({name:pkg.name,productName:pkg.productName,version:pkg.version,main:pkg.main,description:pkg.description,author:pkg.author},null,2));
  await fs.writeFile(path.join(out,'START-HERE.txt'),`VerseCue ${pkg.version} DEVELOPMENT BUILD\n\nWindows: extract the entire folder, then run VerseCue.exe. Keep all runtime files together.\nMac: build on macOS; signing/notarization and native verification remain pending.\n\nDefaults: Confirm, DRY RUN, no microphone capture until explicitly started.\nIn Setup, select the authorized pastor audio input and channel. Optional verified bundled speech assets are detected automatically; otherwise choose a trusted native whisper-cli and GGML model.\nAuto and arbitrary Bible lookup are not verified. Only explicitly mapped, verified ProPresenter cues can be sent to a supervised test target.\nDo not use this build in a live service. P0 and release acceptance are pending.\n`);
  const manifest=[];
  async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.isFile()){const bytes=await fs.readFile(file);manifest.push({path:path.relative(out,file).replaceAll('\\','/'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}}}
  await walk(out);await fs.writeFile(path.join(out,'SHA256-MANIFEST.json'),JSON.stringify({version:pkg.version,platform:process.platform,arch:process.arch,signed:false,files:manifest},null,2));
  // Upstream runtime ZIP entries can predate 1980 in local time; normalize only
  // this freshly created distribution so the Windows ZIP writer can encode them.
  const zipDate=new Date('2000-01-01T12:00:00Z');for(const item of manifest)await fs.utimes(path.join(out,item.path),zipDate,zipDate);
  if(process.argv.includes('--zip')){
    const zip=out+'.zip';if(process.platform==='win32'){
      // Arguments passed as values through an environment variable, never shell interpolation.
      const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',"$ErrorActionPreference = 'Stop'; Compress-Archive -LiteralPath $env:VERSECUE_PACKAGE_FOLDER -DestinationPath $env:VERSECUE_PACKAGE_ZIP -CompressionLevel Fastest"],{env:{...process.env,VERSECUE_PACKAGE_FOLDER:out,VERSECUE_PACKAGE_ZIP:zip},windowsHide:true,encoding:'utf8'});if(r.error||r.status!==0)throw new Error(r.error?.message||r.stderr||r.stdout||'ZIP creation failed');
    }else{const r=spawnSync('/usr/bin/ditto',['-c','-k','--sequesterRsrc','--keepParent',out,zip],{encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||'ZIP creation failed');}
    const bytes=await fs.readFile(zip);await fs.writeFile(zip+'.sha256',crypto.createHash('sha256').update(bytes).digest('hex')+'  '+path.basename(zip)+'\n');console.log(zip);
  }
  console.log(`Packaged ${manifest.length} files: ${out}`);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
