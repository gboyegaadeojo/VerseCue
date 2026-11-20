'use strict';
// Test oracle only: compares supplied read-only snapshots. No fetch, UI or output.
const {orderedPresentationCues}=require('../core/presentation-cue-order.cjs');
const {createHash}=require('node:crypto');
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(x);
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));return value;}
function proof(snapshot){
 const raw=JSON.stringify(snapshot);if(!raw||Buffer.byteLength(raw)>8*1024*1024)throw Error('Snapshot missing or oversized');
 const s=JSON.parse(raw);if(!uuid(s.look?.id?.uuid)||!Array.isArray(s.playlist?.items)||s.playlist.items.length>1000||!Array.isArray(s.presentations)||s.presentations.length>1000)throw Error('Incomplete configuration snapshot');
 // Only the Look top-level runtime UUID is excluded. Every configuration field remains.
 delete s.look.id.uuid;
 const documents=new Map();
 for(const p of s.presentations){if(!uuid(p?.id?.uuid)||documents.has(p.id.uuid))throw Error('Ambiguous presentation snapshot');const order=orderedPresentationCues(p);documents.set(p.id.uuid,{p,order,arrangementId:p.current_arrangement});}
 const used=new Set();
 for(const item of s.playlist.items){if(!item||typeof item!=='object')throw Error('Malformed playlist item');if(!item.presentation_info){if(item.type==='presentation')throw Error('Missing presentation item evidence');continue;}const info=item.presentation_info,doc=documents.get(info.presentation_uuid);if(!doc||!uuid(info.arrangement_uuid)||info.arrangement_uuid.toLowerCase()!==doc.arrangementId.toLowerCase())throw Error('Playlist arrangement snapshot is unresolved');used.add(info.presentation_uuid);if(doc.order.arrangementMode==='single-unnamed-master')info.arrangement_uuid='VERIFIED_SINGLE_UNNAMED_MASTER';}
 if(used.size!==documents.size)throw Error('Unreferenced or incomplete presentation evidence');
 for(const {p,order}of documents.values())if(order.arrangementMode==='single-unnamed-master'){p.current_arrangement='VERIFIED_SINGLE_UNNAMED_MASTER';p.arrangements[0].id.uuid='VERIFIED_SINGLE_UNNAMED_MASTER';}
 // Include full documents as well as projected cue sequence. No content, group,
 // cue, target, presentation identity or explicit-arrangement identity is dropped.
 const normalized={look:s.look,playlist:s.playlist,presentations:[...documents.values()].sort((a,b)=>a.p.id.uuid.localeCompare(b.p.id.uuid)).map(({p,order})=>({document:p,sourceIndices:order.sourceIndices,slides:order.slides,arrangementMode:order.arrangementMode}))};
 return createHash('sha256').update(JSON.stringify(canonical(normalized))).digest('hex');
}
function compareRestartConfiguration(before,after){const beforeSha256=proof(before),afterSha256=proof(after);return {matched:beforeSha256===afterSha256,beforeSha256,afterSha256,scope:'supplied configuration and selected cue sequence only',physicalOutputVerified:false,automaticRestore:false};}
module.exports={compareRestartConfiguration};
