'use strict';
const {parse}=require('./parser.cjs');
const {planSavedPassage}=require('./bible-passage-plan.cjs');
const {createHash}=require('node:crypto');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function outputKey(data){const p=data?.presentation_index;if(p===null)return null;if(!p||typeof p.presentation_id?.uuid!=='string'||!Number.isInteger(p.index))throw Error('Output identity could not be checked');return p.presentation_id.uuid+'|'+p.index;}
async function outputSnapshot(connector){
 const [identity,slide]=await Promise.all([connector.read('/v1/presentation/slide_index'),connector.read('/v1/status/slide')]);
 const key=outputKey(identity);
 if(!slide||!Object.hasOwn(slide,'current')||slide.current!==null&&(typeof slide.current!=='object'||typeof slide.current.text!=='string'||slide.current.text.length>100000))throw Error('Current output text could not be checked before preparation');
 if(key!==null&&slide.current===null)throw Error('Current output identity and text could not be checked together');
 return createHash('sha256').update(JSON.stringify([key,slide.current?.text??null])).digest('hex');
}
async function playlistSnapshot(connector,uuid=undefined){
 if(uuid===undefined){const focused=await connector.read('/v1/playlist/focused');if(focused.playlist===null)return {uuid:null,fingerprint:null};uuid=focused.playlist?.uuid;}
 if(typeof uuid!=='string'||!/^[a-f0-9-]{36}$/i.test(uuid))throw Error('Service playlist identity could not be checked before preparation');
 const playlist=await connector.read('/v1/playlist/'+uuid);
 if(playlist.id?.uuid!==uuid||!Array.isArray(playlist.items)||playlist.items.length>2000)throw Error('Service playlist contents could not be checked');
 return {uuid,fingerprint:createHash('sha256').update(JSON.stringify(playlist)).digest('hex')};
}
function contained(label,requested,translation){const rows=parse(label,{defaultTranslation:translation}).references;if(rows.length!==1||rows[0].valid!==true||rows[0].book!==requested.book||rows[0].verse==null)return false;const r=rows[0],start=[requested.chapter,requested.verse],end=[requested.endChapter??requested.chapter,requested.endVerse??requested.verse],a=[r.chapter,r.verse],b=[r.endChapter??r.chapter,r.endVerse??r.verse];const compare=(x,y)=>x[0]-y[0]||x[1]-y[1];return compare(a,start)>=0&&compare(b,end)<=0;}
class SavedBibleWorkflow {
 constructor({service,connector,catalog,controller,maxCopyAttempts=100,onPreparedCopy=()=>{},onUncertain=()=>{}}){if(!Number.isInteger(maxCopyAttempts)||maxCopyAttempts<1||maxCopyAttempts>100)throw Error('Invalid native copy budget');Object.assign(this,{service,connector,catalog,controller,maxCopyAttempts,onPreparedCopy,onUncertain});this.copyAttempts=0;this.busy=false;this.epoch=0;}
 readiness(){if(this.copyAttempts>=this.maxCopyAttempts)return {available:false,copyAttemptsRemaining:0,reason:'The native copy-attempt limit for this app run was reached. Reuse saved passages or prepare manually in ProPresenter. No copies were deleted.'};return {...this.controller.readiness(),copyAttemptsRemaining:this.maxCopyAttempts-this.copyAttempts};}
 cancel(){this.epoch++;}
 prepareCandidate(id,options={}){this.service.expire();const c=this.service.queue.find(c=>c.id===id);if(!c||c.generation!==this.service.generation||!c.authorized||c.reference.valid!==true||c.reference.overLimit||c.reference.verse==null||c.issues.some(i=>/Invalid|no-show|not supported/.test(i)))throw Error('Choose a valid unexpired reference before saving a Bible copy');return this.prepare(c.label,c.translation,options.libraryId??null);}
 async prepare(reference,translation,libraryId=null,additionalGuard=()=>true,{keepListening=false}={}){
  if(this.busy)throw Error('A saved Bible preparation is already in progress');
  const parsed=parse(reference,{defaultTranslation:translation}),requested=parsed.references[0];if(parsed.references.length!==1||!requested||requested.label!==reference||requested.valid!==true||requested.verse==null||requested.overLimit)throw Error('Use one valid canonical passage of at most ten verses');
  if(this.copyAttempts>=this.maxCopyAttempts)throw Error('Native copy-attempt limit reached; reuse existing passages or prepare manually. No copies were deleted.');
  this.busy=true;const epoch=++this.epoch,target=this.connector.generation,base=this.connector.base;let preparedGeneration=null,nativeAttempted=false;
  const guard=()=>epoch===this.epoch&&target===this.connector.generation&&base===this.connector.base&&!this.service.stopped&&!this.service.recovery?.required&&additionalGuard()&&(preparedGeneration===null||this.service.generation===preparedGeneration);
  try{
   if(!guard())throw Error('Saved preparation canceled');
   const libraries=await this.catalog.libraries();if(!guard())throw Error('Target/session changed before Bible preparation');
   // The inspected native Save As profile saves into the sole current library.
   // Multiple-library destination selection is not guessed or silently changed.
   if(libraries.length!==1||libraryId&&libraries[0].uuid!==libraryId)throw Error('The verified Windows save-copy profile currently requires one unambiguous library; use manual preparation for other layouts');
   const library=libraries[0],before=new Set((await this.catalog.presentations(library.uuid)).map(p=>p.uuid));
   const activeBefore=await outputSnapshot(this.connector),playlistBefore=await playlistSnapshot(this.connector);if(!guard())throw Error('Saved preparation canceled before UI access');
   this.copyAttempts++;nativeAttempted=true;const receipt=await this.controller.prepare(reference,translation,guard,{saveCopy:true,keepListening});preparedGeneration=receipt.preparedGeneration;
   if(receipt.saveCopyRequested!==true||!Number.isInteger(preparedGeneration)||!guard())throw Error('Saved-copy completion was not verified; inspect ProPresenter before retrying');
   const deadline=performance.now()+2000;let created=[];
   while(performance.now()<deadline){if(!guard())throw Error('Saved preparation canceled; a new local presentation may remain');created=(await this.catalog.presentations(library.uuid)).filter(p=>!before.has(p.uuid));if(created.length>1)throw Error('Multiple new presentations appeared; choose the correct copy manually');if(created.length===1)break;await sleep(100);}
   if(created.length!==1||!guard())throw Error('New saved copy was not identified; inspect ProPresenter before retrying');
   const item=created[0],inspected=await this.connector.inspect(item.uuid),p=inspected.p,slides=inspected.slides;
   if(!guard()||p.id?.uuid!==item.uuid||p.destination!=='presentation'||p.has_timeline||!String(p.id?.name??'').endsWith('('+translation+')')||!slides.length||slides.length>100||slides.some(s=>!s.enabled||typeof s.text!=='string'||!s.text.trim()||!contained(s.label,requested,translation)))throw Error('Saved passage identity/translation/cues could not be verified; review the copy manually');
   const passagePlan=planSavedPassage({p,slides},{uuid:item.uuid,reference,translation});
   const activeAfter=await outputSnapshot(this.connector);if(!guard()||activeAfter!==activeBefore)throw Error('Output identity or text changed during preparation; inspect ProPresenter and do not send automatically');
   if(playlistBefore.uuid){const playlistAfter=await playlistSnapshot(this.connector,playlistBefore.uuid);if(!guard()||playlistAfter.fingerprint!==playlistBefore.fingerprint)throw Error('Service playlist changed during preparation; inspect ProPresenter before continuing');}
   this.service.log('NATIVE_BIBLE_COPY_SAVED_REVIEW');this.service.notify();
   this.onPreparedCopy({uuid:item.uuid,fingerprint:passagePlan.fingerprint,clippingWarning:receipt.clippingWarning===true});
   return {state:'saved-copy-needs-operator-review',reference,translation,library,uuid:item.uuid,fingerprint:passagePlan.fingerprint,name:item.name,cueCount:slides.length,coverageComplete:passagePlan.coverageComplete,numberingVerified:passagePlan.numberingVerified,coverageBasis:passagePlan.coverageBasis,cueIndices:passagePlan.cueIndices,servicePlaylistChecked:playlistBefore.uuid!==null,servicePlaylistUnchanged:playlistBefore.uuid?true:null,bibleTextVerified:false,clippingWarning:receipt.clippingWarning===true,workerElapsedMs:receipt.workerElapsedMs,nativeStageStartedAtMs:receipt.nativeStageStartedAtMs??{},preparedGeneration,outputRequests:0,outputObserved:false,formattingVerified:false};
  }catch(error){if(nativeAttempted)this.onUncertain();throw error;}finally{this.busy=false;}
 }
}
module.exports={SavedBibleWorkflow,contained,outputKey,outputSnapshot,playlistSnapshot};
