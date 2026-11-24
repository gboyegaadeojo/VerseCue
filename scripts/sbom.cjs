'use strict';
// CycloneDX 1.5 software bill of materials (NFR-018, NFR-020), built only from the reviewed inventories
// already kept in legal/ and the pinned speech hashes. Deterministic: no timestamps or random serials.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),SBOM=path.join(root,'legal','sbom.cdx.json');
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8').replace(/^﻿/,''));
const purl=(name,version)=>'pkg:npm/'+name.replace('@','%40')+'@'+version;
function sriHex(integrity){const m=/^sha512-([A-Za-z0-9+/=]+)$/.exec(integrity??'');return m?Buffer.from(m[1],'base64').toString('hex'):null;}
function speechPins(){const text=fs.readFileSync(path.join(root,'scripts','bundle-local-speech.cjs'),'utf8'),hashes=[...text.matchAll(/!=='([a-f0-9]{64})'/g)].map(m=>m[1]);if(hashes.length!==3)throw Error('Expected three pinned speech hashes');return {archive:hashes[0],model:hashes[1],gpuModel:hashes[2]};}
function build(){
  const pkg=read('package.json'),inventory=read('legal/dependency-inventory.json'),fonts=read('legal/font-inventory.json'),pins=speechPins();
  const components=inventory.components.map(c=>{const hex=sriHex(c.integrity);return {type:'library','bom-ref':purl(c.name,c.version),name:c.name,version:c.version,purl:purl(c.name,c.version),licenses:[{license:{id:c.license}}],...(hex?{hashes:[{alg:'SHA-512',content:hex}]}:{}),
    // Electron's runtime ships inside every packaged build even though it is a development dependency of the source tree.
    scope:c.name==='electron'?'required':'excluded',properties:[{name:'versecue:developmentOnly',value:String(c.developmentOnly===true)},{name:'versecue:packagePath',value:c.packagePath}]};});
  for(const extra of fonts.additionalFamilies??[])for(const file of extra.files)components.push({type:'file','bom-ref':'file:'+file.file,name:path.basename(file.file),group:extra.family,licenses:[{license:{id:'OFL-1.1'}}],hashes:[{alg:'SHA-256',content:file.sha256}],scope:'required',externalReferences:[{type:'vcs',url:extra.source}],properties:[{name:'versecue:sourceCommit',value:extra.commit}]});
  for(const file of fonts.files)components.push({type:'file','bom-ref':'file:'+file.file,name:path.basename(file.file),group:fonts.family,licenses:[{license:{id:'OFL-1.1'}}],hashes:[{alg:'SHA-256',content:file.sha256}],scope:'required',externalReferences:[{type:'vcs',url:fonts.source}],properties:[{name:'versecue:sourceCommit',value:fonts.commit}]});
  // Bundled public-domain Bible wordings for quote recognition (legal/PUBLIC-DOMAIN-BIBLES.md).
  for(const name of ['quote-index-kjv.json','quote-index-web.json']){const file=path.join(root,'core','data',name),meta=JSON.parse(fs.readFileSync(file,'utf8'));components.push({type:'data','bom-ref':'data:core/data/'+name,name,description:meta.name,licenses:[{license:{name:'Public domain'}}],hashes:[{alg:'SHA-256',content:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}],scope:'required',externalReferences:[{type:'distribution',url:meta.source}],properties:[{name:'versecue:sourceSha256',value:meta.sourceSha256},{name:'versecue:passages',value:String(meta.passages.length)}]});}
  components.push({type:'application','bom-ref':'whisper.cpp-windows-x64',name:'whisper.cpp b5454 Windows x64 engine (Vulkan + CPU variants, built from official source in CI)',licenses:[{license:{id:'MIT'}}],hashes:[{alg:'SHA-256',content:pins.archive}],scope:'optional',properties:[{name:'versecue:bundledWith',value:'Windows builds with local speech'}]});
  components.push({type:'machine-learning-model','bom-ref':'ggml-base.en',name:'ggml-base.en.bin',licenses:[{license:{id:'MIT'}}],hashes:[{alg:'SHA-256',content:pins.model}],scope:'optional',properties:[{name:'versecue:bundledWith',value:'Windows builds with local speech'}]});
  components.push({type:'machine-learning-model','bom-ref':'ggml-large-v3-turbo-q5_0',name:'ggml-large-v3-turbo-q5_0.bin',licenses:[{license:{id:'MIT'}}],hashes:[{alg:'SHA-256',content:pins.gpuModel}],scope:'optional',properties:[{name:'versecue:bundledWith',value:'Builds with local speech; used on a working graphics chip (NR-025)'}]});
  const lock=inventory.lockfileSha256;
  return {bomFormat:'CycloneDX',specVersion:'1.5',version:1,serialNumber:'urn:uuid:'+uuidFrom(`${pkg.name}@${pkg.version}#${lock}`),
    metadata:{component:{type:'application','bom-ref':'versecue',name:pkg.productName??pkg.name,version:pkg.version,licenses:[{expression:'LicenseRef-VerseCue-Private'}]},properties:[{name:'versecue:lockfileSha256',value:lock},{name:'versecue:inventoryApplicationVersion',value:inventory.applicationVersion},{name:'versecue:limits',value:'Built from reviewed inventories; not a vulnerability scan or license clearance.'}]},
    components,dependencies:[{ref:'versecue',dependsOn:components.filter(c=>c.scope!=='excluded').map(c=>c['bom-ref'])}]};
}
function uuidFrom(text){const h=crypto.createHash('sha256').update(text).digest('hex');return [h.slice(0,8),h.slice(8,12),'5'+h.slice(13,16),((parseInt(h[16],16)&3)|8).toString(16)+h.slice(17,20),h.slice(20,32)].join('-');}
const serialize=bom=>JSON.stringify(bom,null,2)+'\n';
function verify(){const expected=serialize(build());let actual=null;try{actual=fs.readFileSync(SBOM,'utf8').replace(/\r\n/g,'\n');}catch{}if(actual!==expected)throw Error('legal/sbom.cdx.json is missing or stale; run node scripts/sbom.cjs --write');}
if(require.main===module){if(process.argv.includes('--write')){fs.writeFileSync(SBOM,serialize(build()));console.log('Wrote legal/sbom.cdx.json');}else{verify();console.log('SBOM matches the reviewed inventories.');}}
module.exports={build,verify,serialize};
