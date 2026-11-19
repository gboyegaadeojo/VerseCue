'use strict';
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const {sha}=require('./native-build-receipt.cjs');
if(process.platform!=='win32')throw new Error('This adapter must be compiled on Windows');
const framework=path.join(process.env.SystemRoot||'C:\\Windows','Microsoft.NET','Framework64','v4.0.30319');const wpf=path.join(framework,'WPF');
const out=path.resolve('native/bin/VerseCue.BibleBridge.exe');fs.mkdirSync(path.dirname(out),{recursive:true});
const sourceFile=path.resolve('native/windows/BibleBridge.cs'),sourceBefore=sha(fs.readFileSync(sourceFile));
const refs=['System.dll','System.Core.dll','System.Windows.Forms.dll','System.Web.Extensions.dll'].map(name=>path.join(framework,name)).concat(['UIAutomationClient.dll','UIAutomationTypes.dll','WindowsBase.dll'].map(name=>path.join(wpf,name)));
const result=spawnSync(path.join(framework,'csc.exe'),['/nologo','/target:exe','/platform:x64',`/out:${out}`,...refs.map(file=>'/reference:'+file),sourceFile],{encoding:'utf8',windowsHide:true});
if(result.error||result.status!==0){console.error(result.stdout||result.stderr||result.error?.message);process.exitCode=1;}else{
 if(sha(fs.readFileSync(sourceFile))!==sourceBefore)throw Error('Windows helper source changed during compilation');
 const receipt={schemaVersion:1,sourcePath:'native/windows/BibleBridge.cs',sourceSha256:sourceBefore,helperSha256:sha(fs.readFileSync(out)),compiler:'Microsoft.NET Framework csc',platform:'win32',arch:'x64'};
 fs.writeFileSync(out+'.build.json',JSON.stringify(receipt,null,2)+'\n');
 console.log('Compiled experimental Windows preparation helper from current source; no UI operation executed.');
}
