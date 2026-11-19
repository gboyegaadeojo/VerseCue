'use strict';
// Tiny generated color-grid PNG fixture, not Scripture or a captured screenshot.
const {deflateSync}=require('node:zlib');
const crc=bytes=>{let value=0xffffffff;for(const byte of bytes){value^=byte;for(let bit=0;bit<8;bit++)value=(value>>>1)^((value&1)?0xedb88320:0);}return (value^0xffffffff)>>>0;};
const chunk=(name,data)=>{const tag=Buffer.from(name),head=Buffer.alloc(4),tail=Buffer.alloc(4);head.writeUInt32BE(data.length);tail.writeUInt32BE(crc(Buffer.concat([tag,data])));return Buffer.concat([head,tag,data,tail]);};
const header=Buffer.alloc(13);header.writeUInt32BE(16,0);header.writeUInt32BE(9,4);header[8]=8;header[9]=6;
const rows=Buffer.alloc(9*(1+16*4));for(let y=0;y<9;y++)for(let x=0;x<16;x++){const at=y*65+1+x*4;rows[at]=x*12;rows[at+1]=y*22;rows[at+2]=120;rows[at+3]=255;}
module.exports=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
