// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// One existing private clip; no microphone, network inference, or output control.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const exe=path.resolve('poc/private/tools/whisper-b5454-cuda-11.8.0/Release/whisper-cli.exe');
const args=['-m',path.resolve('poc/private/models/ggml-base.en.bin'),'-f',path.resolve('recordings/replay-private/REAL-PILOT-001-6.wav'),'-l','en','-t','4','-bs','1','-bo','1','-nt'];
let stderr='',stdout='';const start=performance.now();
const code=await new Promise((resolve,reject)=>{const p=spawn(exe,args,{cwd:path.dirname(exe),windowsHide:true,shell:false});const timer=setTimeout(()=>p.kill(),90000);p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.once('error',reject);p.once('close',code=>{clearTimeout(timer);resolve(code);});});
await fs.writeFile('recordings/gpu-comparison-private/backend-detail.private.txt',stderr);
console.log(JSON.stringify({code,elapsedMs:Math.round(performance.now()-start),transcriptNonempty:!!stdout.trim(),backendLines:stderr.split(/\r?\n/).filter(line=>/cuda|backend|gpu|device/i.test(line)).map(line=>line.replace(/[A-Z]:\\[^\r\n]+/gi,'[local path redacted]'))}));
