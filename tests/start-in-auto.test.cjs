'use strict';
// SYNTHETIC connector and speech evidence; no ProPresenter or microphone.
const test=require('node:test');const assert=require('node:assert/strict');const settings=require('../core/settings.cjs');const {Session}=require('../core/session.cjs');const {GuardedAuto}=require('../core/guarded-auto.cjs');
const evidence={source:'local-speech',final:true,endEvidence:'silence',droppedSamples:0,elapsedMs:500,endAgeMs:1500,observedAt:1000};
function fixture(){let now=1000,timer=null,simulations=0;const connector={base:'http://127.0.0.1:1025',status:{state:'connected'},version:{host_description:'ProPresenter synthetic'},armed:false,mappings:new Map(),arm(v){this.armed=v;},async send(c,{dryRun,guard}){if(!guard())throw new Error('canceled');if(dryRun)simulations++;return {state:'simulated'};}};const service=new Session(connector,{clock:()=>now});service.configure({dryRun:true});service.capture={active:true,ownerId:1};service.startMode='auto';const automatic=new GuardedAuto(service,{schedule:(fn,ms)=>{timer={fn,ms};return 1;},clear:()=>timer=null});return {service,automatic,next(text='Please show John chapter three verse sixteen'){const rows=service.ingest(text);automatic.consider(rows,evidence);return rows;},async fire(){const t=timer;timer=null;if(t)await t.fn();},scheduledMs:()=>timer?.ms,simulations:()=>simulations};}

test('new settings start in Auto with a one-second hold window and validate both fields',()=>{
  const d=settings.defaults();assert.equal(d.startMode,'auto');assert.equal(d.autoHoldMs,1000);
  assert.equal(settings.validateSettings({schemaVersion:1}).startMode,'auto');
  assert.equal(settings.validateSettings({...d,startMode:'confirm'}).startMode,'confirm');
  for(const bad of [{startMode:'suggest'},{startMode:true},{autoHoldMs:0},{autoHoldMs:749},{autoHoldMs:3001},{autoHoldMs:1.5}])assert.throws(()=>settings.validateSettings({...d,...bad}),undefined,JSON.stringify(bad));
});
test('start preference applies at launch and reset only, in dry run, never after Stop, wake or corrupt settings',()=>{
  const s=new Session({});assert.equal(s.mode,'confirm','A bare session still defaults to Confirm');
  s.startMode='auto';assert.equal(s.applyStartMode(),true);assert.equal(s.mode,'auto');assert.equal(s.dryRun,true);assert.match(s.autoStatus.reason,/SIMULATION/);
  s.stop();assert.equal(s.mode,'paused');assert.equal(s.applyStartMode(),false);s.resume();assert.equal(s.mode,'confirm','Resume after Stop is deliberate Confirm');
  s.reset();assert.equal(s.mode,'auto','Session reset returns to the saved start preference');assert.equal(s.dryRun,true);
  s.configure({dryRun:false});assert.equal(s.mode,'confirm','Arming or changing setup leaves Auto');
  s.recovery={required:true,phase:'wake'};s.reset();assert.equal(s.mode,'paused','Wake recovery stays paused');s.recovery=null;
  s.settingsRecoveryRequired=true;s.reset();assert.equal(s.mode,'confirm','Recovered corrupt settings never start Auto');s.settingsRecoveryRequired=false;
  s.startMode='confirm';s.reset();assert.equal(s.mode,'confirm');
});
test('an eligible reference waits for the configured hold window and Hold leaves it for review with nothing sent',async()=>{
  const f=fixture();f.service.applyStartMode();f.automatic.configureDelay(1500);f.next();
  assert.equal(f.service.autoStatus.state,'pending');assert.equal(f.scheduledMs(),1500);assert.equal(f.service.autoStatus.holdMs,1500);assert.equal(f.service.autoStatus.dueAt,1000+1500);
  assert.deepEqual(f.automatic.hold(),{held:true});assert.equal(f.service.autoStatus.state,'held');await f.fire();assert.equal(f.simulations(),0);
  assert.equal(f.service.queue.length,1,'Held reference stays available for deliberate review');assert.equal(f.service.mode,'auto');
  assert.equal(f.automatic.hold().held,false,'Nothing left to hold');
});
test('a long hold window does not make a fresh reference too old to send, and staleness is still enforced',async()=>{
  const f=fixture();f.service.applyStartMode();f.automatic.configureDelay(3000);f.next();f.service.clock=(()=>{const base=f.service.clock();return ()=>base+3000;})();await f.fire();assert.equal(f.simulations(),1,'Age 1.5 s + 3 s hold is allowed at send time');
  const g=fixture();g.service.applyStartMode();g.automatic.configureDelay(1000);g.next();g.service.clock=(()=>{const base=g.service.clock();return ()=>base+4000;})();await g.fire();assert.equal(g.simulations(),0,'A send delayed past its hold allowance is dropped');assert.match(g.service.autoStatus.reason,/too old/);
});
test('without Hold the reference auto-simulates and the hold window keeps the existing bounds',async()=>{
  const f=fixture();f.service.applyStartMode();f.next();assert.equal(f.scheduledMs(),750);await f.fire();assert.equal(f.simulations(),1);
  for(const bad of [0,500,749,3001,1.5,'1000'])assert.throws(()=>f.automatic.configureDelay(bad));
  f.automatic.configureDelay(3000);f.next('Please show Romans chapter eight verse twenty-eight');assert.equal(f.scheduledMs(),3000);
});
