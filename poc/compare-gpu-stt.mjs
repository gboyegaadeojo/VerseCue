// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Finite local CPU/CUDA comparison. No microphone, network inference or PP calls.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=process.cwd();
const cpu=path.resolve('poc/private/tools/whisper-b5454/Release/whisper-cli.exe');
const gpu=path.resolve('poc/private/tools/whisper-b5454-cuda-11.8.0/Release/whisper-cli.exe');
const model=path.resolve('poc/private/models/ggml-base.en.bin');
const privateDir=path.resolve('recordings/gpu-comparison-private');await fs.mkdir(privateDir,{recursive:true});
for(const [file,expected] of [
  ['poc/private/tools/whisper-b5454-cuda-11.8.0-x64.zip','e81c86c542be6e3d7b7245392d4e1c52ab6e5c61dbe38721754bc0ab59d4d027'],
  ['poc/private/tools/whisper-bin-x64.zip','6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb'],
  ['poc/private/models/ggml-base.en.bin','a03779c86df3323075f5e796cb2ce5029f00ec8869eee3fdfb897afe36c6d002']
]){const hash=createHash('sha256').update(await fs.readFile(file)).digest('hex');if(hash!==expected)throw new Error('Pinned diagnostic asset digest mismatch');}
const ids=['REAL-PILOT-001-6','REAL-PILOT-001-12','REAL-PILOT-002-12','REAL-PILOT-004-14'];
const rows=[];const started=new Date().toISOString();
for(const backend of ['cpu','cuda'])for(const id of ids){
  const wav=path.resolve('recordings/replay-private',id+'.wav');const bytes=await fs.readFile(wav);if(bytes.toString('ascii',0,4)!=='RIFF')throw new Error('Expected existing private WAV');
  const executable=backend==='cpu'?cpu:gpu;const args=['-m',model,'-f',wav,'-l','en','-t','4','-bs','1','-bo','1','-nt','-np',...(backend==='cpu'?['-ng']:[])];
  const start=performance.now();let stdout='',stderr='',timedOut=false;
  const exitCode=await new Promise((resolve,reject)=>{
    const child=spawn(executable,args,{cwd:path.dirname(executable),windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
    const timer=setTimeout(()=>{timedOut=true;child.kill();},20000);
    child.stdout.on('data',b=>{stdout+=b.toString();if(stdout.length>65536)child.kill();});child.stderr.on('data',b=>{stderr+=b.toString();if(stderr.length>131072)child.kill();});
    child.once('error',error=>{clearTimeout(timer);reject(error);});child.once('close',code=>{clearTimeout(timer);resolve(code);});
  });
  const elapsedMs=Math.round(performance.now()-start);
  await fs.writeFile(path.join(privateDir,`${id}.${backend}.stdout.private.txt`),stdout);await fs.writeFile(path.join(privateDir,`${id}.${backend}.stderr.private.txt`),stderr);
  const row={id,backend,elapsedMs,exitCode,timedOut,transcriptNonempty:Boolean(stdout.trim()),transcriptSha256:createHash('sha256').update(stdout).digest('hex'),cudaDeviceReported:/ggml_cuda_init|CUDA0|CUDA :|CUDA backend/i.test(stderr),accuracyScored:false,liveLatencyScored:false};rows.push(row);console.log(JSON.stringify(row));
  await fs.writeFile(path.join(privateDir,'summary.private.json'),JSON.stringify({started,finished:new Date().toISOString(),model:'base.en',threads:4,beamSize:1,rows,outputRequests:0,microphoneCapture:false},null,2));
}
await fs.mkdir(path.resolve('docs/evidence'),{recursive:true});
await fs.writeFile(path.resolve('docs/evidence/gpu-stt-comparison.json'),JSON.stringify({started,finished:new Date().toISOString(),hardware:{cpu:'AMD Ryzen 7 4800HS',physicalCores:8,logicalProcessors:16,ramBytes:16556568576,gpu:'NVIDIA GeForce RTX 2060 with Max-Q Design',gpuMemoryMiB:6144,driver:'610.88'},model:'base.en',whisperBuild:'b5454',cudaArchive:'11.8.0',threads:4,beamSize:1,rows,outputRequests:0,microphoneCapture:false,limitations:['Cold CLI per window, not streaming','No independent real-audio labels','Uncontrolled shared-host background load','No audience output or physical latency observation']},null,2)+'\n');
