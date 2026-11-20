'use strict';
// Versions only: no Bible text, host data, local paths or session content.
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
function referenceMetadataVersions(){
  const hash=name=>createHash('sha256').update(fs.readFileSync(path.join(__dirname,name),'utf8').replace(/\r\n/g,'\n')).digest('hex');
  const bounds=require('./kjv-versification.json');
  return {
    schemaVersion:1,
    hashNormalization:'UTF-8 with CRLF normalized to LF',
    dictionary:{version:'versecue-english-parser-sha256:'+hash('parser.cjs'),scope:'Canonical book names and tested English aliases in bundled parser source',provenance:'VerseCue reference parser; source-addressed version includes parser logic as well as dictionary'},
    versification:{schemaVersion:bounds.schemaVersion,system:bounds.system,source:bounds.source,sourceVersion:bounds.sourceVersion,license:bounds.license,sha256:hash('kjv-versification.json')}
  };
}
module.exports={referenceMetadataVersions};
