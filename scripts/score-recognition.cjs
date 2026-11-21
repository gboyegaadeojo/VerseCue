'use strict';
// Explicit offline diagnostic. No capture, network, output control or transcript export.
const fs=require('node:fs/promises'),path=require('node:path'),{createHash}=require('node:crypto'),{evaluateRecognition}=require('./recognition-evaluation.cjs');
async function writeReport(reportName,report,repoRoot=path.resolve(__dirname,'..')){
 if(typeof reportName!=='string'||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(reportName)||!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}\.json$/.test(reportName))throw Error('Use a plain JSON report filename');
 let directory=await fs.realpath(repoRoot);
 for(const part of ['test-results','recognition-evaluation']){directory=path.join(directory,part);await fs.mkdir(directory,{mode:0o700}).catch(error=>{if(error.code!=='EEXIST')throw error;});const stat=await fs.lstat(directory);if(!stat.isDirectory()||stat.isSymbolicLink()||path.relative(directory,await fs.realpath(directory))!=='')throw Error('Private report directory must not be linked');}
 await fs.writeFile(path.join(directory,reportName),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
}
async function main(args){
 if(args.length===1&&args[0]==='--help'){console.log('Usage: node scripts/score-recognition.cjs <dataset.json> <new-report-name.json>\nReports stay in ignored test-results/recognition-evaluation/. No existing report is overwritten.');return;}
 if(args.length!==2)throw Error('Supply a dataset JSON file and a new report filename; use --help');
 let bytes;try{const stat=await fs.stat(args[0]);if(!stat.isFile()||stat.size>4*1024*1024)throw Error();bytes=await fs.readFile(args[0]);if(bytes.length>4*1024*1024)throw Error();}catch{throw Error('Cannot read a bounded local dataset JSON file');}
 let data;try{data=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''));}catch{throw Error('Dataset is not valid JSON');}
 const report={...evaluateRecognition(data),datasetSha256:createHash('sha256').update(bytes).digest('hex'),generatedAt:new Date().toISOString()};
 try{await writeReport(args[1],report);}catch(error){if(error.code==='EEXIST')throw Error('Report already exists; choose a new filename');throw Error('Cannot safely write the private report');}
 console.log(JSON.stringify({written:true,scoredRealHeldOutClips:report.realHeldOut.scoredClips,excludedCases:report.excluded.length,serviceAcceptancePassed:false}));
}
if(require.main===module)main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={main,writeReport};
