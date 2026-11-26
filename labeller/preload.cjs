'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('labeller',{
  open:()=>ipcRenderer.invoke('labeller:open'),
  existing:id=>ipcRenderer.invoke('labeller:existing',id),
  check:(text,translation)=>ipcRenderer.invoke('labeller:check',text,translation),
  save:file=>ipcRenderer.invoke('labeller:save',file)
});
