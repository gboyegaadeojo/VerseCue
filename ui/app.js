'use strict';
const $=id=>document.getElementById(id);const api=window.versecue;
let state=null,settings=null,selectedId=null,listening=false,lastLatestId=null;
if(new URLSearchParams(location.search).has('compact'))document.body.classList.add('compact');
function message(text,setup=false){$(setup?'setup-message':'message').textContent=text;}
async function call(method,...args){const result=await api[method](...args);if(!result.ok)throw new Error(result.error);return result.value;}
async function action(command,payload){return call('command',command,payload);}
function bind(id,fn){$(id).addEventListener('click',()=>Promise.resolve().then(fn).catch(e=>message(e.message,$('settings-dialog').open)));}
function render(next){
  state=next;const latest=state.queue.at(-1)?.id??null;if(latest!==lastLatestId){selectedId=latest;lastLatestId=latest;}const candidate=state.queue.find(c=>c.id===selectedId)??state.queue.at(-1);selectedId=candidate?.id??null;
  $('target-banner').textContent=state.dryRun?'DRY RUN · Suggestions only affect this app. No ProPresenter output.':'ARMED TEST TARGET · Show triggers a mapped ProPresenter cue. Audience output is not independently observed.';
  $('target-banner').classList.toggle('armed',!state.dryRun);
  $('connection').textContent=state.connection.state==='connected'?state.connection.version:'Not connected';$('translation').textContent=state.translation;
  $('mode').value=state.mode;$('mode').disabled=state.stopped;$('resume').hidden=!state.stopped&&state.mode!=='paused';$('resume').textContent=state.stopped?'Re-arm in Confirm':'Resume in Confirm';
  $('candidate-empty').hidden=Boolean(candidate);$('candidate').hidden=!candidate;
  if(candidate){
    $('reference').textContent=candidate.label;$('candidate-translation').textContent=candidate.translation;$('phrase').textContent=candidate.phrase;
    $('review-note').textContent=candidate.issues.join(' · ')||'Review the reference before sending.';
    $('show').textContent=state.dryRun?'Simulate passage':'Show prepared test cue';
    const blocked=state.stopped||state.busy||!candidate.authorized||candidate.reference.valid===false||candidate.reference.overLimit||candidate.reference.verse==null||candidate.issues.some(i=>/Invalid|no-show|not supported/.test(i));
    $('show').disabled=blocked||state.mode!=='confirm';$('prepare-candidate').disabled=blocked||!nativeAvailable;
    $('expiry').textContent=`${Math.max(0,Math.ceil((candidate.expiresAt-Date.now())/1000))}s remaining`;
  }else $('expiry').textContent='';
  $('queue-count').textContent=String(state.queue.length);
  const queueSignature=state.queue.map(c=>c.id).join('|');
  if($('queue').dataset.signature!==queueSignature){
    $('queue').dataset.signature=queueSignature;$('queue').replaceChildren();
    for(const c of state.queue){const row=document.createElement('div');row.className='queue-item';const b=document.createElement('button');b.textContent=`${c.label} · ${c.translation}`;b.onclick=()=>{selectedId=c.id;render(state);};row.append(b);$('queue').append(row);}
  }
  const historySignature=state.history.map(c=>`${c.id}:${c.state}`).join('|');
  if($('history').dataset.signature!==historySignature){
    $('history').dataset.signature=historySignature;$('history').replaceChildren();
    if(!state.history.length){const p=document.createElement('p');p.className='muted';p.textContent='No passages sent this session.';$('history').append(p);}
    for(const c of state.history){const row=document.createElement('div');row.className='history-item';const title=document.createElement('strong');title.textContent=c.label;const detail=document.createElement('small');detail.textContent=`${c.translation} · ${c.state==='simulated'?'Simulated':c.state==='readback-matched'?'Receipt + matching readback':'Uncertain · inspect ProPresenter'}`;const review=document.createElement('button');review.textContent='Review again';review.onclick=()=>action('ingest',{text:`${c.label} in ${c.translation}`}).catch(e=>message(e.message));row.append(title,detail,review);$('history').append(row);}
  }
  if((state.mode==='paused'||state.stopped)&&listening)stopAudio();
}
function fillSettings(s){settings=s;$('speech-mode').value=s.speechMode??'cli';$('host').value=s.host;$('port').value=s.port;$('default-translation').value=s.translation;$('audio-channel').value=s.channel+1;$('worker-path').textContent=s.executable||'Not selected';$('model-path').textContent=s.model||'Not selected';$('speech-health').textContent=s.executable&&s.model?'Local whisper.cpp · ready':'Local · not configured';if([...$('audio-device').options].some(o=>o.value===s.audioDevice))$('audio-device').value=s.audioDevice;}
async function refreshDevices(){const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});stream.getTracks().forEach(t=>t.stop());const devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput'&&d.deviceId!=='default'&&d.deviceId!=='communications');$('audio-device').replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Choose the authorized input';$('audio-device').append(empty);for(const d of devices){const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||'Audio input';$('audio-device').append(o);}$('audio-device').value=settings.audioDevice;}
const audio=new PastorAudio({onLevel:v=>$('meter').value=v,onHealth:text=>$('audio-health').textContent=text,onLost:()=>{stopAudio().then(()=>action('mode','paused')).then(()=>message('Input lost. Recognition paused; choose the intended feed again.')).catch(e=>message(e.message));},onWindow:async samples=>{try{const result=await call('audio',samples);$('transcript').textContent=result.text||'No speech recognized.';$('speech-health').textContent=`Local · last window ${(result.elapsedMs/1000).toFixed(1)}s`;if(result.elapsedMs>4000)message('Recognition is slower than the proposed live target. Review suggestions; Auto is disabled.');}catch(e){message(e.message);}}});
async function stopAudio(){listening=false;await audio.stop();$('listen').disabled=false;$('mute').disabled=true;$('audio-health').textContent='Not listening';}
bind('listen',async()=>{if(!$('audio-consent').checked)throw new Error('Confirm authorization for the selected audio feed first');if(state.stopped||state.mode==='paused')throw new Error('Resume Confirm or Suggest-only before listening');if(!settings.executable||!settings.model)throw new Error('Configure the local speech engine in Setup first');$('listen').disabled=true;try{const label=await audio.start(settings.audioDevice,settings.channel);listening=audio.active;$('device-name').textContent=label??'Not listening';$('mute').disabled=!listening;}catch(e){await stopAudio();throw e;}});
bind('mute',async()=>{await stopAudio();await action('mode',state.mode);});
bind('stop',async()=>{await action('stop');await stopAudio();message('Emergency stop latched. No new sends. Already accepted ProPresenter output remains under operator control.');});
bind('resume',()=>action('resume'));
bind('show',async()=>{const id=selectedId;const result=await action('send',id);message(result.state==='simulated'?'Simulated passage · zero output requests.':result.state==='readback-matched'?'ProPresenter accepted the cue; matching readback received. Physical audience/stream output is not observed.':'Completion uncertain. Inspect ProPresenter; no retry was sent.');});
bind('reject',()=>action('reject',selectedId));
bind('edit',()=>{const c=state.queue.find(c=>c.id===selectedId);if(c){$('reference-input').value=`${c.label} in ${c.translation}`;action('reject',c.id).catch(e=>message(e.message));$('reference-input').focus();}});
bind('reset',async()=>{await action('reset');await stopAudio();$('transcript').textContent='No audio has been processed.';$('audio-consent').checked=false;message('Session reset. Transient references and history cleared; dry run restored.');});
bind('compact',()=>call('compact'));
$('mode').addEventListener('change',()=>action('mode',$('mode').value).catch(e=>message(e.message)));
$('reference-form').addEventListener('submit',async e=>{e.preventDefault();try{const candidates=await action('ingest',{text:$('reference-input').value});message(candidates.length?'Reference ready for review.':'No complete reference found. Use an explicit book, chapter and verse.');}catch(error){message(error.message);}});
bind('setup',async()=>{fillSettings(await call('settings'));$('settings-dialog').showModal();});bind('close-settings',()=>$('settings-dialog').close());
bind('refresh-devices',refreshDevices);
$('settings-form').addEventListener('submit',async e=>{e.preventDefault();try{await stopAudio();const value={...settings,speechMode:$('speech-mode').value,host:$('host').value.trim(),port:Number($('port').value),translation:$('default-translation').value.trim().toUpperCase(),audioDevice:$('audio-device').value,channel:Number($('audio-channel').value)-1};fillSettings(await call('saveSettings',value));message('Setup saved. Dry run restored; verify mappings before arming.',true);}catch(error){message(error.message,true);}});
bind('choose-worker',async()=>{const s=await call('chooseWorker');if(s)fillSettings(s);});bind('choose-model',async()=>{const s=await call('chooseModel');if(s)fillSettings(s);});
bind('test-connection',async()=>{const r=await action('test');message(`Connected to ${r.version}. This read-only test did not change output.`,true);});
bind('map',async()=>{const r=await action('map',{uuid:$('map-uuid').value.trim(),cue:Number($('map-cue').value),reference:$('map-reference').value.trim(),translation:settings.translation,verified:$('map-verified').checked});message(`Verified prepared cue: ${r.reference} · ${r.translation}. Mapping lasts this session only.`,true);});
bind('arm',async()=>{await action('arm',$('test-target').checked);message('Prepared test output armed. Suggestions are still Confirm-only.',true);});bind('dry-run',()=>action('dry-run'));
bind('export-settings',async()=>{await call('exportSettings');message('Export excludes local worker/model paths and audio device identifiers.',true);});
bind('import-settings',async()=>{await stopAudio();const s=await call('importSettings');if(s)fillSettings(s);message('Imported safe settings. Choose local audio and speech files again. Dry run restored.',true);});
bind('export-diagnostics',()=>call('exportDiagnostics'));
let nativeAvailable=false;
function renderPrivateApi(status){nativeAvailable=status.nativePreparationAvailable===true;$('private-api-status').textContent=status.enabled?`Enabled · http://127.0.0.1:${status.port} · ${status.allowPreparedSend?'prepared test sends allowed':'review submissions only'}${status.allowPreparation?' · experimental preparation enabled':''}`:'Disabled · no local listener';$('private-api-enable').disabled=status.enabled;$('private-api-send').disabled=status.enabled;$('private-api-token').disabled=!status.enabled;$('private-api-disable').disabled=!status.enabled;$('private-api-prepare').disabled=status.enabled||!nativeAvailable;$('native-preparation').disabled=!nativeAvailable;$('native-preparation-status').textContent=nativeAvailable?'Experimental helper available. Open ProPresenter’s Bible view and select the matching installed translation. Every passage still needs review; Auto is unavailable.':'Native preparation is unavailable on this platform/build.';}
bind('private-api-enable',async()=>{if($('private-api-prepare').checked&&!$('native-preparation-consent').checked)throw new Error('Acknowledge experimental focus changes before enabling API preparation');renderPrivateApi(await call('startPrivateApi',{allowPreparedSend:$('private-api-send').checked,allowPreparation:$('private-api-prepare').checked}));message('Private API enabled for this application session. Copy the token only to a trusted local client.');});
bind('private-api-disable',async()=>{await call('stopPrivateApi');renderPrivateApi(await call('privateApiStatus'));message('Private API stopped and token revoked.');});
bind('private-api-token',async()=>{await call('copyPrivateApiToken');message('Session token copied to your clipboard. It is not stored in settings or diagnostics.');});
bind('native-preparation',async()=>{if(!$('native-preparation-consent').checked)throw new Error('Acknowledge experimental focus changes first');$('native-preparation').disabled=true;message('Preparing the passage in ProPresenter. Listening is paused and output is disarmed.');try{await stopAudio();const result=await action('prepare-bible',{reference:$('native-preparation-reference').value.trim(),acknowledgeFocusChange:true});message(result.clippingWarning?'Passage prepared with a ProPresenter clipping warning. Inspect and correct formatting manually; nothing was sent live.':'Passage prepared for operator review. Formatting and physical output are not verified; nothing was sent live.');}finally{$('native-preparation').disabled=false;}});
bind('prepare-candidate',async()=>{if(!$('native-preparation-consent').checked){$('native-preparation-panel').scrollIntoView({behavior:'smooth'});throw new Error('Enable experimental preparation for this supervised test session first');}const id=selectedId;await stopAudio();message('Preparing the reviewed candidate in ProPresenter; output is disarmed.');const result=await action('prepare-candidate',{id,acknowledgeFocusChange:true});message(`Prepared for review in ${(result.workerElapsedMs/1000).toFixed(1)}s. ${result.clippingWarning?'ProPresenter reports clipped text; inspect formatting. ':''}Nothing was sent live.`);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.repeat){event.preventDefault();action('stop').then(stopAudio).catch(e=>message(e.message));}if(event.repeat&&(event.key==='Enter'||event.key===' '))event.preventDefault();});
navigator.mediaDevices?.addEventListener('devicechange',async()=>{if(!listening)return;const devices=await navigator.mediaDevices.enumerateDevices();if(!devices.some(d=>d.deviceId===settings.audioDevice)){await stopAudio();await action('mode','paused');message('Selected input disconnected. Recognition paused; choose the intended input again.');}});
api.onState(render);
Promise.all([call('settings'),call('state'),call('privateApiStatus')]).then(([s,value,apiStatus])=>{fillSettings(s);render(value);renderPrivateApi(apiStatus);if(!s.executable||!s.audioDevice)message('Open Setup to select your ProPresenter target, audio input and local speech engine.');}).catch(e=>message(e.message));
setInterval(()=>{if(state){const now=Date.now();state.queue=state.queue.filter(c=>c.expiresAt>now);render(state);}},500);
