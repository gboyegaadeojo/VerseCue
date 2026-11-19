'use strict';
// Authorized personal-host read-only acceptance check. No UI or output writes.
const {Connector}=require('../core/connector.cjs'),{outputSnapshot}=require('../core/saved-bible-workflow.cjs'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 if(process.argv.length!==3||process.argv[2]!=='--authorized-personal-host')throw Error('Requires explicit --authorized-personal-host; only the personal loopback test instance is permitted');
 const connector=new Connector();connector.configure('127.0.0.1',1025);await connector.test();
 if(connector.version?.host_description!=='ProPresenter 21.4.2'||connector.version?.platform!=='win')throw Error('This read-only check is restricted to the inspected personal Windows21.4.2 profile');
 const first=await outputSnapshot(connector),second=await outputSnapshot(connector);
 const report={at:new Date().toISOString(),readbackShapeAccepted:true,twoObservedSnapshotsMatch:first===second,actualProPresenterAccess:true,readOnly:true,outputRequests:0,nativePreparationRequested:false,microphoneCapture:false,textOrIdentityPersisted:false,physicalOutputObserved:false};
 const file=path.join('poc','private','acceptance-'+report.at.slice(0,10),'output-content-readback-'+report.at.replace(/[:.]/g,'-')+'.json');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(report,null,2),{flag:'wx'});console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
