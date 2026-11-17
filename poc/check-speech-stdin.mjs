// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// One authorized existing WAV through a closed stdin pipe; no new audio file.
import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';
const exe=path.resolve('poc/private/tools/whisper-b5454/Release/whisper-cli.exe');const wav=await fs.readFile('recordings/replay-private/REAL-PILOT-001-12.wav');
const start=performance.now();let stdout='',stderr='',timeout=false;
const code=await new Promise((resolve,reject)=>{const p=spawn(exe,['-m',path.resolve('poc/private/models/ggml-base.en.bin'),'-f','-','-l','en','-t','4','-ng','-bs','1','-bo','1','-nt','-np'],{windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});const timer=setTimeout(()=>{timeout=true;p.kill();},45000);p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.stdin.on('error',()=>{});p.once('error',reject);p.once('close',code=>{clearTimeout(timer);resolve(code);});p.stdin.end(wav);});
await fs.writeFile('recordings/gpu-comparison-private/stdin-check.private.txt',JSON.stringify({stdout,stderr}));console.log(JSON.stringify({code,elapsedMs:Math.round(performance.now()-start),timedOut:timeout,transcriptNonempty:!!stdout.trim(),stdinReadReported:/read \d+ bytes/.test(stderr),outputRequests:0,microphoneCapture:false}));
