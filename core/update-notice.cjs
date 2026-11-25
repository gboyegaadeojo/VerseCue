'use strict';
// New version notice: reads VerseCue's public release list on GitHub and says whether a newer version exists.
// It never downloads or installs anything. The request carries no settings, version or identity: only a generic
// "VerseCue" user agent, as GitHub requires one. The link shown is built here from the version number, never taken
// from the response, so the notice can only ever open VerseCue's own releases page.
const RELEASES_API='https://api.github.com/repos/gboyegaadeojo/VerseCue/releases?per_page=20';
const RELEASE_PAGE='https://github.com/gboyegaadeojo/VerseCue/releases/tag/v';
const MAX_BYTES=4_000_000;

function parseVersion(value){const m=/^v?(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/.exec(String(value??''));return m?m.slice(1).map(Number):null;}
function compareVersions(a,b){for(let i=0;i<3;i++)if(a[i]!==b[i])return a[i]-b[i];return 0;}

// The newest published (not draft) release that is newer than the running version, or null.
function newestRelease(list,current){
  const running=parseVersion(current);if(!running||!Array.isArray(list))return null;
  let best=null;
  for(const release of list.slice(0,100)){
    if(!release||typeof release!=='object'||release.draft===true)continue;
    const version=parseVersion(release.tag_name);
    if(version&&compareVersions(version,running)>0&&(!best||compareVersions(version,best)>0))best=version;
  }
  if(!best)return null;const version=best.join('.');
  return {version,url:RELEASE_PAGE+version};
}

async function checkForNewRelease({fetch,current,url=RELEASES_API,timeoutMs=10000}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'VerseCue'},signal:controller.signal,redirect:'error',credentials:'omit',cache:'no-store'});
    if(!response.ok)return {ok:false,code:'HTTP_'+response.status};
    const text=await response.text();if(text.length>MAX_BYTES)return {ok:false,code:'TOO_LARGE'};
    let list;try{list=JSON.parse(text);}catch{return {ok:false,code:'BAD_RESPONSE'};}
    return {ok:true,newer:newestRelease(list,current)};
  }catch(error){return {ok:false,code:error?.name==='AbortError'?'TIMEOUT':'UNAVAILABLE'};}
  finally{clearTimeout(timer);}
}

module.exports={RELEASES_API,RELEASE_PAGE,parseVersion,compareVersions,newestRelease,checkForNewRelease};
