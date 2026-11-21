'use strict';
// Scores labelled rehearsal streams through the app's own Auto decision code, in dry run.
// Prints only counts. The full report stays in ignored test-results/auto-rehearsal/reports.
const fs=require('node:fs/promises'),path=require('node:path');const {rehearse}=require('../core/auto-rehearsal.cjs');
(async()=>{
  const args=process.argv.slice(2),options={},files=[];let name=null;
  for(const arg of args){const m=arg.match(/^--(hold-ms|policy)=(.+)$/);if(m){if(m[1]==='hold-ms')options.holdMs=Number(m[2]);else options.citationPolicy=m[2];}else if(!name)name=arg;else files.push(arg);}
  if(!name||!/^[A-Za-z0-9._-]{1,80}\.json$/.test(name)||!files.length)throw Error('Usage: node scripts/run-auto-rehearsal.cjs <report.json> [--hold-ms=1000] [--policy=explicit-command] <stream.json>...');
  const streams=[];for(const file of files){const text=await fs.readFile(file,'utf8');if(text.length>64*1024*1024)throw Error('Stream too large');streams.push(JSON.parse(text.replace(/^﻿/,'')));}
  const report=await rehearse(streams,options);
  const dir=path.resolve('test-results','auto-rehearsal','reports');await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,name),JSON.stringify({at:new Date().toISOString(),...report},null,2),{flag:'wx'});
  console.log(JSON.stringify({written:true,recordings:report.recordings.length,gate:report.gate,serviceAcceptancePassed:false}));
})().catch(error=>{console.error(error.code==='EEXIST'?'Refusing to overwrite an existing report':error.message);process.exitCode=1;});
