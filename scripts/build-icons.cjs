'use strict';
// Builds the app icons from the VerseCue mark (assets/brand/*.svg): PNGs, a Windows .ico and a macOS .icns.
// Rendering uses the Playwright Chromium already used by the tests. Run after changing the mark: node scripts/build-icons.cjs
const fs=require('node:fs');const path=require('node:path');const {chromium}=require('playwright');
const brand=path.resolve('assets/brand'),out=path.resolve('assets/icons');fs.mkdirSync(out,{recursive:true});
const svg=name=>fs.readFileSync(path.join(brand,name),'utf8');
async function render(page,source,size){
  await page.setViewportSize({width:size,height:size});
  await page.setContent(`<html><body style="margin:0;background:transparent">${source.replace('<svg ',`<svg width="${size}" height="${size}" `)}</body></html>`);
  return page.screenshot({omitBackground:true,clip:{x:0,y:0,width:size,height:size}});
}
// ICO and ICNS both accept PNG-compressed entries.
function ico(images){
  const header=Buffer.alloc(6);header.writeUInt16LE(0,0);header.writeUInt16LE(1,2);header.writeUInt16LE(images.length,4);
  const entries=[],data=[];let offset=6+16*images.length;
  for(const {size,png} of images){const e=Buffer.alloc(16);e.writeUInt8(size>=256?0:size,0);e.writeUInt8(size>=256?0:size,1);e.writeUInt8(0,2);e.writeUInt8(0,3);e.writeUInt16LE(1,4);e.writeUInt16LE(32,6);e.writeUInt32LE(png.length,8);e.writeUInt32LE(offset,12);entries.push(e);data.push(png);offset+=png.length;}
  return Buffer.concat([header,...entries,...data]);
}
function icns(images){
  const chunks=images.map(({type,png})=>{const h=Buffer.alloc(8);h.write(type,0,'ascii');h.writeUInt32BE(png.length+8,4);return Buffer.concat([h,png]);});
  const body=Buffer.concat(chunks),h=Buffer.alloc(8);h.write('icns',0,'ascii');h.writeUInt32BE(body.length+8,4);return Buffer.concat([h,body]);
}
(async()=>{
  // The installed Microsoft Edge (Windows) or Chrome is used when Playwright's own browser is not downloaded.
  let browser;try{browser=await chromium.launch();}catch{try{browser=await chromium.launch({channel:'msedge'});}catch{browser=await chromium.launch({channel:'chrome'});}}const page=await browser.newPage({deviceScaleFactor:1});
  try{
    const full=svg('versecue-mark.svg'),small=svg('versecue-mark-small.svg'),mac=svg('versecue-mark-macos.svg');
    const winSizes=[16,24,32,48,64,128,256],win=[];
    for(const size of winSizes)win.push({size,png:await render(page,size<=24?small:full,size)});
    fs.writeFileSync(path.join(out,'versecue.ico'),ico(win));
    for(const size of [32,64,128,256,512,1024])fs.writeFileSync(path.join(out,`versecue-${size}.png`),await render(page,full,size));
    const macTypes=[['icp4',16,small],['icp5',32,mac],['icp6',64,mac],['ic07',128,mac],['ic08',256,mac],['ic09',512,mac],['ic10',1024,mac]],macImages=[];
    for(const [type,size,source] of macTypes)macImages.push({type,png:await render(page,source,size)});
    fs.writeFileSync(path.join(out,'versecue.icns'),icns(macImages));
    console.log('Built assets/icons: versecue.ico, versecue.icns and PNGs from assets/brand.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
