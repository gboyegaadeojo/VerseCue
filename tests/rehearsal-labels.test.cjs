'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const L=require('../core/rehearsal-labels.cjs');
const {rehearse}=require('../core/auto-rehearsal.cjs');
const hash='a'.repeat(64);
const base={recordingId:'SERMON-1',audioSha256:hash,durationSeconds:120};

test('typed references become canonical single verse references',()=>{
  assert.deepEqual(L.canonicalReference('jn 3 16','KJV'),{ok:true,reference:'John 3:16',translation:'KJV'});
  assert.deepEqual(L.canonicalReference('Romans 8:28 NIV','KJV'),{ok:true,reference:'Romans 8:28',translation:'NIV'});
  assert.equal(L.canonicalReference('1st John 1:9','NKJV').reference,'1 John 1:9');
  assert.match(L.canonicalReference('Psalm 23','KJV').error,/Add a verse/);
  assert.match(L.canonicalReference('John 3:16 and Romans 8:28','KJV').error,/one reference/);
  assert.match(L.canonicalReference('hello there','KJV').error,/does not recognise/);
  assert.match(L.canonicalReference('','KJV').error,/Type the reference/);
});

test('labels file is sorted, rounded and defaults both attestations to false',()=>{
  const file=L.createLabelFile({...base,labels:[{atSeconds:50.06,reference:'John 3:16',translation:'KJV',intent:'display'},{atSeconds:10,reference:'Romans 8:28',translation:'NIV',intent:'mention'}]});
  assert.equal(file.dataUseAuthorized,false);assert.equal(file.labelsReviewed,false);
  assert.deepEqual(file.labels.map(l=>l.atSeconds),[10,50.1]);
  assert.deepEqual(L.validateLabelFile(JSON.parse(L.serialize({...file}))),file);
});

test('labels file rejects transcripts, bad times, non-canonical spellings and bad IDs',()=>{
  const ok={schemaVersion:1,kind:'versecue-rehearsal-labels',...base,dataUseAuthorized:false,labelsReviewed:false,labels:[]};
  assert.throws(()=>L.validateLabelFile({...ok,transcript:'turn to John'}),/Unknown labels field/);
  assert.throws(()=>L.validateLabelFile({...ok,labels:[{atSeconds:500,reference:'John 3:16',translation:'KJV',intent:'display'}]}),/outside/);
  assert.throws(()=>L.validateLabelFile({...ok,labels:[{atSeconds:5,reference:'jn 3 16',translation:'KJV',intent:'display'}]}),/canonical/);
  assert.throws(()=>L.validateLabelFile({...ok,labels:[{atSeconds:5,reference:'John 3:16',translation:'KJV',intent:'shown'}]}),/Invalid label fields/);
  assert.throws(()=>L.validateLabelFile({...ok,labels:[{atSeconds:5,reference:'John 3:16',translation:'KJV',intent:'display',text:'x'}]}),/Invalid label/);
  assert.throws(()=>L.validateLabelFile({...ok,recordingId:'../x'}),/Recording ID/);
  assert.throws(()=>L.validateLabelFile({...ok,audioSha256:'abc'}),/fingerprint/);
});

test('applying labels keeps the windows untouched and refuses mismatched or already-labelled streams',()=>{
  const windows=[{endSeconds:20,durationSeconds:5,text:'turn to John 3:16',endEvidence:'silence',elapsedMs:400,droppedSamples:0}];
  const stream={schemaVersion:1,recordingId:'SERMON-1',source:'REAL-RECORDING',split:'held-out',durationSeconds:120.4,dataUseAuthorized:false,labelsReviewed:false,windows,labels:[]};
  const file=L.createLabelFile({...base,dataUseAuthorized:true,labelsReviewed:true,labels:[{atSeconds:19,reference:'John 3:16',translation:'KJV',intent:'display'}]});
  const out=L.applyLabels(stream,file);
  assert.equal(out.windows,windows);assert.equal(out.labels.length,1);assert.equal(out.dataUseAuthorized,true);assert.equal(out.labelsReviewed,true);assert.equal(stream.labels.length,0);
  assert.throws(()=>L.applyLabels({...stream,recordingId:'OTHER'},file),/different recording ID/);
  assert.throws(()=>L.applyLabels({...stream,durationSeconds:300},file),/different length/);
  assert.throws(()=>L.applyLabels(out,file),/already has labels/);
});

test('applied labels are accepted and scored by the Auto rehearsal',async()=>{
  const windows=[{endSeconds:20,durationSeconds:5,text:'Please show John chapter three verse sixteen.',endEvidence:'silence',elapsedMs:400,droppedSamples:0},{endSeconds:60,durationSeconds:5,text:'And so we give thanks.',endEvidence:'silence',elapsedMs:400,droppedSamples:0}];
  const stream={schemaVersion:1,recordingId:'SERMON-1',source:'SYNTHETIC-TEXT',split:'held-out',durationSeconds:120,dataUseAuthorized:false,labelsReviewed:false,windows,labels:[]};
  const file=L.createLabelFile({...base,labels:[{atSeconds:19.5,reference:'John 3:16',translation:'KJV',intent:'display'}]});
  const report=await rehearse([L.applyLabels(stream,file)]);
  assert.equal(report.recordings[0].displayLabels,1);
  assert.equal(report.recordings[0].correctAutomaticSends,1);assert.equal(report.recordings[0].wrongOutputs,0);
  assert.equal(report.recordings[0].eligibleForGate,false);
});

test('WAV length is read from the header',()=>{
  const data=32000,bytes=Buffer.alloc(44+data);bytes.write('RIFF',0,'ascii');bytes.writeUInt32LE(36+data,4);bytes.write('WAVE',8,'ascii');bytes.write('fmt ',12,'ascii');bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(16000,24);bytes.writeUInt32LE(32000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36,'ascii');bytes.writeUInt32LE(data,40);
  assert.equal(L.wavDurationSeconds(bytes),1);
  assert.equal(L.wavDurationSeconds(Buffer.from('not a wav file at all, definitely not one, no')),null);
});
