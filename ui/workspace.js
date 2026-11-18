'use strict';
window.workspace={
 route(name){for(const panel of document.querySelectorAll('[data-route-panel]'))panel.hidden=panel.dataset.routePanel!==name;for(const button of document.querySelectorAll('[data-route]'))button.setAttribute('aria-current',button.dataset.route===name?'page':'false');const titles={overview:'Overview',queue:'Scripture queue',audio:'Audio & recognition',history:'Recent actions'};document.getElementById('workspace-title').textContent=titles[name];document.getElementById('page-title').textContent=name==='overview'?'Scripture review':titles[name];if(name==='queue')document.getElementById('queue-workspace').append(document.getElementById('queue'));else document.querySelector('.queue-panel').append(document.getElementById('queue'));if(name==='history')document.getElementById('history-workspace').append(document.getElementById('history'));},
 settings(name='profiles'){for(const panel of document.querySelectorAll('[data-settings-panel]'))panel.hidden=panel.dataset.settingsPanel!==name;for(const button of document.querySelectorAll('[data-settings]'))button.setAttribute('aria-current',button.dataset.settings===name?'page':'false');}
};
const historyHome=document.getElementById('history').parentElement;
const originalRoute=window.workspace.route;window.workspace.route=name=>{if(name!=='history')historyHome.append(document.getElementById('history'));originalRoute(name);};
for(const button of document.querySelectorAll('[data-route]'))button.addEventListener('click',()=>window.workspace.route(button.dataset.route));
for(const button of document.querySelectorAll('[data-settings]'))button.addEventListener('click',()=>window.workspace.settings(button.dataset.settings));
for(const button of document.querySelectorAll('[data-open-settings]'))button.addEventListener('click',()=>{document.getElementById('setup').click();window.workspace.settings(button.dataset.openSettings);});
document.getElementById('queue').addEventListener('click',event=>{if(event.target.closest('button'))window.workspace.route('overview');});
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='k'&&!document.body.classList.contains('compact')&&!document.querySelector('dialog[open]')){event.preventDefault();window.workspace.route('overview');document.getElementById('reference-input').focus();}if(!document.body.classList.contains('compact')&&event.altKey&&/^[1-4]$/.test(event.key)&&!document.querySelector('dialog[open]')){event.preventDefault();window.workspace.route(['overview','queue','audio','history'][Number(event.key)-1]);}});

if(new URLSearchParams(location.search).has('compact'))document.querySelector('main').prepend(document.querySelector('.mode-bar'));
