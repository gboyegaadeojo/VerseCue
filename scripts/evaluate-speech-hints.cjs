'use strict';
// Book-name hints A/B (NR-022): runs every labelled clip through whisper-cli with no hint and with each hint variant,
// then scores the recognised reference. Clips: a folder with labels.json [{file, expected}] (expected null = no reference),
// made by scripts/make-tts-check-audio.ps1 or saved from the in-app accuracy check. Silence and noise clips are added.
// Usage: node scripts/evaluate-speech-hints.cjs <whisper-cli> <model> <folder> [--out result.json]
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');const os=require('node:os');
const {parse}=require('../core/parser.cjs');const {wav,AUDIO_CONTEXT}=require('../core/stt.cjs');const {SPEECH_HINT}=require('../core/speech-hints.cjs');const VARIANTS={books:SPEECH_HINT};
const [engine,model,folder]=process.argv.slice(2);const outAt=process.argv.indexOf('--out');
if(!engine||!model||!folder)throw Error('Usage: evaluate-speech-hints.cjs <whisper-cli> <model> <folder> [--out result.json]');
const labels=JSON.parse(fs.readFileSync(path.join(folder,'labels.json'),'utf8').replace(/^\uFEFF/,''));
// Negatives without speech: silence and low noise, where a hint could make the engine invent words.
const extra=fs.mkdtempSync(path.join(os.tmpdir(),'vc-hints-'));let seed=7;const noise=()=>{seed=(seed*1103515245+12345)%2147483648;return (seed/2147483648-.5)*.02;};
fs.writeFileSync(path.join(extra,'silence.wav'),wav(new Array(48000).fill(0)));fs.writeFileSync(path.join(extra,'noise.wav'),wav(Array.from({length:48000},noise)));
const clips=[...labels.map(l=>({...l,path:path.join(folder,l.file)})),{file:'silence.wav',expected:null,path:path.join(extra,'silence.wav')},{file:'noise.wav',expected:null,path:path.join(extra,'noise.wav')}];
const variants={none:null,...VARIANTS};const results={};
for(const [name,prompt] of Object.entries(variants)){
  const rows=[];
  for(const clip of clips){
    const args=['-m',model,'-f',clip.path,'-l','en','-t','4','-bs','1','-bo','1','-ac',AUDIO_CONTEXT,'-nt','-np',...(prompt?['--prompt',prompt]:[])];
    const started=Date.now();const r=spawnSync(engine,args,{encoding:'utf8',windowsHide:true,timeout:60000});
    const text=(r.stdout||'').trim();const refs=parse(text,{defaultTranslation:'KJV',maxVerses:176}).references.filter(x=>x.valid!==false).map(x=>x.label);
    const outcome=clip.expected?(refs.length===1&&refs[0]===clip.expected?'correct':refs.length?'wrong':'missed'):(refs.length?'invented':'none');
    rows.push({file:clip.file,expected:clip.expected,heard:text.slice(0,200),references:refs,outcome,ms:Date.now()-started});
  }
  const count=o=>rows.filter(r=>r.outcome===o).length,refs=rows.filter(r=>r.expected).length;
  results[name]={correct:count('correct'),wrong:count('wrong'),missed:count('missed'),references:refs,invented:count('invented'),withoutReference:rows.length-refs,accuracy:Math.round(count('correct')/Math.max(1,refs)*1000)/10,rows};
  console.log(`${name.padEnd(7)} correct ${count('correct')}/${refs} (${results[name].accuracy}%) wrong ${count('wrong')} missed ${count('missed')} invented ${count('invented')}/${rows.length-refs}`);
}
fs.rmSync(extra,{recursive:true,force:true});
if(outAt>0)fs.writeFileSync(process.argv[outAt+1],JSON.stringify({schemaVersion:1,engine:path.basename(engine),model:path.basename(model),clips:clips.length,results},null,1));
