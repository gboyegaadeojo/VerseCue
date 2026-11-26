'use strict';
// Copies a labels file from the recording labeller into a rehearsal stream, writing a NEW stream file.
// Usage: node scripts/apply-rehearsal-labels.cjs <stream.json> <labels.json> <new-stream-name.json>
// Stream names refer to test-results/auto-rehearsal/streams/. The stream's recognized text is never printed.
const fs=require('node:fs/promises'),path=require('node:path');
const {applyLabels,validateLabelFile,annotationSha256}=require('../core/rehearsal-labels.cjs');
const name=/^[A-Za-z0-9._-]{1,80}\.json$/;
(async()=>{
  const [streamName,labelsPath,outName]=process.argv.slice(2);
  if(!name.test(streamName??'')||!labelsPath||!name.test(outName??''))throw Error('Usage: node scripts/apply-rehearsal-labels.cjs <stream.json> <labels.json> <new-stream-name.json>');
  const dir=path.resolve(process.env.VERSECUE_REHEARSAL_DIR||path.join('test-results','auto-rehearsal','streams'));
  const labelsText=await fs.readFile(path.resolve(labelsPath),'utf8');
  const labelled=applyLabels(JSON.parse(await fs.readFile(path.join(dir,streamName),'utf8')),validateLabelFile(JSON.parse(labelsText)));
  await fs.writeFile(path.join(dir,outName),JSON.stringify(labelled),{flag:'wx'});
  const display=labelled.labels.filter(l=>l.intent==='display').length;
  console.log(JSON.stringify({written:true,labels:labelled.labels.length,display,mention:labelled.labels.length-display,dataUseAuthorized:labelled.dataUseAuthorized,labelsReviewed:labelled.labelsReviewed,annotationSha256:annotationSha256(labelsText),
    countsTowardTrustGate:labelled.source==='REAL-RECORDING'&&labelled.split==='held-out'&&labelled.dataUseAuthorized&&labelled.labelsReviewed}));
})().catch(error=>{console.error(error.code==='EEXIST'?'Refusing to overwrite an existing stream; choose a new name':error.message);process.exitCode=1;});
