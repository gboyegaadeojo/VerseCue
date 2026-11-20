'use strict';
// API cue indexes follow the selected arrangement, not raw group position.
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
function invalid(reason){throw Object.assign(Error('Selected ProPresenter arrangement cue order could not be verified: '+reason),{code:'ARRANGEMENT_ORDER_UNVERIFIED'});}
function orderedPresentationCues(p){
 if(!p||!Array.isArray(p.groups)||p.groups.length>1000)invalid('missing or oversized group list');
 const raw=[],offsets=new Map();
 for(const group of p.groups){if(!group||!Array.isArray(group.slides))invalid('malformed group');if(group.slides.length>10000-raw.length)invalid('too many cues');const offset=raw.length;raw.push(...group.slides);if(uuid(group.uuid)){if(offsets.has(group.uuid.toLowerCase()))invalid('ambiguous group identity');offsets.set(group.uuid.toLowerCase(),{group,offset});}}
 if(!uuid(p.current_arrangement)||!Array.isArray(p.arrangements)||!p.arrangements.length||p.arrangements.length>100)invalid('missing selected arrangement metadata');
 const ids=new Set();for(const row of p.arrangements){if(!uuid(row?.id?.uuid)||ids.has(row.id.uuid.toLowerCase()))invalid('ambiguous arrangement identity');ids.add(row.id.uuid.toLowerCase());}
 const selected=p.arrangements.find(row=>row.id.uuid.toLowerCase()===p.current_arrangement.toLowerCase());if(!selected||!Array.isArray(selected.groups)||selected.groups.length>1000)invalid('selected arrangement is unresolved');
 // The inspected single unnamed master sentinel has no explicit groups/cues.
 // Its presentation total must account for every raw cue; named/ambiguous empty
 // arrangements never silently become the master sequence.
 if(p.arrangements.length===1&&selected.id.name===''&&selected.id.index===0&&selected.groups.length===0&&selected.total_cues===0&&Number.isInteger(p.total_cues)&&p.total_cues===raw.length){return {slides:raw,sourceIndices:raw.map((_,i)=>i),arrangementId:selected.id.uuid,arrangementMode:'single-unnamed-master',rawCueCount:raw.length};}
 if(selected.id.name===''&&selected.groups.length===0)invalid('unnamed master profile differs');
 const slides=[],sourceIndices=[];
 for(const id of selected.groups){if(!uuid(id)||!offsets.has(id.toLowerCase()))invalid('unresolved arrangement group');const {group,offset}=offsets.get(id.toLowerCase());if(group.slides.length>10000-slides.length)invalid('arrangement has too many cues');slides.push(...group.slides);sourceIndices.push(...group.slides.map((_,i)=>offset+i));if(slides.length>10000)invalid('arrangement has too many cues');}
 if(selected.total_cues!==undefined&&(!Number.isInteger(selected.total_cues)||selected.total_cues!==slides.length))invalid('arrangement cue count differs');
 return {slides,sourceIndices,arrangementId:selected.id.uuid,arrangementMode:'explicit-group-order',rawCueCount:raw.length};
}
module.exports={orderedPresentationCues};
