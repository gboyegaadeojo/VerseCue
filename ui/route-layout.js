'use strict';
// Route layout: arranges the existing controls like the chosen Route artboard (NR-010):
// one black top bar, a left column (Which passage?, heard references, audio, session) and the reference card.
// Layout only. Every ID, handler, status and output gate is unchanged.
(()=>{
 const q=selector=>document.querySelector(selector);
 document.body.classList.add('route-layout');
 const sidebar=q('.sidebar'),strip=q('.status-strip'),actions=q('.header-actions');
 // Top bar: brand and navigation (the sidebar), then the live status pills and the header actions.
 if(sidebar&&strip&&actions){strip.classList.add('route-status');sidebar.append(strip,actions);}
 const feed=q('.studio-feed'),manual=q('.studio-review>.manual')??q('.manual'),detections=q('.studio-detections');
 if(feed&&manual){
  const label=manual.querySelector('label[for="reference-input"]');if(label)label.textContent='Which passage?';
  const heading=feed.querySelector('.studio-panel-heading');feed.insertBefore(manual,heading?heading.nextSibling:feed.firstChild);
  if(detections)manual.after(detections);
 }
 const queueHeading=q('.queue-panel h2');if(queueHeading?.firstChild)queueHeading.firstChild.textContent='Heard this service ';
 // Mode and Auto status sit above the reference card; session history and reset close the left column.
 const modeBar=q('.mode-bar'),pageHeading=q('.page-heading');if(modeBar&&pageHeading)pageHeading.after(modeBar);
 const history=q('#history')?.closest('section'),boundary=q('.boundary');
 if(feed){const session=document.createElement('section');session.className='route-session';session.setAttribute('aria-label','Session');if(history)session.append(history);if(boundary)session.append(boundary);feed.append(session);}
 q('.inspector')?.classList.add('route-inspector');
})();
