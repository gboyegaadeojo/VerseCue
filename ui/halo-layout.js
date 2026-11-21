'use strict';
// Halo layout (design 5): a graphite three-column workspace with a mode switch in the toolbar,
// the live transcript above the reference, a listening orb with a "how clearly it was heard" ring,
// and connection status on the right. Layout only: every ID, handler, status and output gate is unchanged.
(()=>{
 const q=selector=>document.querySelector(selector);
 const make=(tag,className,attrs={})=>{const el=document.createElement(tag);if(className)el.className=className;for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
 const svg=(tag,attrs)=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
 document.body.classList.add('halo');
 const nav=q('.sidebar'),strip=q('.status-strip'),actions=q('.header-actions'),workspace=q('.workspace'),main=q('.workspace>main'),mode=q('#mode');

 // Toolbar mode switch. It drives the existing #mode menu, so Auto still opens its consent dialog.
 if(nav&&mode){
  const seg=make('div','halo-seg',{role:'group','aria-label':'Mode'});
  const label=option=>option.textContent.replace(/\s+-\s+.*$/,'');
  const sync=()=>{
   const want=[...mode.options].map(o=>o.value+'|'+label(o)).join(',')+'#'+mode.value+'#'+mode.disabled;
   if(seg.dataset.sig===want)return;seg.dataset.sig=want;
   seg.replaceChildren(...[...mode.options].map(option=>{const button=make('button','',{type:'button','data-mode':option.value,'aria-pressed':String(mode.value===option.value)});button.textContent=label(option);button.disabled=mode.disabled;button.addEventListener('click',()=>{if(mode.value===option.value||mode.disabled)return;mode.value=option.value;mode.dispatchEvent(new Event('change',{bubbles:true}));sync();});return button;}));
  };
  sync();new MutationObserver(sync).observe(mode,{attributes:true,childList:true,subtree:true,characterData:true});mode.addEventListener('change',sync);setInterval(sync,400);
  if(actions)nav.insertBefore(seg,actions);else nav.append(seg);
 }
 q('#setup')?.setAttribute('aria-label','Settings');

 // Right column: connection, audio, speech and translation as grouped rows, plus the dry-run notice.
 if(workspace){
  const side=make('aside','halo-side',{'aria-label':'Status'});
  if(strip){strip.classList.remove('route-status');strip.classList.add('halo-status');side.append(strip);}
  const names={PROPRESENTER:'ProPresenter','AUDIO INPUT':'Pastor mic','SPEECH ENGINE':'Speech',TRANSLATION:'Translation'};strip?.querySelectorAll(':scope>div>span').forEach(span=>{const name=names[span.textContent.trim().toUpperCase()];if(name)span.textContent=name;});
  const banner=q('#target-banner');if(banner)side.append(banner);
  const note=q('.preview-note');if(note)side.append(note);
  workspace.append(side);
 }

 // Centre: the live transcript strip sits above the reference.
 const transcript=q('.audio-panel .transcript');
 if(main&&transcript){transcript.classList.add('halo-live');const overview=q('.studio-overview');main.prepend(transcript);const tag=transcript.querySelector(':scope>span');if(tag)tag.textContent='Live';}

 // Stage: listening orb inside a confidence ring, beside the large reference.
 const candidate=q('#candidate'),reference=q('#reference');
 let ring=null,tag=null;
 if(candidate&&reference){
  const head=make('div','halo-head');const orb=make('div','halo-orb',{'aria-hidden':'true'});
  orb.append(make('span','halo-wave'),make('span','halo-wave halo-wave-b'),make('span','halo-core'));
  const ringSvg=svg('svg',{viewBox:'0 0 92 92',width:'92',height:'92','aria-hidden':'true'});
  ringSvg.append(svg('circle',{cx:'46',cy:'46',r:'42',class:'halo-ring-track'}));ring=svg('circle',{cx:'46',cy:'46',r:'42',class:'halo-ring','stroke-dasharray':'264','stroke-dashoffset':'264',transform:'rotate(-90 46 46)'});ringSvg.append(ring);orb.append(ringSvg);
  const titles=make('div','halo-titles');const translation=q('#candidate-translation');
  candidate.insertBefore(head,reference);titles.append(reference);
  const meta=make('div','halo-meta');tag=make('span','halo-tag',{hidden:''});if(translation)meta.append(tag,translation);else meta.append(tag);titles.append(meta);
  head.append(orb,titles);
 }
 // "How clearly it was heard" comes from the speech engine when it reports it; otherwise the ring stays neutral.
 const levels=[[.85,'clear','Heard clearly'],[.65,'likely','Likely'],[0,'check','Check this']];
 const updateRing=state=>{
  if(!ring||!tag)return;
  const label=reference?.textContent.trim();const item=(state?.queue??[]).find(c=>c.label===label)??null;
  const value=Number.isFinite(item?.heardConfidence)?Math.max(0,Math.min(1,item.heardConfidence)):null;
  if(value===null){ring.setAttribute('stroke-dashoffset','264');ring.dataset.level='none';tag.hidden=true;return;}
  const [,level,text]=levels.find(([min])=>value>=min);
  ring.setAttribute('stroke-dashoffset',String(Math.round(264*(1-value))));ring.dataset.level=level;
  tag.hidden=false;tag.dataset.level=level;tag.textContent=text+' · '+Math.round(value*100)+'%';
 };
 // "Heard this service" timeline: under each reference, what was heard and how clearly (as in the Halo design).
 const badge=value=>{const [,level,text]=levels.find(([min])=>value>=min);const el=make('span','halo-tag',{'data-level':level});el.textContent=text+' · '+Math.round(value*100)+'%';return el;};
 const enrichQueue=state=>{
  for(const row of document.querySelectorAll('#queue .queue-item')){
   const button=row.querySelector('button[data-candidate-id]');const item=(state?.queue??[]).find(c=>c.id===button?.dataset.candidateId);if(!item||row.querySelector('.halo-heard'))continue;
   const detail=make('div','halo-heard');detail.addEventListener('click',()=>button.click());
   if(item.phrase){const words=make('span','halo-phrase');words.textContent='“'+item.phrase.slice(0,90)+(item.phrase.length>90?'…':'')+'”';detail.append(words);}
   const meta=make('span','halo-heard-meta');if(Number.isFinite(item.heardConfidence))meta.append(badge(Math.max(0,Math.min(1,item.heardConfidence))));
   const kind=make('span','halo-kind');kind.textContent=item.recognition==='quote'?'Quoted wording':'Spoken';meta.append(kind);detail.append(meta);row.append(detail);
  }
 };
 if(typeof window.render==='function'){const original=window.render;window.render=function(state){const result=original.apply(this,arguments);try{updateRing(state);enrichQueue(state);}catch{}return result;};}
})();
