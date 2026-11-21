'use strict';
// Checks the committed SBOM against the reviewed inventories; no network or vulnerability database.
const test=require('node:test'),assert=require('node:assert/strict');const {build,verify}=require('../scripts/sbom.cjs');
test('the committed CycloneDX SBOM matches the reviewed inventories and is deterministic',()=>{
  assert.doesNotThrow(()=>verify());const a=JSON.stringify(build()),b=JSON.stringify(build());assert.equal(a,b);
  const bom=build();assert.equal(bom.bomFormat,'CycloneDX');assert.equal(bom.specVersion,'1.5');assert.equal(bom.metadata.component.version,require('../package.json').version);
  const electron=bom.components.find(c=>c.name==='electron');assert.equal(electron.scope,'required','The Electron runtime ships in every build');
  assert.ok(bom.components.some(c=>c.type==='machine-learning-model'&&c.hashes[0].alg==='SHA-256'));assert.ok(bom.components.filter(c=>c.type==='file').every(c=>c.licenses[0].license.id==='OFL-1.1'));
  for(const c of bom.components.filter(c=>c.purl))assert.match(c.purl,/^pkg:npm\/(%40[^/]+\/)?[^@]+@\d/);
  assert.equal(JSON.stringify(bom).includes('timestamp'),false,'No timestamps, so rebuilding never changes the file');
});
