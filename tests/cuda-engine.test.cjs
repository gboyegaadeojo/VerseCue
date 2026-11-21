'use strict';
// Guided NVIDIA engine setup: pinned digests, no download, card check reads the engine's own report.
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const crypto=require('node:crypto');const {EventEmitter}=require('node:events');const {spawnSync}=require('node:child_process');
const {OFFICIAL,identify,installCudaEngine,checkCudaEngine,REQUIRED}=require('../core/cuda-engine.cjs');
const digest=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
test('pins the two official archives and refuses anything else',async()=>{
  assert.equal(OFFICIAL.whisper.sha256,'e81c86c542be6e3d7b7245392d4e1c52ab6e5c61dbe38721754bc0ab59d4d027');
  assert.equal(OFFICIAL.cublas.sha256,'67b0934a6359e4ee26fff823c356021589d392c4fd49ca12624f570edc08e2b9');
  assert.match(OFFICIAL.whisper.page,/^https:\/\/github\.com\/ggml-org\/whisper\.cpp\//);assert.match(OFFICIAL.cublas.page,/^https:\/\/developer\.download\.nvidia\.com\//);
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'vc-cuda-'));try{
    const a=path.join(dir,'a.zip'),b=path.join(dir,'b.zip');await fs.writeFile(a,'one');await fs.writeFile(b,'two');
    await assert.rejects(identify([a,b]),/does not match/);await assert.rejects(identify([a]),/both/);
    const table={whisper:{sha256:digest('one')},cublas:{sha256:digest('two')}};
    assert.deepEqual(await identify([b,a],table),{whisper:a,cublas:b});
    await assert.rejects(identify([a,a],table),/one whisper.cpp/);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('installs into the app folder with cuBLAS beside whisper-cli (Windows tar)',{skip:process.platform!=='win32'},async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'vc-cuda-'));const tar=path.join(process.env.SystemRoot,'System32','tar.exe');
  try{
    const w=path.join(dir,'w','Release'),c=path.join(dir,'c','libcublas-archive','bin');await fs.mkdir(w,{recursive:true});await fs.mkdir(c,{recursive:true});
    for(const name of REQUIRED.filter(n=>!n.startsWith('cublas')))await fs.writeFile(path.join(w,name),name);
    for(const name of ['cublas64_11.dll','cublasLt64_11.dll'])await fs.writeFile(path.join(c,name),name);
    const wz=path.join(dir,'whisper.zip'),cz=path.join(dir,'cublas.zip');
    assert.equal(spawnSync(tar,['-a','-cf',wz,'-C',path.join(dir,'w'),'Release']).status,0);assert.equal(spawnSync(tar,['-a','-cf',cz,'-C',path.join(dir,'c'),'libcublas-archive']).status,0);
    const table={whisper:{label:'w',sha256:digest(await fs.readFile(wz))},cublas:{label:'c',sha256:digest(await fs.readFile(cz))}};
    const root=path.join(dir,'engines');const r=await installCudaEngine([cz,wz],{root,official:table});
    assert.equal(r.executable,path.join(root,'whisper-b5454-cuda-11.8.0','whisper-cli.exe'));
    for(const name of REQUIRED)await fs.access(path.join(r.folder,name));
    const receipt=JSON.parse(await fs.readFile(path.join(r.folder,'versecue-engine.json'),'utf8'));assert.match(receipt.note,/Not redistributed/);
    assert.deepEqual((await fs.readdir(root)).sort(),['whisper-b5454-cuda-11.8.0']);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('refuses to install on a Mac',async()=>{await assert.rejects(installCudaEngine([],{root:path.resolve('x'),platform:'darwin'}),/Windows/);});
function fakeEngine(stderr,code=0){return ()=>{const child=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{};setImmediate(()=>{child.stderr.emit('data',Buffer.from(stderr));child.emit('close',code);});return child;};}
test('card check accepts only a loaded CUDA backend and explains failures plainly',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'vc-cuda-'));const exe=path.join(dir,'whisper-cli.exe');
  try{
    const ok=await checkCudaEngine(exe,'model.bin',{spawnImpl:fakeEngine('ggml_cuda_init: found 1 CUDA devices:\n  Device 0: NVIDIA GeForce RTX 4070, compute capability 8.9\nload_backend: loaded CUDA backend from x\n')});
    assert.equal(ok.ok,true);assert.equal(ok.device,'NVIDIA GeForce RTX 4070');
    const none=await checkCudaEngine(exe,'model.bin',{spawnImpl:fakeEngine('no GPU found\nload_backend: loaded CPU backend\n')});assert.equal(none.ok,false);assert.match(none.reason,/No NVIDIA graphics card/);
    const old=await checkCudaEngine(exe,'model.bin',{spawnImpl:fakeEngine('CUDA error: CUDA driver version is insufficient for CUDA runtime version\n',1)});assert.match(old.reason,/driver .* too old/);
    const crashed=await checkCudaEngine(exe,'model.bin',{spawnImpl:fakeEngine('ggml_cuda_init: found 1 CUDA devices:\nloaded CUDA backend\n',3)});assert.equal(crashed.ok,false);
    assert.deepEqual((await fs.readdir(dir)),[]);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
