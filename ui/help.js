'use strict';
// In-app help (NR-019): a "? Help" mode that puts numbered markers on the controls of the current page or Settings
// section with plain explanations, and a guided tour on first launch (replayable). Explanations only: help never
// presses a control, changes a setting or sends anything.
(()=>{
 const HELP={
  workspace:{name:'Workspace',items:[
   ['.halo-seg','Mode','How VerseCue acts on what it hears.','Auto sends complete references to ProPresenter after a short hold. Confirm waits for you to press Send. Suggest only shows references without sending. Paused stops listening for references.'],
   ['.halo-live','Live','What VerseCue hears right now.','The preacher’s words as they are recognised, so you can see VerseCue is listening.'],
   ['.candidate-panel','Latest reference','The reference VerseCue found and how clearly it heard it.','The ring and badge show how clearly it was heard: green “Heard clearly”, orange “Likely”, red “Check this”. The line above shows its progress: Heard, Matched, Sending, On screen.'],
   ['#hold-auto','Hold','Stop an automatic send.','Appears while Auto is about to send. Press it, or the H key, to keep that reference off the screen.'],
   ['.candidate-actions','Reference buttons','Act on this reference.','Prepare or Send acts on it. Previous and Next verse move by one verse. Edit lets you correct it. Dismiss removes it.'],
   ['#reference-form','Which passage?','Type a reference yourself.','Type any reference, such as Romans 8:28, and press Enter to review it. Typing never sends anything on its own.'],
   ['.studio-detections','Heard this service','Every reference so far.','What was said, how clearly, and whether it was spoken or quoted. Click one to bring it back.'],
   ['.audio-panel','Pastor audio','Start or stop listening.','Start listening uses the chosen microphone. The tick box confirms you may use this audio. Listening also starts on its own when VerseCue opens.'],
   ['.halo-status','Connections','Green means ready.','ProPresenter, the pastor’s microphone, the speech engine and the translation. If something is wrong, its row says what to do.'],
   ['#setup','Settings','Set VerseCue up.','Connection, microphone, speech, modes, quotes and display options.'],
   ['#stop','Emergency stop','Stop everything at once.','Stops listening and sending immediately (also the Esc key). Nothing is sent until you resume.']]},
  propresenter:{name:'Settings › ProPresenter',items:[
   ['#host','Address','Where ProPresenter is.','127.0.0.1 means this computer. For another computer, enter its network address.'],
   ['#port','Port','ProPresenter’s network port.','Shown in ProPresenter under Settings › Network. 1025 is common.'],
   ['#default-translation','Default translation','The version VerseCue asks for.','Usually KJV. It must be installed in ProPresenter.'],
   ['#auto-connect','Connect automatically','Connect when VerseCue opens.','VerseCue keeps trying until ProPresenter answers. It only reads; it never sends on its own.'],
   ['#test-connection','Test saved connection','Check the connection now.','Reads ProPresenter’s version to confirm VerseCue can reach it. Nothing changes in ProPresenter.']]},
  audio:{name:'Settings › Audio',items:[
   ['#refresh-devices','Refresh inputs','Find microphones.','Asks the computer for its audio inputs, for example after plugging in an interface.'],
   ['#audio-device','Audio device','Which input to listen to.','“Default” is the computer’s own microphone. Choose the pastor’s feed in church.'],
   ['#auto-listen','Start listening when VerseCue opens','Listen without pressing Start.','On by default once an input is set up.'],
   ['#audio-channel','Pastor channel','Which channel carries the pastor.','On interfaces like a MOTU M4, pick the input number the pastor’s microphone is plugged into.'],
   ['#test-input','Test saved input','A 10-second level check.','Shows the input level for 10 seconds. Nothing is recognised or sent.']]},
  speech:{name:'Settings › Speech',items:[
   ['#speech-mode','Speech engine mode','How the engine runs.','“Keep model loaded” is fastest and the default. “Start the engine for each phrase” uses less memory and allows the live preview.'],
   ['#speech-gpu','Use the graphics card','Faster recognition.','Uses the graphics card when it is ready (Metal on Mac; any AMD, NVIDIA or Intel card on Windows). Until then the processor is used.'],
   ['#cuda-setup-panel','NVIDIA setup','Optional, Windows with NVIDIA.','Guided setup for NVIDIA’s CUDA engine. Not needed for most computers.']]},
  output:{name:'Settings › Output',items:[
   ['#start-mode','Start each service in','The mode VerseCue opens in.','Auto, Confirm or Prepare for volunteer. Most churches pick Prepare for volunteer or Auto.'],
   ['#chapter-context','Open the whole chapter','Whole chapter at the spoken verse.','In Prepare for volunteer, ProPresenter opens the whole chapter so the volunteer can go back or forward without searching.'],
   ['#early-preparation','Start before the sentence ends','Opens the chapter sooner.','In Prepare for volunteer, VerseCue starts opening the chapter as soon as the passage is named, even if the preacher keeps talking. If the finished words differ, it corrects it. Nothing is sent.'],
   ['#auto-hold-window','Auto hold window','Time to press Hold.','How long you have to press Hold before Auto sends (0.75 to 3 seconds).'],
   ['#passage-verse-limit','Maximum verses per passage','Longest passage at once.','Up to 176 verses (a whole chapter). Auto always stays at 10.'],
   ['#duplicate-cooldown','Repeat suppression','Ignore quick repeats.','A reference said again within this many seconds is not shown twice.'],
   ['#browse-libraries','Saved passages','Use slides you saved.','Browse ProPresenter’s libraries and link a saved passage to a reference.'],
   ['#arm','Arm output','Allow sending to ProPresenter.','VerseCue starts in a safe dry run. Arming lets Confirm and Auto send to ProPresenter.']]},
  quotes:{name:'Settings › Quotes',items:[
   ['#quote-public-domain','Find verses from quoted wording','Recognise quotes.','Uses the free King James and World English Bibles to recognise quoted verses, then prepares them in your installed translation.'],
   ['#quote-enabled','Identify quoted wording','On for this session.','Turns quote recognition on or off for this service.']]},
  advanced:{name:'Settings › Advanced',items:[
   ['#pre-tick-consents','Start with boxes ticked','Ready to go on open.','Ticks the audio and preparation boxes for you at the start of each session. Arming output is always separate.'],
   ['#native-preparation-panel','Bible preparation','Open passages in ProPresenter’s Bible.','Lets VerseCue type into ProPresenter’s Bible view. On Windows, restart ProPresenter before each service so it stays fast.'],
   ['#private-api-panel','Private local API','For your own tools.','Off by default. Lets trusted programs on this computer talk to VerseCue with a token.'],
   ['#update-check-panel','Check a downloaded update','Verify before installing.','Checks that a VerseCue download is genuine. It never installs anything.']]},
  profiles:{name:'Settings › Profiles',items:[
   ['#text-size','Text size','Standard or Large.','Large makes everything readable from across the booth.'],
   ['#profile-select','Saved profiles','Switch between setups.','Save and load setups for different services or rooms.'],
   ['#settings-recovery-panel','Recover a saved setup','Go back to an earlier setup.','Restore an automatic backup of your settings.']]}
 };
 const $=id=>document.getElementById(id),visible=el=>!!el&&el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'&&!el.closest('[hidden]');
 const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 let on=false,picked=0,layer=null,timer=null;
 const dialog=()=>$('settings-dialog');
 function scope(){const d=dialog();if(d?.open){const panel=[...d.querySelectorAll('[data-settings-panel]')].find(p=>!p.hidden);return {key:panel?.dataset.settingsPanel??'profiles',host:d};}return {key:'workspace',host:document.body};}
 function items(){const {key}=scope(),page=HELP[key]??{name:'This page',items:[]};return {name:page.name,list:page.items.map(([selector,title,short,text])=>({el:document.querySelector(selector),title,short,text})).filter(item=>visible(item.el))};}
 function close(){signature='';on=false;clearInterval(timer);timer=null;layer?.remove();layer=null;for(const b of document.querySelectorAll('.help-toggle'))b.setAttribute('aria-pressed','false');}
 // Markers sit on a control's top-right corner; under the help panel, on its top-left corner instead.
 const markerLeft=r=>Math.max(4,r.right+14>innerWidth-324?r.left-10:r.right-12);
 // Keep the same elements while nothing changed and only move them (a rebuild could swallow a click).
 let signature='';
 function place(list){
  const markers=layer.querySelectorAll('.help-marker');list.forEach((item,i)=>{const r=item.el.getBoundingClientRect(),m=markers[i];if(m){m.style.left=markerLeft(r)+'px';m.style.top=Math.max(4,r.top-10)+'px';}});
  const current=list[picked],ring=layer.querySelector('.help-ring'),pop=layer.querySelector('.help-pop');
  if(current&&ring&&pop){const r=current.el.getBoundingClientRect();Object.assign(ring.style,{left:(r.left-4)+'px',top:(r.top-4)+'px',width:(r.width+8)+'px',height:(r.height+8)+'px'});pop.style.left=Math.max(12,Math.min(innerWidth-680,r.left))+'px';pop.style.top=(r.bottom+170>innerHeight?Math.max(12,r.top-150):r.bottom+12)+'px';}
 }
 function draw(){
  const {host,key}=scope(),{name,list}=items();if(layer&&layer.parentElement!==host){layer.remove();layer=null;}
  const next=key+'|'+picked+'|'+list.map(item=>item.title).join(',');if(layer&&next===signature){place(list);return;}signature=next;
  if(!layer){layer=make('div','help-layer');layer.setAttribute('aria-label','Help');host.append(layer);}
  picked=Math.min(picked,Math.max(0,list.length-1));layer.replaceChildren();
  list.forEach((item,i)=>{const r=item.el.getBoundingClientRect();const m=make('button','help-marker'+(i===picked?' on':''),String(i+1));m.type='button';m.setAttribute('aria-label','Explain '+item.title);m.style.left=markerLeft(r)+'px';m.style.top=Math.max(4,r.top-10)+'px';m.addEventListener('click',()=>{picked=i;draw();});layer.append(m);});
  const current=list[picked];
  if(current){const r=current.el.getBoundingClientRect();const ring=make('div','help-ring');Object.assign(ring.style,{left:(r.left-4)+'px',top:(r.top-4)+'px',width:(r.width+8)+'px',height:(r.height+8)+'px'});layer.append(ring);
   const pop=make('div','help-pop');pop.setAttribute('role','note');const head=make('div','help-pop-head');head.append(make('span','help-num',String(picked+1)),make('b','',current.title));pop.append(head,make('p','',current.text));
   pop.style.left=Math.max(12,Math.min(innerWidth-680,r.left))+'px';pop.style.top=(r.bottom+170>innerHeight?Math.max(12,r.top-150):r.bottom+12)+'px';layer.append(pop);}
  const panel=make('aside','help-panel');panel.setAttribute('aria-label','On this page');const top=make('div','help-panel-head');top.append(make('b','','On this page'),make('span','help-muted',name));
  const tourButton=make('button','help-tour-again','Take the tour');tourButton.type='button';tourButton.addEventListener('click',()=>{close();tour(true);});
  const closeButton=make('button','help-close','Done');closeButton.type='button';closeButton.addEventListener('click',close);top.append(tourButton,closeButton);panel.append(top);
  if(!list.length)panel.append(make('p','help-muted','Nothing to explain here yet.'));
  list.forEach((item,i)=>{const row=make('button','help-item'+(i===picked?' on':''));row.type='button';row.append(make('span','help-num',String(i+1)));const words=make('span');words.append(make('b','',item.title),make('span','help-muted',item.short));row.append(words);row.addEventListener('click',()=>{picked=i;item.el.scrollIntoView({block:'nearest'});draw();});panel.append(row);});
  // In Settings the panel starts below the sheet's header, so its close button stays reachable.
  const header=dialog()?.open?dialog().querySelector('.dialog-heading'):null;if(header)panel.style.top=Math.round(header.getBoundingClientRect().bottom+8)+'px';
  layer.append(panel);
 }
 function toggle(){if(on){close();return;}on=true;picked=0;for(const b of document.querySelectorAll('.help-toggle'))b.setAttribute('aria-pressed','true');draw();timer=setInterval(()=>{if(on)draw();},700);}
 // Guided tour (option A): shown once on first launch, never in automated test runs; replay from Help › Take the tour.
 function tour(force){
  // The first-launch tour keeps to the essentials; Help explains everything else.
  const essentials=['Mode','Latest reference','Hold','Heard this service','Connections','Emergency stop'];
  const all=items().list;const list=scope().key==='workspace'?all.filter(item=>essentials.includes(item.title)):all;if(!list.length)return;let step=0;const veil=make('div','tour-layer');veil.setAttribute('role','dialog');veil.setAttribute('aria-label','Guided tour');scope().host.append(veil);
  const finish=()=>{veil.remove();try{localStorage.setItem('versecue.tourSeen','1');}catch{}};
  const show=()=>{const item=list[step],r=item.el.getBoundingClientRect();veil.replaceChildren();const spot=make('div','tour-spot');Object.assign(spot.style,{left:(r.left-6)+'px',top:(r.top-6)+'px',width:(r.width+12)+'px',height:(r.height+12)+'px'});
   const card=make('div','tour-card');const meta=make('div','tour-meta');meta.append(make('span','help-muted',`${items().name} tour · Step ${step+1} of ${list.length}`+(step===list.length-1?' · More in ? Help':'')));const skip=make('button','tour-skip','Skip');skip.type='button';skip.addEventListener('click',finish);meta.append(skip);
   const dots=make('div','tour-dots');list.forEach((_,i)=>dots.append(make('span','tour-dot'+(i===step?' on':''))));
   const back=make('button','','Back');back.type='button';back.disabled=step===0;back.addEventListener('click',()=>{step=Math.max(0,step-1);show();});
   const next=make('button','tour-next',step===list.length-1?'Finish':'Next');next.type='button';next.addEventListener('click',()=>{if(step===list.length-1)finish();else{step++;show();}});
   const row=make('div','tour-row');const buttons=make('div','tour-buttons');buttons.append(back,next);row.append(dots,buttons);card.append(meta,make('b','tour-title',item.title),make('p','',item.text),row);
   card.style.left=Math.max(16,Math.min(innerWidth-360,r.left+r.width/2-170))+'px';card.style.top=(r.bottom+230>innerHeight?Math.max(16,r.top-220):r.bottom+16)+'px';veil.append(spot,card);next.focus();};
  show();
 }
 function addToggle(where,before){const b=make('button','help-toggle','?');b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','Help: explain the controls on this page');b.addEventListener('click',toggle);where.insertBefore(b,before??null);}
 const actions=document.querySelector('.header-actions');if(actions)addToggle(actions,$('stop'));
 const heading=document.querySelector('#settings-dialog .dialog-heading');if(heading)addToggle(heading,$('close-settings'));
 dialog()?.addEventListener('close',()=>{if(on)close();});
 window.addEventListener('resize',()=>{if(on)draw();});
 // First launch: wait for the first state so automated runs (VERSECUE_AUTOMATION) never see the tour.
 (async()=>{let seen=false;try{seen=localStorage.getItem('versecue.tourSeen')==='1';}catch{}if(seen)return;
  try{const r=await window.versecue.state();if(r.ok&&!r.value.automation&&!dialog()?.open)setTimeout(()=>tour(false),1200);}catch{}})();
 window.versecueHelp={toggle,tour:()=>tour(true),close,content:HELP};
})();
