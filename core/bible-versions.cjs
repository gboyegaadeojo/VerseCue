'use strict';
// Bible versions VerseCue can ask ProPresenter for (NR-018): short code and the name ProPresenter shows in its version menu.
const VERSIONS={
  KJV:'King James Version',ASV:'American Standard Version',NIV:'New International Version',NKJV:'New King James Version',
  ESV:'English Standard Version',NLT:'New Living Translation',AMP:'Amplified Bible',AMPC:'Amplified Bible, Classic Edition',MSG:'The Message'
};
const normal=text=>String(text??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
// Map the names read from ProPresenter's menu to codes. Unknown names are kept for display but have no code.
function codesFromNames(names){
  const byName=new Map(Object.entries(VERSIONS).map(([code,name])=>[normal(name),code]));
  return [...new Set((names??[]).map(name=>byName.get(normal(name))??(VERSIONS[String(name).toUpperCase()]?String(name).toUpperCase():null)).filter(Boolean))];
}
function versionName(code){return VERSIONS[code]??code;}
module.exports={VERSIONS,codesFromNames,versionName};
