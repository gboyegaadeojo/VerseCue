'use strict';
// Bundled public-domain wordings (KJV, WEB) for quoted-wording recognition only.
// Built once, in small slices, so loading never freezes the app.
const path=require('node:path'),fs=require('node:fs/promises');const {QuoteMatcher,MultiQuoteMatcher}=require('./quote-matcher.cjs');
let cached=null;
function publicDomainQuoteMatcher(){
  if(!cached)cached=(async()=>{
    const load=async name=>new QuoteMatcher(JSON.parse(await fs.readFile(path.join(__dirname,'data',name),'utf8')),{rightsAcknowledged:true,anyTranslation:true,trustedReferences:true,shortlistLimit:8000,defer:true}).buildAsync();
    return new MultiQuoteMatcher([await load('quote-index-kjv.json'),await load('quote-index-web.json')]);
  })().catch(error=>{cached=null;throw error;});
  return cached;
}
module.exports={publicDomainQuoteMatcher};
