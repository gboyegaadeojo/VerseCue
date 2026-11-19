'use strict';
// Read-only installed ProPresenter PNG thumbnails. Never save images or send output.
async function readSlideThumbnail(response,guard=()=>true){
 if(!response.ok)throw Error('ProPresenter thumbnail HTTP '+response.status);
 if(response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='image/png')throw Error('ProPresenter did not return a PNG thumbnail');
 const limit=2000000;if(Number(response.headers.get('content-length'))>limit)throw Error('Slide thumbnail is too large');
 if(!response.body||!guard())throw Error('Slide thumbnail request canceled');
 const reader=response.body.getReader(),chunks=[];let size=0;
 try{while(true){if(!guard())throw Error('Slide thumbnail request canceled');const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error('Slide thumbnail is too large');chunks.push(Buffer.from(value));}}
 finally{void reader.cancel().catch(()=>{});}
 if(!guard())throw Error('Slide thumbnail request canceled');
 const bytes=Buffer.concat(chunks,size);
 if(bytes.length<33||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.readUInt32BE(8)!==13||bytes.toString('ascii',12,16)!=='IHDR')throw Error('Invalid ProPresenter PNG thumbnail');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 if(!width||!height||width>4096||height>4096||width*height>4194304)throw Error('Slide thumbnail dimensions exceed the preview limit');
 return {dataUrl:'data:image/png;base64,'+bytes.toString('base64'),width,height};
}
module.exports={readSlideThumbnail};
