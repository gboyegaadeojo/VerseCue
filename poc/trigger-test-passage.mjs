// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Explicitly authorized personal loopback test host. Dry-run default, no retries.
import { createHash } from 'node:crypto';
const fixtures = {
  john: { uuid:'b1c6194a-50d9-461f-9d27-33b388b7d8a1',name:'John 3_16 (KJV)',reference:'John 3:16' },
  romans: { uuid:'4d560241-f2bf-4198-a1bc-89af656f27e7',name:'Romans 8_28 (KJV)',reference:'Romans 8:28' }
};
const key=process.argv[2];
const cue=Number(process.argv[3] ?? '0');
const fixture=fixtures[key];
if (!fixture || ![0,1].includes(cue)) throw new Error('Only the two inspected test presentations and cue 0/1 are allowed');
const path=`/v1/presentation/${fixture.uuid}/${cue}/trigger`;
if (!process.argv.includes('--send-authorized-personal-test')) {
  console.log(JSON.stringify({dry_run:true,reference:fixture.reference,cue,path,network_requests:0}));
  process.exit(0);
}
const base='http://127.0.0.1:1025';
async function read(path) {
  const response=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(3000)});
  if (!response.ok) throw new Error(`Preflight/readback HTTP ${response.status}`);
  return response.json();
}
const version=await read('/version');
if(version.platform!=='win'||version.host_description!=='ProPresenter 21.4.2')throw new Error('Test-host build mismatch');
const payload=await read(`/v1/presentation/${fixture.uuid}`);
const presentation=payload.presentation ?? payload;
if(presentation.id?.name!==fixture.name||presentation.destination!=='presentation'||presentation.has_timeline)throw new Error('Inspected presentation identity/destination/timeline changed');
const slides=presentation.groups.flatMap(g=>g.slides);
if(!slides[cue]?.enabled||slides[cue].label!==fixture.reference)throw new Error('Cue not valid');
const start=performance.now();
let response;
try {
  response=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(3000)});
} catch(error) {
  console.log(JSON.stringify({reference:fixture.reference,cue,state:'UNCERTAIN',retry:false,reason:'Dispatch response unavailable; inspect ProPresenter before any fresh action'}));
  throw error;
}
const result={utc:new Date().toISOString(),reference:fixture.reference,translation:'KJV (selected in ProPresenter UI)',cue,status:response.status,http_ms:Math.round(performance.now()-start),retry:false,physical_output_verified:false};
if(response.status!==204){console.log(JSON.stringify({...result,state:'REJECTED_OR_UNEXPECTED'}));process.exit(1);}
try {
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  let active,index,slide;
  const deadline=performance.now()+2000;
  do {
    active=await read('/v1/presentation/active');
    index=await read('/v1/presentation/slide_index');
    slide=await read('/v1/status/slide');
    if(index.presentation_index?.presentation_id?.uuid===fixture.uuid && index.presentation_index?.index===cue && clean(slide.current?.text)===clean(slides[cue].text)) break;
    if(performance.now()<deadline) await new Promise(resolve=>setTimeout(resolve,100));
  } while(performance.now()<deadline);
  const text=slide.current?.text??'';
  const indexMatches=index.presentation_index?.presentation_id?.uuid===fixture.uuid && index.presentation_index?.index===cue;
  const textMatches=clean(text)===clean(slides[cue].text);
  console.log(JSON.stringify({...result,state:indexMatches&&textMatches?'RECEIPT_AND_MATCHING_READBACK':'RECEIPT_READBACK_MISMATCH',readback_elapsed_ms:Math.round(performance.now()-start),active_name:active.presentation?.id?.name??active.id?.name,slide_index:index,text_length:text.length,text_sha256:createHash('sha256').update(text).digest('hex'),text_matches_saved_cue:textMatches},null,2));
} catch(error) {
  console.log(JSON.stringify({...result,state:'RECEIPT_ONLY_READBACK_FAILED',retry:false}));
  throw error;
}
