'use strict';
// SYNTHETIC device labels only; no device enumeration or routing changes.
const test=require('node:test');const assert=require('node:assert/strict');const {classifyInputRoute}=require('../ui/input-route.js');
test('system loopback inputs need acknowledgment and explain the Windows prerequisite',()=>{
  for(const label of ['Stereo Mix (Realtek(R) Audio)','What U Hear (Sound Blaster)','Wave Out Mix']){const r=classifyInputRoute(label,'Win32');assert.equal(r.kind,'system-loopback',label);assert.equal(r.needsAcknowledgment,true);assert.match(r.guidance,/Sound settings/);assert.match(r.guidance,/does not enable or change/);}
});
test('virtual drivers need acknowledgment and macOS guidance names the third-party driver requirement',()=>{
  for(const label of ['CABLE Output (VB-Audio Virtual Cable)','VoiceMeeter Output (VB-Audio VoiceMeeter VAIO)','BlackHole 2ch','Loopback Audio','Soundflower (2ch)','ZoomAudioDevice']){const r=classifyInputRoute(label,'MacIntel');assert.equal(r.kind,'virtual',label);assert.equal(r.needsAcknowledgment,true);}
  assert.match(classifyInputRoute('BlackHole 2ch','MacIntel').guidance,/third-party driver/);assert.match(classifyInputRoute('BlackHole 2ch','MacIntel').guidance,/installs no driver/);
});
test('ordinary inputs make no hardware claim and missing labels ask for permission',()=>{
  for(const label of ['Microphone (MOTU M4)','In 1-2 (MOTU M4)','MacBook Pro Microphone','Headset Microphone (Jabra)']){const r=classifyInputRoute(label,'Win32');assert.equal(r.kind,'device',label);assert.equal(r.needsAcknowledgment,false);assert.match(r.guidance,/cannot verify/);}
  for(const label of ['',null,undefined,'   ']){const r=classifyInputRoute(label);assert.equal(r.kind,'unknown');assert.equal(r.needsAcknowledgment,false);assert.match(r.guidance,/permission/);}
});
