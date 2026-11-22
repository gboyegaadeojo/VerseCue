'use strict';
// Electron's documented manual distribution layout. No signing credentials needed
// for local development packaging; this does not create a signed service release.
const fs=require('node:fs/promises');const path=require('node:path');const {spawnSync}=require('node:child_process');const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const pkg=require('../package.json');
// Small Windows programs (installer, uninstaller) built with the .NET compiler included in Windows; no extra dependency.
// They carry the VerseCue icon and version like VerseCue.exe.
function compileWindows(source,output,extra=[]){
  const framework=path.join(process.env.SystemRoot||'C:\\Windows','Microsoft.NET','Framework64','v4.0.30319');
  const info=path.join(path.dirname(output),'versecue-assembly-info.cs');require('node:fs').writeFileSync(info,`[assembly: System.Reflection.AssemblyVersion("${pkg.version}.0")][assembly: System.Reflection.AssemblyFileVersion("${pkg.version}.0")][assembly: System.Reflection.AssemblyTitle("VerseCue")][assembly: System.Reflection.AssemblyProduct("VerseCue")][assembly: System.Reflection.AssemblyCompany("VerseCue")][assembly: System.Reflection.AssemblyCopyright("Copyright (c) 2026 Gboyega. MIT License.")]`);
  const refs=['System.dll','System.Core.dll','System.Drawing.dll','System.Windows.Forms.dll','System.IO.Compression.dll','System.IO.Compression.FileSystem.dll'].map(n=>'/reference:'+path.join(framework,n));
  const r=spawnSync(path.join(framework,'csc.exe'),['/nologo','/target:winexe','/platform:x64','/optimize+','/win32icon:'+path.join(root,'assets/icons/versecue.ico'),'/out:'+output,...refs,...extra,path.join(root,'native/windows',source),info],{encoding:'utf8',windowsHide:true,timeout:300000,maxBuffer:1<<24});
  require('node:fs').rmSync(info,{force:true});if(r.error||r.status!==0)throw Error(source+' compilation failed: '+(r.error?.message||r.stdout||r.stderr));
}
(async()=>{require('./dependency-inventory.cjs').verify(root);
  if(!['win32','darwin'].includes(process.platform))throw new Error('Build on Windows or macOS for that native package');
  if(process.platform==='win32'){
    if(process.arch!=='x64')throw Error('Windows native preparation packaging currently requires x64');
    const compiled=spawnSync(process.execPath,[path.join(root,'scripts/build-windows-bridge.cjs')],{cwd:root,encoding:'utf8',windowsHide:true,timeout:30000});
    if(compiled.error||compiled.status!==0)throw Error('Windows helper compilation failed: '+(compiled.error?.message||compiled.stderr||compiled.stdout));
  }
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
    // The VerseCue icon on VerseCue.exe: a small packaging tool compiled with the built-in .NET compiler (no extra dependency).
    const framework=path.join(process.env.SystemRoot||'C:\Windows','Microsoft.NET','Framework64','v4.0.30319'),tool=path.join(path.dirname(out),'SetIcon.exe');
    const built=spawnSync(path.join(framework,'csc.exe'),['/nologo','/target:exe','/platform:x64','/out:'+tool,path.join(root,'native/windows/SetIcon.cs')],{encoding:'utf8',windowsHide:true,timeout:60000});
    if(built.error||built.status!==0)throw Error('Icon tool compilation failed: '+(built.error?.message||built.stdout||built.stderr));
    const icon=spawnSync(tool,[path.join(out,'VerseCue.exe'),path.join(root,'assets/icons/versecue.ico'),pkg.version],{encoding:'utf8',windowsHide:true,timeout:60000});
    await fs.rm(tool,{force:true});if(icon.error||icon.status!==0)throw Error('Setting the app icon failed: '+(icon.error?.message||icon.stderr||icon.stdout));
    resources=path.join(out,'resources');
  }else{
    const old=path.join(out,'Electron.app'),bundle=path.join(out,'VerseCue.app');await fs.rename(old,bundle);
    resources=path.join(bundle,'Contents','Resources');await fs.copyFile(path.join(root,'assets/icons/versecue.icns'),path.join(resources,'VerseCue.icns'));const plist=path.join(bundle,'Contents','Info.plist');let xml=await fs.readFile(plist,'utf8');
    xml=/<key>CFBundleIconFile<\/key>/.test(xml)?xml.replace(/(<key>CFBundleIconFile<\/key>\s*<string>)[^<]*(<\/string>)/,'$1VerseCue.icns$2'):xml.replace(/<\/dict>\s*<\/plist>\s*$/,'<key>CFBundleIconFile</key><string>VerseCue.icns</string></dict></plist>');
    // VerseCue's own version, not Electron's, in Finder and About.
    xml=xml.replace(/(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(<\/string>)/,'$1'+pkg.version+'$2').replace(/(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(<\/string>)/,'$1'+pkg.version+'$2');
    xml=xml.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,'$1VerseCue$2').replace(/(<key>CFBundleName<\/key>\s*<string>)[^<]*(<\/string>)/,'$1VerseCue$2').replace(/(<key>CFBundleIdentifier<\/key>\s*<string>)[^<]*(<\/string>)/,'$1church.immanuel.versecue$2').replace(/<\/dict>\s*<\/plist>\s*$/, '<key>NSMicrophoneUsageDescription</key><string>VerseCue processes the selected pastor audio input locally to suggest Scripture references.</string></dict></plist>');await fs.writeFile(plist,xml);
  }
  await fs.rm(path.join(resources,'default_app.asar'),{force:true});
  if(process.argv.includes('--with-local-speech'))await require('./bundle-local-speech.cjs').bundle(resources);
  const nativeHelper=path.join(root,'native/bin/VerseCue.BibleBridge.exe');
  if(process.platform==='win32'){
    require('./native-build-receipt.cjs').verifyNativeBuild(JSON.parse(await fs.readFile(nativeHelper+'.build.json','utf8')),await fs.readFile(path.join(root,'native/windows/BibleBridge.cs')),await fs.readFile(nativeHelper));
    await fs.mkdir(path.join(resources,'native'));await fs.copyFile(nativeHelper,path.join(resources,'native','VerseCue.BibleBridge.exe'));await fs.copyFile(nativeHelper+'.build.json',path.join(resources,'native','VerseCue.BibleBridge.exe.build.json'));
  }
  const app=path.join(resources,'app');await fs.mkdir(app,{recursive:true});
  await fs.mkdir(path.join(app,'assets'),{recursive:true});await fs.cp(path.join(root,'assets','icons'),path.join(app,'assets','icons'),{recursive:true});
  for(const dir of ['desktop','core','ui','legal'])await fs.cp(path.join(root,dir),path.join(app,dir),{recursive:true});
  await fs.writeFile(path.join(app,'package.json'),JSON.stringify({name:pkg.name,productName:pkg.productName,version:pkg.version,main:pkg.main,description:pkg.description,author:pkg.author},null,2));
  await fs.writeFile(path.join(out,'START-HERE.txt'),`VerseCue ${pkg.version} DEVELOPMENT BUILD\n\nWindows: extract the entire folder, then run VerseCue.exe. Keep all runtime files together.\nMac: build on macOS; signing/notarization and native verification remain pending.\n\nDefaults: Confirm, DRY RUN, no microphone capture until explicitly started.\nIn Setup, select the authorized pastor audio input and channel. Optional verified bundled speech assets are detected automatically; otherwise choose a trusted native whisper-cli and GGML model.\nAuto and arbitrary Bible lookup are not verified. Only explicitly mapped, verified ProPresenter cues can be sent to a supervised test target.\nDo not use this build in a live service. P0 and release acceptance are pending.\n`);
  // Uninstaller (NR-023): in every Windows package, so the ZIP and the installer hold the same files.
  if(process.platform==='win32')compileWindows('Uninstall.cs',path.join(out,'Uninstall VerseCue.exe'));
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
    // Windows installer (NR-023): the ZIP embedded in VerseCue-Setup-<version>.exe, which installs for the current user.
    if(process.platform==='win32'&&process.argv.includes('--installer')){
      const setup=path.join(path.dirname(out),`VerseCue-Setup-${pkg.version}.exe`);try{await fs.access(setup);throw Error('Refusing to overwrite '+setup);}catch(e){if(e.code!=='ENOENT')throw e;}
      compileWindows('Setup.cs',setup,['/resource:'+zip+',VerseCue.zip']);
      const sb=await fs.readFile(setup);await fs.writeFile(setup+'.sha256',crypto.createHash('sha256').update(sb).digest('hex')+'  '+path.basename(setup)+'\n');console.log(setup);
    }
  }
  console.log(`Packaged ${manifest.length} files: ${out}`);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
