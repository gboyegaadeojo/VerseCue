'use strict';
// Every new VerseCue version uses the speech engine and model it ships with (2026-11-24): saved paths from an older copy,
// a missing file or a version marker from an earlier release are reset to this version's own on start. Packaged builds
// only (a source checkout has no built-in engine); without an executable argument the test reports a skip.
const {_electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs/promises'),{randomUUID}=require('node:crypto');
(async()=>{
  const exe=process.argv[2]?path.resolve(process.argv[2]):null;
  if(!exe){console.log(JSON.stringify({engineUpdate:'skipped: needs a packaged VerseCue executable'}));return;}
  const version=require('../package.json').version,env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
  const cases={
    oldCopy:{executable:'C:\\Old\\VerseCue-0.6.0-win32-x64\\resources\\speech\\whisper-cli.exe',model:'C:\\Old\\VerseCue-0.6.0-win32-x64\\resources\\speech\\ggml-base.en.bin',speechEngineVersion:'0.6.6'},
    customEngine:{executable:exe,model:exe,speechEngineVersion:'0.6.6'},
    noMarker:{executable:'',model:''}
  };
  const results={};
  for(const [name,saved] of Object.entries(cases)){
    const dir=path.resolve('test-results','engine-update-'+randomUUID());await fs.mkdir(dir,{recursive:true});
    await fs.writeFile(path.join(dir,'settings.json'),JSON.stringify({schemaVersion:1,host:'127.0.0.1',port:1025,translation:'KJV',audioDevice:'default',channel:0,speechMode:'resident',speechModeVersion:2,speechAcceleration:'gpu',duplicateCooldownSeconds:10,maxPassageVerses:10,startMode:'confirm',...saved}));
    const app=await _electron.launch({executablePath:exe,args:['--user-data-dir='+dir],env});
    try{
      const page=await app.firstWindow();await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
      const s=(await page.evaluate(()=>window.versecue.settings())).value;
      const speechDir=path.join(path.dirname(exe),process.platform==='darwin'?'../Resources/speech':'resources/speech');
      assert.equal(path.resolve(s.executable).toLowerCase(),path.resolve(speechDir,process.platform==='win32'?'whisper-cli.exe':'whisper-cli').toLowerCase(),name+' engine');
      assert.equal(path.resolve(s.model).toLowerCase(),path.resolve(speechDir,'ggml-base.en.bin').toLowerCase(),name+' model');
      assert.equal(s.speechEngineVersion,version,name+' marker');
      const onDisk=JSON.parse(await fs.readFile(path.join(dir,'settings.json'),'utf8'));assert.equal(onDisk.speechEngineVersion,version,name+' saved');
      results[name]='reset to this version';
    }finally{await app.close();}
  }
  console.log(JSON.stringify({engineUpdate:'passed',version,results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
