'use strict';
// SYNTHETIC release lists; no network.
const test=require('node:test'),assert=require('node:assert/strict');
const {newestRelease,checkForNewRelease,parseVersion,RELEASE_PAGE}=require('../core/update-notice.cjs');
const list=tags=>tags.map(t=>typeof t==='string'?{tag_name:t,draft:false,prerelease:true}:t);

test('the newest release newer than the running version is reported with a link built from its number',()=>{
  assert.deepEqual(newestRelease(list(['v0.6.9','v0.7.0','v0.6.10']),'0.6.9'),{version:'0.7.0',url:RELEASE_PAGE+'0.7.0'});
  assert.deepEqual(newestRelease(list(['v0.6.10','v0.6.9']),'0.6.9'),{version:'0.6.10',url:'https://github.com/gboyegaadeojo/VerseCue/releases/tag/v0.6.10'});
});
test('nothing is reported when the running version is current or newer',()=>{
  assert.equal(newestRelease(list(['v0.6.9','v0.6.8']),'0.6.9'),null);
  assert.equal(newestRelease(list(['v0.6.8']),'0.6.9'),null);
  assert.equal(newestRelease([],'0.6.9'),null);
});
test('drafts, odd tags and malformed entries are ignored; the response never supplies the link',()=>{
  const rows=[{tag_name:'v9.9.9',draft:true},{tag_name:'v1.0.0-beta'},{tag_name:'latest'},null,'v2.0.0',{tag_name:'v0.7.1',html_url:'https://evil.example/'}];
  assert.deepEqual(newestRelease(rows,'0.6.9'),{version:'0.7.1',url:RELEASE_PAGE+'0.7.1'});
  assert.equal(newestRelease({tag_name:'v1.0.0'},'0.6.9'),null);
  assert.equal(newestRelease(list(['v1.0.0']),'not-a-version'),null);
  assert.equal(parseVersion('v12345.0.0'),null);
});
test('the request sends only a generic user agent and handles failures without throwing',async()=>{
  let seen;const ok=await checkForNewRelease({current:'0.6.9',fetch:async(url,options)=>{seen={url,options};return {ok:true,text:async()=>JSON.stringify(list(['v0.7.0']))};}});
  assert.deepEqual(ok,{ok:true,newer:{version:'0.7.0',url:RELEASE_PAGE+'0.7.0'}});
  assert.equal(seen.url,'https://api.github.com/repos/gboyegaadeojo/VerseCue/releases?per_page=20');
  assert.deepEqual(Object.keys(seen.options.headers).sort(),['Accept','User-Agent']);assert.equal(seen.options.headers['User-Agent'],'VerseCue');
  assert.equal(seen.options.credentials,'omit');assert.equal(seen.options.redirect,'error');
  assert.deepEqual(await checkForNewRelease({current:'0.6.9',fetch:async()=>({ok:false,status:403})}),{ok:false,code:'HTTP_403'});
  assert.deepEqual(await checkForNewRelease({current:'0.6.9',fetch:async()=>{throw new TypeError('offline');}}),{ok:false,code:'UNAVAILABLE'});
  assert.deepEqual(await checkForNewRelease({current:'0.6.9',fetch:async()=>({ok:true,text:async()=>'<html>'})}),{ok:false,code:'BAD_RESPONSE'});
  assert.deepEqual(await checkForNewRelease({current:'0.6.9',fetch:async()=>({ok:true,text:async()=>'x'.repeat(4_000_001)})}),{ok:false,code:'TOO_LARGE'});
  const slow=await checkForNewRelease({current:'0.6.9',timeoutMs:20,fetch:(url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'}))))});
  assert.deepEqual(slow,{ok:false,code:'TIMEOUT'});
});
