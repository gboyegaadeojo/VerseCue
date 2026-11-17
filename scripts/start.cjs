'use strict';
const {spawn}=require('node:child_process');const path=require('node:path');
const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
// This is the interactive product window, so do not inherit the hidden-window
// startup mode used for background speech/native helper processes.
const child=spawn(require('electron'),[path.resolve(__dirname,'..'),...process.argv.slice(2)],{env,stdio:'inherit',windowsHide:false,shell:false});
child.on('error',error=>{console.error('VerseCue could not start: '+error.message);process.exitCode=1;});
child.on('exit',(code,signal)=>{if(signal)process.exitCode=1;else process.exitCode=code??1;});
process.on('SIGINT',()=>child.kill());process.on('SIGTERM',()=>child.kill());
