'use strict';
// Every fixture is synthetic. REAL-RECORDING enum values exercise schema guards only.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{createHash,randomUUID}=require('node:crypto'),{spawnSync}=require('node:child_process');
const {evaluateRecognition,proportion}=require('../scripts/recognition-evaluation.cjs'),{writeReport}=require('../scripts/score-recognition.cjs');
const sha=value=>createHash('sha256').update(value).digest('hex'),ref=(reference='John 3:16',translation='KJV')=>({reference,translation});
const row=(id,expected=[ref()],predicted=[ref()],extra={})=>({id,source:'SYNTHETIC-TEXT',split:'held-out',expected,predicted,...extra});
const dataset=cases=>({schemaVersion:1,datasetId:'SYNTHETIC-DATASET',experimentId:'SYNTHETIC-EXPERIMENT',cases});
const real=id=>({source:'REAL-RECORDING',recordingId:'recording-'+id,audioSha256:sha('audio-'+id),durationSeconds:12,dataUseAuthorized:true,labelsReviewed:true,annotationSha256:sha('labels-'+id)});
async function fixture(run){const temp=await fs.realpath(os.tmpdir()),parent=await fs.mkdtemp(path.join(temp,'versecue-score-test-'));try{await run(parent);}finally{assert.equal(path.dirname(parent),temp);assert.ok(path.basename(parent).startsWith('versecue-score-test-'));await fs.rm(parent,{recursive:true,force:true});}}
test('exact clip counts include missed references, spurious proposals and correct negative clips',()=>{
 const result=evaluateRecognition(dataset([row('correct',[ref(),ref('Romans 8:28')],[ref(),ref('Romans 8:28')]),row('missed',[ref('Genesis 1:1')],[]),row('false-positive',[],[ref('not a citation')]),row('negative',[],[])]));const g=result.groups[0];
 assert.deepEqual([g.reference.truePositives,g.reference.falsePositives,g.reference.falseNegatives],[2,1,1]);assert.equal(g.reference.precision.value,2/3);assert.equal(g.reference.recall.value,2/3);assert.equal(g.trueNegativeClips,1);assert.equal(result.serviceAcceptancePassed,false);assert.equal(result.falsePositivesPerSermonHour,null);assert.equal(result.audibleEndOutputLatencyMeasured,false);
});
test('translation disagreement and ordering cannot disappear into reference-only agreement',()=>{
 const result=evaluateRecognition(dataset([row('edition',[ref()],[ref('John 3:16','NIV')]),row('order',[ref(),ref('Romans 8:28')],[ref('Romans 8:28'),ref()])]));const g=result.groups[0];assert.equal(g.reference.truePositives,3);assert.equal(g.referenceAndTranslation.truePositives,2);assert.equal(g.referenceAndTranslation.falsePositives,1);assert.equal(g.referenceAndTranslation.falseNegatives,1);assert.equal(g.exactSequenceAgreement.value,0);
});
test('duplicate predictions count as extra proposals rather than multiple matches',()=>{const g=evaluateRecognition(dataset([row('duplicate',[ref()],[ref(),ref()])])).groups[0];assert.equal(g.reference.truePositives,1);assert.equal(g.reference.falsePositives,1);assert.equal(g.reference.precision.value,.5);});
test('synthetic and tuning successes cannot inflate real held-out results',()=>{
 const cases=Array.from({length:20},(_,i)=>row('synthetic-'+i));cases.push(row('real-tuning',[ref()],[ref()],{...real('tuning'),split:'tuning'}),row('real-held',[ref()],[ref('Romans 8:28')],real('held')));
 const result=evaluateRecognition(dataset(cases));assert.equal(result.realHeldOut.scoredClips,1);assert.equal(result.realHeldOut.reference.precision.value,0);assert.equal(result.realHeldOut.reference.recall.value,0);assert.equal(result.groups.length,3);assert.equal(result.groundTruthVerifiedByTool,false);
});
test('real data requires authorization and unreviewed labels remain unscored',()=>{
 assert.throws(()=>evaluateRecognition(dataset([row('no-consent',[],[],{...real('a'),dataUseAuthorized:false})])),/authorization/);
 const result=evaluateRecognition(dataset([row('unreviewed',[ref()],[ref()],{...real('b'),labelsReviewed:false,annotationSha256:undefined})]));assert.equal(result.realHeldOut.scoredClips,0);assert.equal(result.realHeldOut.reference.precision.value,null);assert.deepEqual(result.excluded,[{id:'unreviewed',reason:'REAL_LABELS_NOT_REVIEWED'}]);
 assert.throws(()=>evaluateRecognition(dataset([row('no-artifact',[ref()],[ref()],{...real('c'),annotationSha256:undefined})])),/artifact/);
});
test('duplicate audio and recording leakage across splits are rejected',()=>{
 assert.throws(()=>evaluateRecognition(dataset([row('a',[],[],real('a')),row('b',[],[],{...real('b'),audioSha256:sha('audio-a')})])),/Duplicate audio/);
 assert.throws(()=>evaluateRecognition(dataset([row('a',[],[],{...real('a'),recordingId:'same-recording'}),row('b',[],[],{...real('b'),recordingId:'same-recording',split:'training'})])),/source recording/);
});
test('schema rejects accidental transcript fields, nonstring IDs and malformed expected labels',()=>{
 assert.throws(()=>evaluateRecognition({...dataset([row('a')]),datasetId:12}),/identifiers/);assert.throws(()=>evaluateRecognition(dataset([row('a'),row('a')])) ,/unique/);
 assert.throws(()=>evaluateRecognition(dataset([{...row('a'),transcript:'SYNTHETIC PRIVATE SENTINEL'}])),error=>/Invalid case/.test(error.message)&&!error.message.includes('SENTINEL'));
 assert.throws(()=>evaluateRecognition(dataset([row('a',[ref('Gen 1:1')])])),/canonical citation/);assert.throws(()=>evaluateRecognition(dataset([row('a',[],[],{durationSeconds:12})])),/Synthetic text/);
 const result=evaluateRecognition(dataset([row('unknown-numbering',[ref('Genesis 1:31-2:3','NIV')],[ref('Genesis 1:31-2:3','NIV')])]));assert.equal(result.groups[0].reference.precision.value,1);assert.match(result.matching,/Verse existence/);assert.ok(!JSON.stringify(result).includes('Genesis 1:31'));
});
test('empty evidence is null and a single success retains a wide nominal interval',()=>{
 assert.deepEqual(proportion(0,0),{successes:0,total:0,value:null,wilson95:null});const p=proportion(1,1);assert.equal(p.value,1);assert.ok(Math.abs(p.wilson95.lower-.2065493144)<1e-8);assert.equal(p.wilson95.upper,1);assert.throws(()=>proportion(2,1),/Invalid/);
 const g=evaluateRecognition(dataset([row('negative',[],[])])).groups[0];assert.equal(g.reference.precision.value,null);assert.equal(g.reference.recall.value,null);
});
test('reports stay in a private directory without overwrite, traversal or linked parents',()=>fixture(async parent=>{
 const root=path.join(parent,'repo');await fs.mkdir(root);const report=evaluateRecognition(dataset([row('a')]));await writeReport('result.json',report,root);const file=path.join(root,'test-results','recognition-evaluation','result.json');assert.equal(JSON.parse(await fs.readFile(file,'utf8')).serviceAcceptancePassed,false);
 await assert.rejects(writeReport('result.json',report,root),error=>error.code==='EEXIST');for(const name of ['../public.json','NUL.json','COM1.data.json','folder/output.json'])await assert.rejects(writeReport(name,report,root),/plain JSON/);
 const linkedRoot=path.join(parent,'linked-repo'),foreign=path.join(parent,'foreign');await fs.mkdir(linkedRoot);await fs.mkdir(foreign);await fs.writeFile(path.join(foreign,'witness'),'KEEP');await fs.symlink(foreign,path.join(linkedRoot,'test-results'),process.platform==='win32'?'junction':'dir');await assert.rejects(writeReport('result.json',report,linkedRoot),/not be linked/);assert.deepEqual(await fs.readdir(foreign),['witness']);
}));
test('CLI writes a new private report and prints no case content or dataset paths',()=>fixture(async parent=>{
 const input=path.join(parent,'dataset.json'),name='synthetic-'+randomUUID()+'.json',output=path.resolve('test-results','recognition-evaluation',name);await fs.writeFile(input,'\uFEFF'+JSON.stringify(dataset([row('private-case-id')])));
 try{const result=spawnSync(process.execPath,[path.resolve('scripts/score-recognition.cjs'),input,name],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).scoredRealHeldOutClips,0);assert.ok(!result.stdout.includes('private-case-id'));assert.ok(!result.stdout.includes(parent));const report=JSON.parse(await fs.readFile(output,'utf8'));assert.equal(report.realHeldOut.reference.precision.value,null);assert.equal(report.datasetSha256,sha(await fs.readFile(input)));}finally{await fs.unlink(output).catch(error=>{if(error.code!=='ENOENT')throw error;});}
}));
