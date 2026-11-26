'use strict';
// Renderer for the recording labeller. Plays the recording, records marks and autosaves them through the preload API.
(()=>{
 const $=id=>document.getElementById(id);
 const audio=$('audio'),TRANSLATIONS=['KJV','AMP','AMPC','NIV','NKJV','MSG','ESV','ASV','NLT'];
 const state={recording:null,labels:[],editing:null,resumeAfter:false,lastTranslation:'KJV',saveTimer:null,checkSeq:0};
 const controls=['recording-id','back','play','forward','speed','seek','mark','authorized','reviewed'];
 const status=text=>{$('status').textContent=text;};
 const fmt=(s,decimals=1)=>{if(!Number.isFinite(s))s=0;const m=Math.floor(s/60),sec=s-m*60;return `${m}:${sec.toFixed(decimals).padStart(decimals?decimals+3:2,'0')}`;};
 const parseTime=text=>{const m=String(text).trim().match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);if(!m)return null;const v=(+(m[1]??0))*60+(+m[2]);return Number.isFinite(v)?Math.round(v*10)/10:null;};
 const intentText={display:'Show on screen',mention:'Only mentioned'};
 for(const t of TRANSLATIONS){const o=document.createElement('option');o.value=t;o.textContent=t;$('translation').append(o);}

 function render(){
  const rows=$('rows');rows.textContent='';
  $('count').textContent=state.labels.length?`(${state.labels.length}: ${state.labels.filter(l=>l.intent==='display').length} to show, ${state.labels.filter(l=>l.intent==='mention').length} mentioned)`:'';
  if(!state.labels.length){const tr=rows.insertRow(),td=tr.insertCell();td.colSpan=5;td.className='muted';td.textContent='No labels yet.';return;}
  state.labels.forEach((l,i)=>{
   const tr=rows.insertRow();
   const time=document.createElement('button');time.type='button';time.textContent=fmt(l.atSeconds);time.setAttribute('aria-label',`Play from 3 seconds before ${fmt(l.atSeconds)}`);time.onclick=()=>{audio.currentTime=Math.max(0,l.atSeconds-3);audio.play();};
   tr.insertCell().append(time);tr.insertCell().textContent=l.reference;tr.insertCell().textContent=l.translation;
   const intent=tr.insertCell();intent.textContent=intentText[l.intent];intent.className='intent-'+l.intent;
   const actions=tr.insertCell();
   const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.setAttribute('aria-label',`Edit ${l.reference} at ${fmt(l.atSeconds)}`);edit.onclick=()=>openForm(l.atSeconds,l,i);
   const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Delete';del.setAttribute('aria-label',`Delete ${l.reference} at ${fmt(l.atSeconds)}`);del.onclick=()=>{state.labels.splice(i,1);render();scheduleSave(`Deleted ${l.reference}.`);};
   actions.append(edit,' ',del);
  });
 }

 function scheduleSave(note){clearTimeout(state.saveTimer);status(note??'Saving…');state.saveTimer=setTimeout(save,250);}
 async function save(){
  if(!state.recording)return;
  const id=$('recording-id').value.trim();
  const r=await window.labeller.save({recordingId:id,dataUseAuthorized:$('authorized').checked,labelsReviewed:$('reviewed').checked,labels:state.labels});
  if(r.ok){state.savedPath=r.path;status(`Saved ${state.labels.length} label${state.labels.length===1?'':'s'} to ${r.path}.`);document.body.dataset.saved=r.annotationSha256;}
  else status('Not saved: '+r.error);
 }

 function loadExisting(existing){
  if(!existing)return false;
  if(!existing.matches){status(existing.error??'A labels file with this ID belongs to a different recording. Choose another recording ID before marking.');return false;}
  state.labels=existing.file.labels.map(l=>({...l}));$('authorized').checked=existing.file.dataUseAuthorized;$('reviewed').checked=existing.file.labelsReviewed;render();
  status(`Continuing: loaded ${state.labels.length} saved label${state.labels.length===1?'':'s'} for this recording.`);return true;
 }

 $('open').onclick=async()=>{
  const r=await window.labeller.open();if(!r.ok){if(!r.canceled)status(r.error);return;}
  if(audio.src)URL.revokeObjectURL(audio.src);
  audio.src=URL.createObjectURL(new Blob([r.bytes],{type:'audio/wav'}));
  state.recording={fileName:r.fileName,durationSeconds:r.durationSeconds};state.labels=[];$('authorized').checked=false;$('reviewed').checked=false;
  for(const id of controls)$(id).disabled=false;
  $('recording-id').value=r.recordingId;$('seek').max=String(r.durationSeconds);
  $('file-line').textContent=`${r.fileName} · ${fmt(r.durationSeconds,0)} long`;
  render();if(!r.existing)status('Recording open. Press Space to play and M when you hear a reference.');else loadExisting(r.existing);
  tick();
 };
 $('recording-id').onchange=async()=>{const id=$('recording-id').value.trim();if(!/^[A-Za-z0-9._-]{1,80}$/.test(id)){status('Recording ID may use letters, numbers, dot, dash and underscore.');return;}
  const existing=await window.labeller.existing(id);if(existing&&!state.labels.length)loadExisting(existing);else if(existing&&!existing.matches)status('A labels file with this ID belongs to a different recording. Choose another recording ID.');else scheduleSave();};

 const togglePlay=()=>{if(!state.recording)return;if(audio.paused)audio.play();else audio.pause();};
 const nudge=s=>{audio.currentTime=Math.min(Math.max(0,audio.currentTime+s),state.recording?.durationSeconds??0);};
 $('play').onclick=togglePlay;$('back').onclick=()=>nudge(-5);$('forward').onclick=()=>nudge(5);
 $('speed').onchange=()=>{audio.playbackRate=+$('speed').value;};
 $('seek').oninput=()=>{audio.currentTime=+$('seek').value;};
 audio.onplay=audio.onpause=()=>{$('play').firstChild.textContent=audio.paused?'Play ':'Pause ';};
 function tick(){const d=state.recording?.durationSeconds??0;$('clock').textContent=`${fmt(audio.currentTime)} / ${fmt(d,0)}`;if(document.activeElement!==$('seek'))$('seek').value=String(audio.currentTime);}
 audio.ontimeupdate=tick;

 function openForm(at,label=null,index=null){
  state.resumeAfter=!audio.paused&&label===null;audio.pause();state.editing=index;
  $('form-section').hidden=false;$('at').value=fmt(at);$('reference').value=label?.reference??'';$('translation').value=label?.translation??state.lastTranslation;
  for(const r of document.querySelectorAll('input[name=intent]'))r.checked=label?.intent===r.value;
  $('form-title').textContent=label?'Edit label':'What did you hear?';
  check();$('reference').focus();
 }
 function closeForm(resume){$('form-section').hidden=true;state.editing=null;$('mark').focus();if(resume&&state.resumeAfter)audio.play();state.resumeAfter=false;}
 $('mark').onclick=()=>{if(state.recording)openForm(audio.currentTime);};
 const shiftAt=s=>{const v=parseTime($('at').value)??audio.currentTime;$('at').value=fmt(Math.min(Math.max(0,v+s),state.recording.durationSeconds));};
 $('earlier').onclick=()=>shiftAt(-1);$('later').onclick=()=>shiftAt(1);
 $('replay').onclick=()=>{const v=parseTime($('at').value);if(v!=null){audio.currentTime=Math.max(0,v-3);audio.play();}};
 $('cancel').onclick=()=>{closeForm(true);status('Label not saved.');};

 async function check(){
  const seq=++state.checkSeq,text=$('reference').value,p=$('preview');
  if(!text.trim()){p.textContent='';p.className='preview';return null;}
  const r=await window.labeller.check(text,$('translation').value);if(seq!==state.checkSeq)return null;
  p.textContent=r.ok?`Will be saved as ${r.reference} (${r.translation}).`:r.error;p.className='preview '+(r.ok?'ok':'bad');return r;
 }
 $('reference').oninput=check;$('translation').onchange=check;

 $('label-form').onsubmit=async event=>{
  event.preventDefault();
  const at=parseTime($('at').value);
  if(at==null||at>state.recording.durationSeconds+1){status('Enter the time as minutes:seconds, within the recording.');$('at').focus();return;}
  const r=await check();if(!r?.ok){status(r?r.error:'Type the reference you heard, such as John 3:16.');$('reference').focus();return;}
  const intent=document.querySelector('input[name=intent]:checked')?.value;
  if(!intent){status('Choose whether the pastor wanted it shown on screen or only mentioned it (press 1 or 2).');document.querySelector('input[name=intent]').focus();return;}
  const label={atSeconds:at,reference:r.reference,translation:r.translation,intent};
  if(state.editing!=null)state.labels[state.editing]=label;else state.labels.push(label);
  state.labels.sort((a,b)=>a.atSeconds-b.atSeconds);state.lastTranslation=r.translation;render();
  closeForm(true);scheduleSave(`Saved label ${r.reference} at ${fmt(at)}.`);
 };
 $('authorized').onchange=$('reviewed').onchange=()=>scheduleSave();

 document.addEventListener('keydown',event=>{
  const typing=event.target.matches('input[type=text],select');
  const formOpen=!$('form-section').hidden;
  if(event.key==='Escape'&&formOpen){event.preventDefault();$('cancel').click();return;}
  // After nudging the time, Enter saves the label rather than nudging again.
  if(event.key==='Enter'&&formOpen&&['earlier','later','replay'].includes(event.target.id)){event.preventDefault();$('label-form').requestSubmit();return;}
  if(formOpen&&!typing&&(event.key==='1'||event.key==='2')){event.preventDefault();document.querySelector(`input[name=intent][value=${event.key==='1'?'display':'mention'}]`).checked=true;return;}
  if(formOpen&&typing&&event.target.id==='reference'&&(event.key==='1'||event.key==='2')&&event.altKey){event.preventDefault();document.querySelector(`input[name=intent][value=${event.key==='1'?'display':'mention'}]`).checked=true;return;}
  if(typing||formOpen||event.ctrlKey||event.metaKey||event.altKey||!state.recording)return;
  if(event.key===' '&&!event.target.matches('button')){event.preventDefault();togglePlay();}
  else if(event.key==='m'||event.key==='M'){event.preventDefault();$('mark').click();}
  else if(event.key==='ArrowLeft'&&!event.target.matches('input[type=range]')){event.preventDefault();nudge(-5);}
  else if(event.key==='ArrowRight'&&!event.target.matches('input[type=range]')){event.preventDefault();nudge(5);}
 });
})();
