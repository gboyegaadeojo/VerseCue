'use strict';
// Settings > Speech status line (2026-11-24 user report: speech settings were confusing and VerseCue felt slow).
// Says in plain words which engine is in use, where it runs, and how long the last phrase and the last ProPresenter
// opening took, so slowness can be traced to recognition or to preparation. Display only.
(()=>{
  const el=id=>document.getElementById(id);
  const seconds=ms=>(ms/1000).toFixed(1)+' s';
  function lastMetric(events,code,key){for(let i=(events?.length??0)-1;i>=0;i--){const e=events[i];if(e.code===code&&Number.isFinite(e.metrics?.[key]))return e.metrics[key];}return null;}
  function describe(state){
    const engine=state.speechEngine,gpu=state.speechGpu,device=state.speechGpuDevice;
    if(!engine)return 'No speech engine is set up yet.';
    const doing={ready:'is running on the graphics card'+(device?` (${device})`:''),warming:'is running on the processor while the graphics card gets ready (the first start can take a few minutes)',pending:'is starting',unavailable:'is running on the processor (no usable graphics card was found)',cpu:'is running on the processor (the graphics card is turned off in Advanced speech options)'}[gpu]??'is ready';
    const which=engine.cuda?'The NVIDIA engine you set up':engine.builtIn?'VerseCue’s built-in speech engine':'A speech engine you chose';
    return `${which} ${doing}.`;
  }
  function render(state){
    if(!state||!el('speech-summary-text'))return;
    el('speech-summary-text').textContent=describe(state);
    const heard=lastMetric(state.events,'STT_WINDOW_COMPLETE','sttWorkerMs'),opened=lastMetric(state.events,'NATIVE_BIBLE_PREPARED_REVIEW','nativeWorkerMs');
    el('speech-timing').textContent=[heard!=null?`Last phrase recognised in ${seconds(heard)}.`:'',opened!=null?`Last passage opened in ProPresenter in ${seconds(opened)}.`:''].filter(Boolean).join(' ')||'Timings appear here after VerseCue hears a phrase.';
    el('use-builtin-speech').hidden=!state.speechEngine||state.speechEngine.builtIn||state.speechEngine.cuda;
  }
  el('use-builtin-speech')?.addEventListener('click',async()=>{try{fillSettings(await call('useBuiltInEngine'));el('speech-summary-text').textContent='Now using VerseCue’s built-in speech engine.';}catch(error){el('speech-summary-text').textContent=error.message;}});
  api.onState(render);call('state').then(render).catch(()=>{});
  window.versecueSpeechSummary={describe};
})();
