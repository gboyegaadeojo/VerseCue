// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Inspect only the supplied sermon window; automatic captions are not ground truth.
import { readFile, writeFile } from 'node:fs/promises';
const source = new URL('../recordings/ifc-2026-11-15-captions.en.json3',import.meta.url);
const startMs=4690000,endMs=4990000;
let rows;
try {
  const data=JSON.parse(await readFile(source,'utf8'));
  rows=(data.events??[]).filter(e=>e.tStartMs>=startMs&&e.tStartMs<endMs&&e.segs)
    .map(e=>({absolute_seconds:e.tStartMs/1000,relative_seconds:(e.tStartMs-startMs)/1000,text:e.segs.map(s=>s.utf8??'').join('').trim(),source:'YOUTUBE-AUTOMATIC-CAPTIONS',ground_truth:false}))
    .filter(e=>e.text);
} catch(error) {
  if(error.code!=='ENOENT')throw error;
  // Full-service staging captions are intentionally deleted after extraction.
  rows=JSON.parse(await readFile(new URL('../recordings/ifc-2026-11-15-caption-window.private.json',import.meta.url),'utf8'));
}
await writeFile(new URL('../recordings/ifc-2026-11-15-caption-window.private.json',import.meta.url),JSON.stringify(rows,null,2));
const hints=rows.filter(e=>/\b(john|romans|corinthians|psalm|chapter|verse|philippians|timothy|hebrews|ephesians|matthew|mark|luke|acts|peter|james|genesis|revelation|proverbs|samuel|isaiah)\b/i.test(e.text));
console.log(JSON.stringify({source_id:'VbZV38kZjBg',start_seconds:4690,duration_seconds:300,caption_events:rows.length,reference_hint_count:hints.length,hints:hints.slice(0,14)},null,2));
