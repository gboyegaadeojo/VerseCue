// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// A few observed transcript forms only; not a canonical Bible parser or send policy.
import { readFile, writeFile } from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../recordings/ifc-2026-11-15-base-en.json',import.meta.url),'utf8'));
const cases=[];
for(const segment of data.transcription??[]) {
  const text=segment.text??'';
  let finding;
  if(/\b[3-9]\s+Samuel\b/i.test(text))finding='INVALID_SAMUEL_ORDINAL_DO_NOT_AUTO_REPAIR';
  else if(/\bfor\s+Samuel\b/i.test(text))finding='AMBIGUOUS_ORDINAL_NEEDS_REVIEW';
  else if(/\bIsaiah\s+chapter\s+6\b/i.test(text))finding=/\bverses?\s+1\s+to\s+8\b/i.test(text)?'EXPLICIT_RANGE_PROPOSAL_STILL_UNVERIFIED':'CHAPTER_ONLY_NEEDS_REVIEW';
  if(finding)cases.push({relative_from_ms:segment.offsets?.from,relative_to_ms:segment.offsets?.to,absolute_from_seconds:4690+(segment.offsets?.from??0)/1000,finding,auto_eligible:false,ground_truth_verified:false});
}
await writeFile(new URL('../recordings/ifc-reference-spot-check.private.json',import.meta.url),JSON.stringify(cases,null,2));
console.log(JSON.stringify({diagnostic_only:true,cases,accuracy_scored:false,propresenter_requests:0},null,2));
