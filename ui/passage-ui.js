'use strict';
// Reference-driven preparation/review. All operations use trusted desktop IPC.
(()=>{
 const node=(tag,id,text)=>{const e=document.createElement(tag);if(id)e.id=id;if(text)e.textContent=text;return e;};
 const card=node('section','passage-workflow');card.className='passage-workflow';card.hidden=true;
 const title=node('h2',null,'Prepared passage'),reference=node('strong','passage-ready-reference'),status=node('p','passage-ready-status');status.setAttribute('role','status');
 const previews=node('div','passage-previews');
 const appearance=node('input','passage-verified');appearance.type='checkbox';const appearanceLabel=node('label');appearanceLabel.className='consent';appearanceLabel.append(appearance,document.createTextNode('I checked the complete passage, translation, theme and output Looks in ProPresenter.'));
 const target=node('input','passage-test-consent');target.type='checkbox';const targetLabel=node('label');targetLabel.className='consent';targetLabel.append(target,document.createTextNode('Send to my authorized test ProPresenter, disconnected from a live service.'));
 const confirm=node('button','confirm-passage','Confirm and show passage');confirm.type='button';confirm.className='show';confirm.disabled=true;
 const nextPart=node('button','continue-passage','Continue passage');nextPart.type='button';nextPart.hidden=true;nextPart.className='show';
 card.append(title,reference,status,previews,appearanceLabel,targetLabel,confirm,nextPart);
 document.querySelector('.studio-review').prepend(card);
 const prepare=node('button','prepare-passage','Prepare this passage');prepare.type='button';prepare.className='show';
 const controls=document.querySelector('.output-actions');controls.prepend(prepare);
 const advanced=node('details','manual-preparation-tools'),summary=node('summary',null,'Manual preparation tools');advanced.append(summary,document.querySelector('.preparation-actions'),document.querySelector('.preparation-caption'));controls.append(advanced);
 document.getElementById('show').classList.remove('show');
 let state=null,pending=false,token=null,activeToken=null;
 const selection=()=>state?.queue.find(row=>row.id===document.querySelector('#queue button[aria-pressed=true]')?.dataset.candidateId)??state?.queue.at(-1);
 const invoke=async(command,payload)=>{const r=await window.versecue.command(command,payload);if(!r.ok)throw Error(r.error);return r.value;};
 function redraw(){if(!state)return;const candidate=selection(),p=state.preparation??{phase:'idle'};prepare.disabled=pending||!candidate||state.stopped||state.busy||candidate.reference.valid!==true||candidate.reference.verse==null||candidate.reference.overLimit||!candidate.authorized;
  card.hidden=['idle','canceled'].includes(p.phase);if(card.hidden)return;
  reference.textContent=p.reference?`${p.reference} / ${p.translation}`:'Passage preparation';
  const messages={resolving:'Finding the exact passage in ProPresenter...',confirming:'Verifying and sending the explicitly confirmed passage...',continuing:'Checking current output before continuing the passage...',preparing:'Preparing the Bible passage. Listening is paused; nothing has been sent.',ambiguous:'More than one exact copy exists. Review the duplicates in ProPresenter before continuing.','consent-required':'Enable experimental focus changes and Bible-copy preparation in Settings / Advanced for this supervised test session.','part-shown':`Part ${p.partIndex+1} of ${p.partCount} has matching ProPresenter readback. Continue when ready; physical screens are not independently observed.`,'review-required':p.clippingWarning?'ProPresenter reported clipped text. Correct it and prepare again before confirming.':p.singleCue?'Review the saved ProPresenter text and actual slide appearance before confirming.':'Review every part below. Confirmation shows the first part; Continue passage advances the remaining parts deliberately.','readback-matched':'ProPresenter accepted the passage and matching readback was received. Physical screens are not independently observed.',uncertain:'Output completion is uncertain. Inspect ProPresenter; no retry was sent.',blocked:p.reason??'Preparation is blocked.'};status.textContent=messages[p.phase]??p.reason??'Review required.';
  const review=p.phase==='review-required';if(token!==p.reviewToken){token=p.reviewToken??null;appearance.checked=false;target.checked=false;previews.replaceChildren();if(review)for(const cue of p.cues??[]){const fragment=node('section');fragment.append(node('h3',null,`Part ${cue.index+1} - ${cue.label}`),node('pre',null,cue.text));previews.append(fragment);}}
  appearanceLabel.hidden=targetLabel.hidden=confirm.hidden=!review;
  const stale=review&&(state.generation!==p.reviewGeneration||state.inputEpoch!==p.reviewInputEpoch);
  if(stale&&!pending)status.textContent='The reference or session changed. Prepare the passage again before confirming.';
  confirm.textContent=p.singleCue?'Confirm and show passage':'Confirm and show first part';
  activeToken=p.activeToken??null;nextPart.hidden=p.phase!=='part-shown';nextPart.disabled=pending||state.stopped||state.mode!=='confirm';
  confirm.disabled=pending||!review||stale||p.clippingWarning===true||!appearance.checked||!target.checked||state.stopped||state.mode==='suggest';
 }
 document.getElementById('queue').addEventListener('click',()=>queueMicrotask(async()=>{if(state?.preparation?.sourceCandidateId&&state.preparation.sourceCandidateId!==selection()?.id){pending=true;redraw();try{await invoke('cancel-passage-preparation');}finally{pending=false;redraw();}}else redraw();}));
 appearance.addEventListener('change',redraw);target.addEventListener('change',redraw);
 prepare.addEventListener('click',async()=>{const candidate=selection();if(!candidate)return;pending=true;redraw();try{await invoke('prepare-passage-candidate',{id:candidate.id,acknowledgeFocusChange:document.getElementById('native-preparation-consent').checked,acknowledgeCreateCopy:document.getElementById('native-save-consent').checked});}catch(error){document.getElementById('message').textContent=error.message;status.textContent=error.message;card.hidden=false;}finally{pending=false;redraw();}});
 confirm.addEventListener('click',async()=>{if(confirm.disabled)return;pending=true;redraw();try{await invoke('confirm-passage',{reviewToken:token,verified:appearance.checked,acknowledgeTestOutput:target.checked});}catch(error){status.textContent=error.message;}finally{pending=false;redraw();}});
 nextPart.addEventListener('click',async()=>{if(nextPart.disabled)return;const current=activeToken;pending=true;redraw();try{await invoke('advance-passage',{activeToken:current});}catch(error){document.getElementById('message').textContent=error.message;status.textContent=error.message;}finally{pending=false;redraw();}});
 window.versecue.onState(next=>{state=next;redraw();});window.versecue.state().then(result=>{if(result.ok){state=result.value;redraw();}});
})();
