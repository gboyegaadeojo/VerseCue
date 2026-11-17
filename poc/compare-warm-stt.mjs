// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Compare the same eight private windows with a model kept loaded. Loopback only.
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url),file=p=>fileURLToPath(new URL(p,root));
if(process.argv.slice(2).some(a=>a!=='--beam1'))throw new Error('Only the optional fixed --beam1 comparison is allowed');
const fast=process.argv.includes('--beam1'),beam=fast?1:5,variant=fast?'beam1':'beam5',suffix=fast?'.warm-beam1.private.json':'.warm.private.json';
const digest=async(p,a)=>createHash(a).update(await readFile(p)).digest('hex');
const model=file('poc/private/models/ggml-base.en.bin'),archive=file('poc/private/tools/whisper-bin-x64.zip');
if(await digest(model,'sha1')!=='137c40403d78fd54d454da0f9bd998f78703390c'||await digest(archive,'sha256')!=='6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb')throw new Error('Diagnostic integrity mismatch');
const baseline=JSON.parse(await readFile(file('recordings/replay-private/summary.private.json'),'utf8'));
const ids=new Set(['REAL-PILOT-001','REAL-PILOT-002','REAL-PILOT-004']);
if(baseline.runs.length!==8||baseline.runs.some(r=>!ids.has(r.case_id)||!Number.isInteger(r.audio_window_end_seconds)||r.audio_window_end_seconds<6||r.audio_window_end_seconds>20))throw new Error('Unexpected fixed replay fixture set');
const port=58173,base=`http://127.0.0.1:${port}`;
// Refuse an occupied port. Never reuse an unrelated local service.
await new Promise((resolve,reject)=>{const s=createServer();s.once('error',reject);s.listen(port,'127.0.0.1',()=>s.close(resolve));});
await mkdir(file('poc/private/empty-server-public'),{recursive:true});
const out=createWriteStream(file(`recordings/replay-private/warm-server-${variant}.stdout.private.txt`)),err=createWriteStream(file(`recordings/replay-private/warm-server-${variant}.stderr.private.txt`));
const start=performance.now(),startedUtc=new Date().toISOString();
// Pinned server source defaults no_context=true; this binary does not accept -nc.
const child=spawn(file('poc/private/tools/whisper-b5454/Release/whisper-server.exe'),['--host','127.0.0.1','--port',String(port),'--public',file('poc/private/empty-server-public'),'-m',model,'-t','4','-p','1','-ng','-l','en','-bs',String(beam),'-bo',String(beam)],{windowsHide:true,stdio:['ignore','pipe','pipe']});
child.stdout.pipe(out);child.stderr.pipe(err);let childClosed=false;child.once('close',()=>{childClosed=true;});
const closed=new Promise(resolve=>child.once('close',resolve)),deadline=setTimeout(()=>child.kill(),180000);
function hint(text) {
  const t=text.toLowerCase();if(/\b[3-9]\s+samuel\b/.test(t))return {kind:'INVALID_ORDINAL'};
  if(/\bfor\s+samuel\b/.test(t))return {kind:'AMBIGUOUS_ORDINAL'};
  if(/\b(?:1|first|one)\s+samuel\b/.test(t)&&/chapter\s+(?:3|three)\b/.test(t))return {kind:/verses?\s+(?:1|one)\s+(?:to|through)\s+(?:10|ten)\b/.test(t)?'RANGE_PROPOSAL':'CHAPTER_ONLY',proposal:'1 Samuel 3',niv:/\bniv\b/.test(t)};
  if(/\bisaiah\b/.test(t)&&/chapter\s+(?:6|six)\b/.test(t))return {kind:/verses?\s+(?:1|one)\s+(?:to|through)\s+(?:8|eight)\b/.test(t)?'RANGE_PROPOSAL':'CHAPTER_ONLY',proposal:'Isaiah 6'};
  return {kind:'NO_SELECTED_COMPLETE_HINT'};
}
const runs=[];let summary;
try {
  let ready=false;while(performance.now()-start<20000&&!childClosed){try{await fetch(base+'/',{redirect:'error',signal:AbortSignal.timeout(300)});ready=true;break;}catch{}await new Promise(r=>setTimeout(r,100));}
  if(!ready||childClosed)throw new Error('Owned loopback diagnostic server did not become ready');
  const startupMs=Math.round(performance.now()-start);
  for(const r of baseline.runs){
    if(childClosed)throw new Error('Owned server exited before upload');
    const stem=`${r.case_id}-${r.audio_window_end_seconds}`,wav=await readFile(file(`recordings/replay-private/${stem}.wav`));
    const body=new FormData();body.set('file',new Blob([wav],{type:'audio/wav'}),'window.wav');body.set('response_format','json');body.set('language','en');body.set('temperature','0.0');body.set('temperature_inc','0.2');
    const begin=performance.now(),response=await fetch(base+'/inference',{method:'POST',body,redirect:'error',signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`Loopback inference rejected: ${response.status}`);
    const data=await response.json(),requestMs=Math.round(performance.now()-begin);
    await writeFile(file(`recordings/replay-private/${stem}${suffix}`),JSON.stringify(data));
    const text=data.text??(data.transcription??data.segments??[]).map(s=>s.text??'').join(' ');
    const row={case_id:r.case_id,audio_window_end_seconds:r.audio_window_end_seconds,variant,cold_cli_ms:r.decode_ms,warm_request_ms:requestMs,hint:hint(text),auto_eligible:false};runs.push(row);console.log(JSON.stringify(row));
  }
  const times=runs.map(r=>r.warm_request_ms).sort((a,b)=>a-b),q=p=>times[Math.ceil(times.length*p)-1];
  summary={started_utc:startedUtc,finished_utc:new Date().toISOString(),windows:runs.length,startup_ms:startupMs,model_kept_loaded:true,server_host:'127.0.0.1',cpu_threads:4,gpu:false,beam_size:beam,best_of:beam,cross_request_context:false,back_to_back_windows_not_realtime:true,request_p50_ms:q(.5),request_p95_ms:q(.95),accuracy_scored:false,live_output_latency_measured:false,propresenter_requests:0,runs};
} finally {
  clearTimeout(deadline);if(!childClosed)child.kill();await Promise.race([closed,new Promise(r=>setTimeout(r,3000))]);
  if(!childClosed)throw new Error('Diagnostic server cleanup did not complete');
}
summary.server_stopped=true;await writeFile(file(fast?'recordings/replay-private/warm-beam1-summary.private.json':'recordings/replay-private/warm-summary.private.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({...summary,runs:undefined},null,2));
