'use strict';
// Is this frame VerseCue's own page? Compares file locations rather than URL text, because Chromium writes the
// Windows drive letter in capitals (file:///C:/...) while a launch from "c:\..." gives a lowercase expected URL.
// Windows file names are case-insensitive; macOS and Linux comparisons stay exact.
const path=require('node:path'),{fileURLToPath}=require('node:url');
function sameLocalPage(url,expected,platform=process.platform){
  try{
    const a=new URL(String(url)),b=new URL(String(expected));
    if(a.protocol!=='file:'||b.protocol!=='file:'||a.host||b.host||a.hash)return false;
    a.search='';b.search='';
    const win=platform==='win32',p=win?path.win32:path.posix;
    const left=p.normalize(fileURLToPath(a,{windows:win})),right=p.normalize(fileURLToPath(b,{windows:win}));
    return win?left.toLowerCase()===right.toLowerCase():left===right;
  }catch{return false;}
}
module.exports={sameLocalPage};
