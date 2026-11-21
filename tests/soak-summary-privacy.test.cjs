'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fixture=()=>({
  started:'2026-11-19T00:00:00.000Z',version:'0.6.0',packageManifestSha256:'a'.repeat(64),
  completed:true,failure:false,interrupted:false,requestedMinutes:90,elapsedMs:90*60000,
  outputRequests:0,microphoneCapture:false,propresenterConnected:false,accuracyScored:false,liveLatencyScored:false,
  minimizedRequested:true,minimizedThroughout:true,cycles:1,
  rows:[{elapsedMs:89*60000,speechMs:5000,candidateCount:1,historyCount:20,eventCount:100}]
});

test('the CLI writes summaries under ignored test-results and prints only the local path',()=>{
  const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
  const {execFileSync}=require('node:child_process');
  const cwd=fs.mkdtempSync(path.join(os.tmpdir(),'versecue-soak-summary-'));
  try{
    fs.writeFileSync(path.join(cwd,'fixture.json'),JSON.stringify(fixture()));
    const stdout=execFileSync(process.execPath,[require.resolve('../scripts/summarize-soak.cjs'),'fixture.json'],{cwd,encoding:'utf8'}).trim();
    const expected=path.join('test-results','soak-summaries','development-soak-0.6.0-aaaaaaaa-20261119T000000000Z.json');
    assert.equal(stdout,expected);
    assert.equal(JSON.parse(fs.readFileSync(path.join(cwd,expected),'utf8')).fullServiceAcceptance,'PENDING');
    assert.equal(fs.existsSync(path.join(cwd,'docs')),false);
  }finally{fs.rmSync(cwd,{recursive:true,force:true});}
});
