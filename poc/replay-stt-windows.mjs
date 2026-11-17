// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Finite three-clip file replay only. Cold CLI per window; no devices/network/output control.
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=new URL('../',import.meta.url),file=p=>fileURLToPath(new URL(p,root));
const model=file('poc/private/models/ggml-base.en.bin');
const exe=file('poc/private/tools/whisper-b5454/Release/whisper-cli.exe');
const hash=async(p,a)=>createHash(a).update(await readFile(p)).digest('hex');
if(await hash(model,'sha1')!=='137c40403d78fd54d454da0f9bd998f78703390c')throw new Error('Model checksum mismatch');
if(await hash(file('poc/private/tools/whisper-bin-x64.zip'),'sha256')!=='6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb')throw new Error('Tool archive checksum mismatch');
const dir=file('recordings/replay-private/');await mkdir(dir,{recursive:true});
const cases=[{id:'REAL-PILOT-001',clip:1,seconds:15,endProxy:9.8},{id:'REAL-PILOT-002',clip:2,seconds:18,endProxy:12.44},{id:'REAL-PILOT-004',clip:4,seconds:12,endProxy:10.72}];
function pcm(buffer) {
  if(buffer.toString('ascii',0,4)!=='RIFF'||buffer.toString('ascii',8,12)!=='WAVE')throw new Error('Expected WAV');
  let format,data;
  for(let p=12;p+8<=buffer.length;){const name=buffer.toString('ascii',p,p+4),n=buffer.readUInt32LE(p+4);if(name==='fmt ')format=buffer.subarray(p+8,p+8+n);if(name==='data')data=buffer.subarray(p+8,p+8+n);p+=8+n+(n%2);}
  if(!format||!data||format.readUInt16LE(0)!==1||format.readUInt16LE(2)!==1||format.readUInt32LE(4)!==16000||format.readUInt16LE(14)!==16)throw new Error('Expected PCM16 mono16kHz');
  return data;
}
function wav(data) {
  const h=Buffer.alloc(44);h.write('RIFF');h.writeUInt32LE(data.length+36,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(16000,24);h.writeUInt32LE(32000,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);return Buffer.concat([h,data]);
}
// Selected observed forms only, intentionally not a general production Bible parser.
function hint(text) {
  const t=text.toLowerCase();
  if(/\b[3-9]\s+samuel\b/.test(t))return {kind:'INVALID_ORDINAL'};
  if(/\bfor\s+samuel\b/.test(t))return {kind:'AMBIGUOUS_ORDINAL'};
  if(/\b(?:1|first|one)\s+samuel\b/.test(t)&&/chapter\s+(?:3|three)\b/.test(t))return {kind:/verses?\s+(?:1|one)\s+(?:to|through)\s+(?:10|ten)\b/.test(t)?'RANGE_PROPOSAL':'CHAPTER_ONLY',proposal:'1 Samuel 3',niv:/\bniv\b/.test(t)};
  if(/\bisaiah\b/.test(t)&&/chapter\s+(?:6|six)\b/.test(t))return {kind:/verses?\s+(?:1|one)\s+(?:to|through)\s+(?:8|eight)\b/.test(t)?'RANGE_PROPOSAL':'CHAPTER_ONLY',proposal:'Isaiah 6'};
  return {kind:'NO_SELECTED_COMPLETE_HINT'};
}
const runs=[],startedUtc=new Date().toISOString();
for(const c of cases) {
  const data=pcm(await readFile(file(`recordings/ifc-sample-0${c.clip}.private.wav`)));
  const totalEnd=Math.ceil((c.seconds+2)/2)*2,start=performance.now();
  let nextEnd=6,previousHint=null;
  while(nextEnd<=totalEnd) {
    const elapsed=(performance.now()-start)/1000,latest=Math.min(totalEnd,Math.floor(elapsed/2)*2);
    const skipped=Math.max(0,Math.floor((latest-nextEnd)/2));if(latest>nextEnd)nextEnd=latest;
    const waitMs=nextEnd*1000-(performance.now()-start);if(waitMs>0)await new Promise(r=>setTimeout(r,waitMs));
    const end=nextEnd,from=Math.max(0,end-12),samples=Buffer.alloc(Math.round((end-from)*32000));
    data.copy(samples,0,Math.round(from*32000),Math.min(data.length,Math.round(end*32000)));
    const stem=`${dir}${c.id}-${end}`,input=stem+'.wav';await writeFile(input,wav(samples));
    const begin=performance.now(),out=createWriteStream(stem+'.stdout.private.txt'),err=createWriteStream(stem+'.stderr.private.txt');
    const child=spawn(exe,['-m',model,'-f',input,'-t','4','-p','1','-ng','-l','en','-oj','-of',stem],{windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.pipe(out);child.stderr.pipe(err);
    let timeout=false;const timer=setTimeout(()=>{timeout=true;child.kill();},20000);
    const exit=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',resolve);});clearTimeout(timer);
    const decodeMs=Math.round(performance.now()-begin),completion=performance.now()-start;
    if(timeout||exit!==0)throw new Error(`Bounded replay failed for ${c.id}/${end}: timeout=${timeout},exit=${exit}`);
    const result=JSON.parse(await readFile(stem+'.json','utf8')),text=(result.transcription??[]).map(s=>s.text??'').join(' '),current=hint(text);
    const signature=JSON.stringify(current),repeat=Boolean(current.proposal)&&signature===previousHint;previousHint=signature;
    const row={case_id:c.id,audio_window_start_seconds:from,audio_window_end_seconds:end,padding_seconds:Math.max(0,end-c.seconds),skipped_scheduled_windows:skipped,decode_ms:decodeMs,completion_since_clip_start_ms:Math.round(completion),reference_end_proxy_seconds:c.endProxy,lag_from_unverified_end_proxy_ms:Math.round(completion-c.endProxy*1000),hint:current,repeated_hint_in_two_processed_windows:repeat,auto_eligible:false};runs.push(row);console.log(JSON.stringify(row));
    nextEnd=end+2;
  }
}
const sorted=runs.map(r=>r.decode_ms).sort((a,b)=>a-b),quantile=q=>sorted[Math.ceil(q*sorted.length)-1];
const summary={started_utc:startedUtc,finished_utc:new Date().toISOString(),source:'REAL-RECORDING',cases:cases.length,windows:runs.length,step_seconds:2,max_window_seconds:12,cpu_threads:4,gpu:false,cold_model_load_each_window:true,simulated_arrival:true,synthetic_silence_padding:true,decode_p50_ms:quantile(.5),decode_p95_ms:quantile(.95),skipped_scheduled_windows:runs.reduce((n,r)=>n+r.skipped_scheduled_windows,0),reference_ends_independently_verified:false,accuracy_scored:false,live_output_latency_measured:false,propresenter_requests:0,runs};
await writeFile(file('recordings/replay-private/summary.private.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({completed:true,...summary,runs:undefined},null,2));
