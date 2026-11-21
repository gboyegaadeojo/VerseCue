'use strict';
// FR-008: name what kind of route an input label suggests and the OS prerequisite it depends on.
// Labels are reported by the browser and can be renamed, so this guides review; it never verifies hardware or routing.
const LOOPBACK=/\b(stereo mix|what u hear|wave out mix|wave mix|mixed output|rec(?:ording)? playback)\b/i;
const VIRTUAL=/\b(vb-?audio|vb-?cable|cable output|voicemeeter|blackhole|soundflower|loopback audio|rogue amoeba|virtual (?:audio|cable|input|mic)|ndi audio|dante virtual|obs (?:audio|virtual)|ms teams audio|zoomaudiodevice|zoom audio)\b|^loopback\b/i;
function classifyInputRoute(label,platform=''){
  const text=typeof label==='string'?label.trim():'';
  const mac=/mac/i.test(platform),windows=/win/i.test(platform);
  if(!text)return {kind:'unknown',needsAcknowledgment:false,guidance:'Input name unavailable. Request audio permission and refresh inputs to see device names.'};
  if(LOOPBACK.test(text))return {kind:'system-loopback',needsAcknowledgment:true,guidance:`System loopback input. It records whatever this computer plays, such as ProPresenter media, videos and alerts, not only the pastor.${windows?' Windows lists it only when the audio driver provides it and it is enabled in Sound settings.':''}${mac?' macOS has no built-in system loopback input; this name comes from an installed driver.':''} VerseCue does not enable or change it. Prefer the physical pastor channel.`};
  if(VIRTUAL.test(text))return {kind:'virtual',needsAcknowledgment:true,guidance:`Virtual audio input. Its sound depends on routing set up in another application or driver, which VerseCue cannot see or verify.${mac?' On macOS, capturing computer audio needs a separately installed third-party driver.':''} VerseCue installs no driver and changes no routing. Prefer the physical pastor channel.`};
  return {kind:'device',needsAcknowledgment:false,guidance:'Reported as an audio input. VerseCue cannot verify which microphone or mixer feed it carries; check the pastor channel with the input test.'};
}
if(typeof module!=='undefined'&&module.exports)module.exports={classifyInputRoute};else window.classifyInputRoute=classifyInputRoute;
