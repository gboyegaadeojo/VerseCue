'use strict';
// Opens the recording labeller window (developer tool; not part of the packaged app). Usage: npm run label
const {spawn}=require('node:child_process'),path=require('node:path');
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const child=spawn(require('electron'),[path.resolve(__dirname,'..','labeller','main.cjs')],{env,stdio:'inherit',windowsHide:false,shell:false});
child.on('error',error=>{console.error('The labeller could not start: '+error.message);process.exitCode=1;});
child.on('exit',(code,signal)=>{process.exitCode=signal?1:(code??1);});
