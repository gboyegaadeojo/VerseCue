// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Read-only PE import-table inspection; does not load or execute DLLs.
import fs from 'node:fs/promises';
const b=await fs.readFile('poc/private/tools/whisper-b5454-cuda-11.8.0/Release/ggml-cuda.dll');
const pe=b.readUInt32LE(0x3c),count=b.readUInt16LE(pe+6),optional=pe+24,size=b.readUInt16LE(pe+20),magic=b.readUInt16LE(optional);
const directory=optional+(magic===0x20b?112:96);const importRva=b.readUInt32LE(directory+8);
function offset(rva){for(let i=0;i<count;i++){const s=optional+size+i*40,va=b.readUInt32LE(s+12),length=Math.max(b.readUInt32LE(s+8),b.readUInt32LE(s+16));if(rva>=va&&rva<va+length)return b.readUInt32LE(s+20)+rva-va;}throw new Error('Unmapped PE RVA');}
const names=[];for(let p=offset(importRva);b.readUInt32LE(p+12);p+=20){const start=offset(b.readUInt32LE(p+12));names.push(b.toString('ascii',start,b.indexOf(0,start)));}
console.log(JSON.stringify({component:'ggml-cuda.dll',importedLibraries:names}));
