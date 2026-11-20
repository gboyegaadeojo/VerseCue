'use strict';
// Owned synthetic app only. File dialogs are replaced in that process.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{randomUUID}=require('node:crypto'),{referenceMetadataVersions}=require('../core/reference-metadata-versions.cjs');
(async()=>{
  const executable=process.argv[2]?path.resolve(process.argv[2]):null,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
  const directory=path.resolve('test-results','reference-diagnostics-'+randomUUID()),file=path.join(directory,'diagnostics.json');await fs.mkdir(directory,{recursive:true});
  const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve('.')]),'--user-data-dir='+path.join(directory,'profile')],env});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
    const seeded=await page.evaluate(()=>window.versecue.command('ingest',{text:'Please show John 3:16 SYNTHETIC_PRIVATE_SERMON'}));assert.equal(seeded.ok,true);assert.equal(seeded.value.length,1);assert.match(seeded.value[0].phrase,/SYNTHETIC_PRIVATE_SERMON/);
    await app.evaluate((_electron,file)=>{const {dialog}=process.mainModule.require('electron');globalThis.diagnosticAllow=false;globalThis.diagnosticSaveCalls=0;dialog.showMessageBox=async(_window,options)=>{globalThis.diagnosticExplanation=options.message;return {response:globalThis.diagnosticAllow?1:0};};dialog.showSaveDialog=async()=>{globalThis.diagnosticSaveCalls++;return {canceled:false,filePath:file};};},file);
    assert.equal((await page.evaluate(()=>window.versecue.exportDiagnostics())).value,false);
    assert.equal(await app.evaluate(()=>globalThis.diagnosticSaveCalls),0);await assert.rejects(fs.access(file),{code:'ENOENT'});
    await app.evaluate(()=>globalThis.diagnosticAllow=true);assert.equal((await page.evaluate(()=>window.versecue.exportDiagnostics())).value,true);
    const text=await fs.readFile(file,'utf8'),value=JSON.parse(text);assert.deepEqual(value.referenceMetadata,referenceMetadataVersions());
    assert.equal(value.appVersion,await app.evaluate(({app})=>app.getVersion()));assert.match(await app.evaluate(()=>globalThis.diagnosticExplanation),/dictionary\/versification versions/);
    for(const forbidden of ['SYNTHETIC_PRIVATE_SERMON','John 3:16',path.basename(directory),'127.0.0.1'])assert.equal(text.includes(forbidden),false,'Export must omit '+forbidden);
    assert.equal(value.referenceMetadata.versification.bounds,undefined);
    const report={passed:true,packaged:!!executable,cancelDidNotWrite:true,exportIncludesExactDictionaryAndBoundsVersions:true,noReferenceTranscriptAddressOrPath:true,actualProPresenterAccess:false,microphoneCapture:false};await fs.writeFile(executable?'test-results/packaged-reference-diagnostics.json':'test-results/reference-diagnostics.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await app.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
