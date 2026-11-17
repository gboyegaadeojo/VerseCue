// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Loopback read-only allowlist. No redirects, retries, secrets or output commands.
import { writeFile } from 'node:fs/promises';
const path = process.argv[2] ?? '/version';
const port = Number(process.argv[3] ?? '1025');
const paths = new Set(['/version','/v1/doc/index.html','/v1/doc/swagger.json','/v1/libraries','/v1/looks','/v1/macros','/v1/presentation/active','/v1/presentation/slide_index','/v1/status/slide','/v1/status/layers','/v1/status/screens','/v1/themes']);
const resourceRead = /^\/v1\/(?:library|presentation)\/[0-9a-f-]{36}$/i.test(path);
if ((!paths.has(path) && !resourceRead) || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Path/port not allowlisted');
const start = performance.now();
const response = await fetch(`http://127.0.0.1:${port}${path}`, {redirect:'error', signal:AbortSignal.timeout(3000)});
console.log(JSON.stringify({path,status:response.status,elapsed_ms:Math.round(performance.now()-start)}));
if (!response.ok) throw new Error(`Read-only request rejected: ${response.status}`);
if (path === '/v1/doc/swagger.json') {
  const raw = await response.text();
  const spec = JSON.parse(raw.replace(/^\s*var openapi_spec\s*=\s*/,'').replace(/;\s*$/,''));
  console.log(JSON.stringify({info:spec.info,pathCount:Object.keys(spec.paths).length,biblePaths:Object.keys(spec.paths).filter(p=>/bible|scripture|translation/i.test(p)),keywordPresent:/bible|scripture|translation/i.test(raw)},null,2));
  if (process.argv[4] === '--save-schema') {
    await writeFile(new URL('../docs/evidence/propresenter-installed-21.4.2-openapi.txt',import.meta.url),raw,'utf8');
    console.log('Saved data-only installed schema snapshot; no Bible or host response content.');
  }
  process.exit(0);
}
if (path === '/v1/doc/index.html') {
  const html = await response.text();
  console.log(JSON.stringify({scripts:[...html.matchAll(/<script[^>]*src=["']([^"']+)/g)].map(m=>m[1]),bibleKeyword:/bible|scripture|translation/i.test(html)},null,2));
  process.exit(0);
}
const data = await response.json();
if (path === '/version') {
  const {platform,os_version,host_description,api_version} = data;
  console.log(JSON.stringify({platform,os_version,host_description,api_version},null,2));
} else if (path === '/v1/status/slide') {
  console.log(JSON.stringify({current_uuid:data.current?.uuid,current_text_length:data.current?.text?.length,next_uuid:data.next?.uuid},null,2));
} else if (/^\/v1\/presentation\//.test(path) && path !== '/v1/presentation/slide_index') {
  const summarize = p => ({id:p?.id,name:p?.name,destination:p?.destination,has_timeline:p?.has_timeline,groups:p?.groups?.map(g=>({name:g.name,slides:g.slides?.map(s=>({enabled:s.enabled,label:s.label,text_length:s.text?.length,notes_length:s.notes?.length}))}))});
  console.log(JSON.stringify(data?.presentation ? summarize(data.presentation) : summarize(data),null,2));
} else console.log(JSON.stringify(data,null,2));
