'use strict';
// Automated accessibility check (docs/156): WCAG 2.2 A/AA rules from axe-core on every screen, plus VerseCue's own
// booth rules (44 px targets, visible keyboard focus, every control reachable by Tab). No microphone, no ProPresenter.
// Usage: node scripts/test-accessibility.cjs [packaged VerseCue.exe] [--report file.json]
const {_electron}=require('playwright'),path=require('node:path'),fs=require('node:fs'),{randomUUID}=require('node:crypto');
const args=process.argv.slice(2),reportAt=args.indexOf('--report'),report=reportAt>=0?args.splice(reportAt,2)[1]:null,executable=args[0]?path.resolve(args[0]):null;
const axeSource=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const TAGS=['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22a','wcag22aa'];
// Screens: [name, how to open it in the page]. Each runs on a fresh view of the same window.
const screens=[
 ['Overview',()=>document.querySelector('[data-route="overview"]').click()],
 ['Scripture queue',()=>document.querySelector('[data-route="queue"]').click()],
 ['Audio & recognition',()=>document.querySelector('[data-route="audio"]').click()],
 ['Recent actions',()=>document.querySelector('[data-route="history"]').click()],
 ...['profiles','propresenter','audio','speech','output','quotes','advanced'].map(tab=>[`Settings > ${tab}`,new Function(`document.getElementById('setup').click();document.querySelector('[data-settings="${tab}"]').click();`)]),
 ...['speech','output'].map(tab=>[`Settings > ${tab}, advanced options open`,new Function(`document.getElementById('setup').click();document.querySelector('[data-settings="${tab}"]').click();for(const d of document.querySelectorAll('#settings-dialog details'))if(d.getClientRects().length&&!d.open){d.open=true;d.dataset.a11yOpened='1';}`)]),
 ['Check accuracy',()=>document.getElementById('accuracy-dialog').showModal()],
 ['Enable Auto',()=>document.getElementById('auto-dialog').showModal()],
 ['Compact view',()=>document.getElementById('compact').click()],
];
const closeAll=()=>{for(const d of document.querySelectorAll('details[data-a11y-opened]')){d.open=false;delete d.dataset.a11yOpened;}for(const d of document.querySelectorAll('dialog[open]'))d.close();if(document.body.classList.contains('compact'))document.getElementById('compact')?.click();};
// VerseCue's own rules, measured in the page for the open screen.
function boothRules(){
 const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!el.closest('[hidden],[inert]')&&!(el.closest('details:not([open])')&&el.tagName!=='SUMMARY');};
 const scope=document.querySelector('dialog[open]')??document;
 const controls=[...scope.querySelectorAll('button,select,input:not([type=hidden]),textarea,a[href],summary')].filter(visible).filter(el=>!el.closest('dialog:not([open])'));
 const name=el=>(el.id?'#'+el.id:el.tagName.toLowerCase()+(el.dataset.route?`[data-route=${el.dataset.route}]`:el.dataset.settings?`[data-settings=${el.dataset.settings}]`:''))+' "'+(el.getAttribute('aria-label')||el.textContent||el.value||'').trim().slice(0,40)+'"';
 const small=controls.filter(el=>!['checkbox','radio','range'].includes(el.type)&&el.tagName!=='A').filter(el=>{const r=el.getBoundingClientRect();return r.height<44-0.5;}).map(el=>({control:name(el),height:Math.round(el.getBoundingClientRect().height)}));
 // Checkbox/radio targets count their label: the clickable label must be at least 44 px tall.
 const smallChoices=controls.filter(el=>['checkbox','radio'].includes(el.type)).filter(el=>{const label=el.closest('label')??(el.id&&document.querySelector(`label[for="${el.id}"]`));const r=(label??el).getBoundingClientRect();return r.height<44-0.5;}).map(el=>({control:name(el),height:Math.round((el.closest('label')??el).getBoundingClientRect().height)}));
 return {controls:controls.filter(el=>!el.disabled).map(name),small,smallChoices};
}
(async()=>{
 const env={...process.env,VERSECUE_AUTOMATION:'1'};delete env.ELECTRON_RUN_AS_NODE;
 const app=await _electron.launch({...(executable?{executablePath:executable}:{}),args:[...(executable?[]:[path.resolve(__dirname,'..')]),`--user-data-dir=${path.resolve(__dirname,'..','test-results','a11y-'+randomUUID())}`],env});
 const results=[];let failed=0;
 try{
  const page=await app.firstWindow();await page.setViewportSize({width:1366,height:768}).catch(()=>{});
  await page.waitForFunction(()=>document.getElementById('message')?.textContent.length>0);
  await page.evaluate(axeSource);
  for(const size of ['standard','booth']){
  await page.evaluate(async size=>{const s=(await window.versecue.settings()).value;const r=await window.versecue.saveSettings({...s,textSize:size});if(!r.ok)throw Error(r.error);fillSettings((await window.versecue.settings()).value);},size);
  for(const [screenName,open] of screens){const name=`${screenName} (${size==='booth'?'Booth':'Standard'} text)`;
   await page.evaluate(closeAll);await page.evaluate(open);await page.waitForTimeout(150);await page.evaluate(()=>Promise.race([Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))),new Promise(r=>setTimeout(r,2000))]));
   const axe=await page.evaluate(async tags=>{const scope=document.querySelector('dialog[open]')??document;const r=await axe.run(scope,{runOnly:{type:'tag',values:tags},resultTypes:['violations']});return r.violations.map(v=>({rule:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target.join(' '),summary:n.failureSummary?.split('\n').slice(0,3).join(' ')}))}));},TAGS);
   const booth=size==='booth'?await page.evaluate(boothRules):{small:[],smallChoices:[],controls:[]};
   // Keyboard: Tab through the screen; every enabled control must be reached and show a visible focus indicator.
   // Real Tab presses from the top of the screen until focus comes back round.
   await page.evaluate(()=>{document.activeElement?.blur?.();(document.querySelector('dialog[open]')??document.body).focus?.();});
   const seen=[],noFocusRing=new Set();
   for(let i=0;i<300;i++){
    await page.keyboard.press('Tab');
    const f=await page.evaluate(()=>{const el=document.activeElement;if(!el||el===document.body)return null;
     const key=(el.id?'#'+el.id:el.tagName.toLowerCase()+(el.dataset.route?`[data-route=${el.dataset.route}]`:el.dataset.settings?`[data-settings=${el.dataset.settings}]`:''))+' "'+(el.getAttribute('aria-label')||el.textContent||el.value||'').trim().slice(0,40)+'"';
     const s=getComputedStyle(el);const ring=el.matches(':focus-visible')&&((s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=1)||(s.boxShadow&&s.boxShadow!=='none'));return {key,ring};});
    if(!f)continue;if(seen.includes(f.key))break;seen.push(f.key);if(!f.ring)noFocusRing.add(f.key);
   }
   // Every enabled control on the screen must be reachable with Tab.
   const unreachable=booth.controls.length?booth.controls.filter(c=>!seen.includes(c)):(await page.evaluate(boothRules)).controls.filter(c=>!seen.includes(c));
   const keyboard={reached:seen.length,noFocusRing:[...noFocusRing],unreachable};
   const row={screen:name,textSize:size,axe,small:booth.small,smallChoices:booth.smallChoices,noFocusRing:keyboard.noFocusRing,unreachable:keyboard.unreachable,controls:booth.controls.length};
   const problems=axe.length+booth.small.length+booth.smallChoices.length+keyboard.noFocusRing.length+keyboard.unreachable.length;failed+=problems;results.push(row);
   console.log(`${problems?'FAIL':'ok  '} ${name}: ${axe.length} WCAG rule(s), ${size==='booth'?(booth.small.length+booth.smallChoices.length)+' under 44 px, ':''}${keyboard.noFocusRing.length} without a focus ring, ${keyboard.unreachable.length} not reachable by Tab (${keyboard.reached} reached)`);
   for(const v of axe)console.log(`     ${v.impact} ${v.rule}: ${v.help} -> ${v.nodes.slice(0,4).map(n=>n.target).join(', ')}${v.nodes.length>4?` (+${v.nodes.length-4})`:''}`);
   for(const s of [...booth.small,...booth.smallChoices].slice(0,6))console.log(`     small target ${s.control} ${s.height} px`);
   for(const k of keyboard.noFocusRing.slice(0,6))console.log(`     no focus ring: ${k}`);
   for(const k of keyboard.unreachable.slice(0,6))console.log(`     not reachable by Tab: ${k}`);
  }}
 }finally{await app.close();}
 if(report)fs.writeFileSync(report,JSON.stringify({at:new Date().toISOString(),axe:require('axe-core/package.json').version,tags:TAGS,results},null,1));
 console.log(failed?`${failed} accessibility problem(s) found.`:`Accessibility check passed on ${results.length} screens.`);process.exitCode=failed?1:0;
})().catch(error=>{console.error(error);process.exitCode=1;});
