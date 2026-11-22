'use strict';
// Accuracy check (NR-022). The operator reads short phrases with the saved input; each phrase is recognised with and
// without book-name hints and scored. Its own capture purpose: never the session, Auto, preparation or output.
// Recordings stay in this window's memory and are saved only when the operator ticks the box and chooses a folder.
(()=>{
  const el=id=>document.getElementById(id);
  let audio=null,phrases=[],index=0,rows=[],running=false,epoch=0;
  const show=(id,visible)=>{el(id).hidden=!visible;};
  const say=(id,text)=>{el(id).textContent=text;};
  // The 50 references with a sentence without a reference after every tenth, to check nothing is invented.
  function order(data){const out=[];data.prompts.forEach((p,i)=>{out.push(p);if(i%10===9&&data.withoutReferences[i/10|0])out.push(data.withoutReferences[i/10|0]);});return out;}
  function prompt(){
    say('accuracy-progress',`Phrase ${index+1} of ${phrases.length}`);say('accuracy-prompt',phrases[index].say);say('accuracy-status','Read the phrase, then pause.');
  }
  async function begin(){
    if(!el('accuracy-consent').checked){say('accuracy-status','Tick the box to confirm you may use this input.');show('accuracy-run',true);return;}
    if(typeof listening!=='undefined'&&listening){show('accuracy-run',true);say('accuracy-status','Stop listening on the main screen first, then start the check.');return;}
    // The check runs outside a service: Auto is switched off (to Confirm) and stays in dry run, as the dialog says.
    if(state?.mode==='auto'||state?.mode==='paused')await action('mode','confirm');
    phrases=order(await call('accuracyPrompts'));index=0;rows=[];const mine=++epoch;
    await call('beginAudio',{authorized:true,purpose:'accuracy-check'});running=true;
    audio=new PastorAudio({onLevel:v=>{el('accuracy-meter').value=v;},onWindow:samples=>heard(samples,mine),onHealth:()=>{},onLost:()=>finish('The input was lost, so the check stopped.'),onDiscontinuity:()=>{},onInputInfo:()=>{}});
    try{await audio.start(settings.audioDevice,settings.channel,()=>running&&mine===epoch);}catch(error){await finish(error.message);return;}
    show('accuracy-intro',false);show('accuracy-results',false);show('accuracy-run',true);show('accuracy-start',false);show('accuracy-skip',true);show('accuracy-stop',true);show('accuracy-save',false);prompt();
  }
  async function heard(samples,mine){
    if(!running||mine!==epoch||index>=phrases.length)return;const phrase=phrases[index];
    say('accuracy-status','Checking what was heard…');let result;
    try{result=await call('accuracyTranscribe',samples,phrase.expected);}catch(error){if(running)say('accuracy-status',error.message);return;}
    if(!running||mine!==epoch)return;
    if(!result.plain.text&&!result.hinted.text){say('accuracy-status',"Didn't catch that. Read the phrase again.");return;}
    rows.push({say:phrase.say,expected:phrase.expected,plain:result.plain,hinted:result.hinted,samples});next();
  }
  function next(){index++;if(index>=phrases.length)finish();else prompt();}
  function skip(){if(!running)return;rows.push({say:phrases[index].say,expected:phrases[index].expected,skipped:true});next();}
  async function finish(note=''){
    running=false;epoch++;await audio?.stop();audio=null;await call('endAudio').catch(()=>{});
    show('accuracy-run',false);show('accuracy-skip',false);show('accuracy-stop',false);show('accuracy-start',true);el('accuracy-start').textContent='Start again';
    results(note);
  }
  function tally(mode){
    const done=rows.filter(r=>!r.skipped),refs=done.filter(r=>r.expected),none=done.filter(r=>!r.expected);
    const count=o=>refs.filter(r=>r[mode].outcome===o).length,ms=done.length?Math.round(done.reduce((t,r)=>t+r[mode].elapsedMs,0)/done.length):0;
    return {correct:count('correct'),wrong:count('wrong'),missed:count('missed'),references:refs.length,invented:none.filter(r=>r[mode].outcome==='invented').length,withoutReference:none.length,ms};
  }
  function results(note){
    show('accuracy-results',true);const list=el('accuracy-misses');list.replaceChildren();
    if(!rows.some(r=>!r.skipped)){say('accuracy-summary',note||'No phrases were checked.');say('accuracy-advice','');show('accuracy-save',false);return;}
    const p=tally('plain'),h=tally('hinted'),pct=t=>t.references?Math.round(t.correct/t.references*100):0,sec=ms=>(ms/1000).toFixed(1)+' s';
    say('accuracy-summary',`${note?note+' ':''}Without hints: ${p.correct} of ${p.references} correct (${pct(p)}%), ${p.wrong} wrong, ${p.missed} missed, ${sec(p.ms)} per phrase. With book-name hints: ${h.correct} of ${h.references} correct (${pct(h)}%), ${h.wrong} wrong, ${h.missed} missed, ${sec(h.ms)} per phrase. References invented from sentences without one: ${p.invented} without hints, ${h.invented} with.`);
    const gain=h.correct-p.correct,cost=h.ms-p.ms;
    say('accuracy-advice',gain>0&&h.wrong<=p.wrong&&h.invented<=p.invented&&h.ms<=1500?'Book-name hints helped here without making phrases slow. Turn on “Book-name hints” in Settings > Speech.':gain>0?`Book-name hints caught ${gain} more, but added ${sec(Math.max(0,cost))} per phrase. Turn them on only if that delay is acceptable.`:'Book-name hints did not help here. Leave them off.');
    for(const r of rows){if(r.skipped)continue;const bad=['wrong','missed','invented'];if(!bad.includes(r.plain.outcome)&&!bad.includes(r.hinted.outcome))continue;
      const item=document.createElement('li');item.textContent=`“${r.say}” — expected ${r.expected??'no reference'}; heard “${r.plain.text||'nothing'}” (${r.plain.outcome}); with hints “${r.hinted.text||'nothing'}” (${r.hinted.outcome})`;list.append(item);}
    show('accuracy-save',true);
  }
  async function save(){
    const include=el('accuracy-include-recordings').checked;
    const payload={includeRecordings:include,rows:rows.filter(r=>!r.skipped).map(r=>({say:r.say,expected:r.expected,plain:r.plain,hinted:r.hinted,...(include?{samples:Array.from(r.samples)}:{})}))};
    try{const result=await call('accuracySave',payload);if(result.saved)say('accuracy-advice',el('accuracy-advice').textContent+' Saved to '+result.folder+'.');}catch(error){say('accuracy-advice',error.message);}
  }
  function open(){show('accuracy-intro',true);show('accuracy-run',false);show('accuracy-results',false);show('accuracy-start',true);el('accuracy-start').textContent='Start';show('accuracy-skip',false);show('accuracy-stop',false);show('accuracy-save',false);el('accuracy-include-recordings').checked=false;el('accuracy-dialog').showModal();}
  el('accuracy-check').addEventListener('click',open);
  el('accuracy-start').addEventListener('click',()=>{begin().catch(error=>{running=false;show('accuracy-run',true);say('accuracy-status',error.message);});});
  el('accuracy-skip').addEventListener('click',skip);
  el('accuracy-stop').addEventListener('click',()=>finish());
  el('accuracy-save').addEventListener('click',save);
  el('accuracy-close').addEventListener('click',async()=>{if(running)await finish();rows=[];el('accuracy-dialog').close();});
  el('accuracy-dialog').addEventListener('cancel',async event=>{if(running){event.preventDefault();await finish();}else rows=[];});
  window.versecueAccuracy={order,tally:()=>({plain:tally('plain'),hinted:tally('hinted')})};
})();
