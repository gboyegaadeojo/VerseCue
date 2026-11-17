'use strict';
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
let failed=false;for(const root of ['core','desktop','ui','scripts','tests']){if(!fs.existsSync(root))continue;for(const name of fs.readdirSync(root)){if(!/\.(c?js)$/.test(name))continue;const file=path.join(root,name);const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){console.error(r.stderr);failed=true;}}}if(failed)process.exit(1);console.log('All application JavaScript syntax checks passed.');
