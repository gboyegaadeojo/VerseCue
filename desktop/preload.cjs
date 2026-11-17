'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('versecue',{
  state:()=>ipcRenderer.invoke('state'),
  command:(command,payload)=>ipcRenderer.invoke('command',command,payload),
  settings:()=>ipcRenderer.invoke('settings'),
  saveSettings:settings=>ipcRenderer.invoke('save-settings',settings),
  profiles:()=>ipcRenderer.invoke('profiles-list'),
  saveProfile:name=>ipcRenderer.invoke('profiles-save',name),
  loadProfile:id=>ipcRenderer.invoke('profiles-load',id),
  removeProfile:id=>ipcRenderer.invoke('profiles-remove',id),
  chooseWorker:()=>ipcRenderer.invoke('choose-worker'),
  chooseModel:()=>ipcRenderer.invoke('choose-model'),
  audio:samples=>ipcRenderer.invoke('audio',samples),
  beginAudio:options=>ipcRenderer.invoke('audio-start',options),
  endAudio:()=>ipcRenderer.invoke('audio-stop'),
  identity:()=>ipcRenderer.invoke('window-identity'),
  exportSettings:()=>ipcRenderer.invoke('export-settings'),
  importSettings:()=>ipcRenderer.invoke('import-settings'),
  exportDiagnostics:()=>ipcRenderer.invoke('export-diagnostics'),
  compact:()=>ipcRenderer.invoke('compact'),
  privateApiStatus:()=>ipcRenderer.invoke('private-api-status'),
  startPrivateApi:options=>ipcRenderer.invoke('private-api-start',options),
  stopPrivateApi:()=>ipcRenderer.invoke('private-api-stop'),
  copyPrivateApiToken:()=>ipcRenderer.invoke('private-api-copy-token'),
  onState:callback=>{const handler=(_event,state)=>callback(state);ipcRenderer.on('state-update',handler);return ()=>ipcRenderer.removeListener('state-update',handler);}
});
