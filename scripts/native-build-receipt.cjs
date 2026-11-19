'use strict';
const {createHash}=require('node:crypto');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function verifyNativeBuild(receipt,source,helper){
 const keys=['schemaVersion','sourcePath','sourceSha256','helperSha256','compiler','platform','arch'];
 if(!receipt||typeof receipt!=='object'||Array.isArray(receipt)||Object.keys(receipt).length!==keys.length||Object.keys(receipt).some(key=>!keys.includes(key))||receipt.schemaVersion!==1||receipt.sourcePath!=='native/windows/BibleBridge.cs'||receipt.compiler!=='Microsoft.NET Framework csc'||receipt.platform!=='win32'||receipt.arch!=='x64'||!Buffer.isBuffer(source)||!Buffer.isBuffer(helper)||!source.length||!helper.length||!/^[a-f0-9]{64}$/.test(receipt.sourceSha256)||!/^[a-f0-9]{64}$/.test(receipt.helperSha256))throw Error('Invalid Windows helper build receipt');
 if(sha(source)!==receipt.sourceSha256)throw Error('Windows helper was not built from the current source');
 if(sha(helper)!==receipt.helperSha256)throw Error('Windows helper bytes do not match the build receipt');
 return {sourceSha256:receipt.sourceSha256,helperSha256:receipt.helperSha256};
}
module.exports={verifyNativeBuild,sha};
