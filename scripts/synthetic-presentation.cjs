'use strict';
// SYNTHETIC API fixtures only. Never imported by application code.
const {createHash}=require('node:crypto');
function fixtureUUID(key){const hex=createHash('sha256').update(String(key)).digest('hex').slice(0,32);return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');}
function presentation(p){if(!p||!Array.isArray(p.groups)||Object.hasOwn(p,'arrangements')||Object.hasOwn(p,'current_arrangement'))return p;const identity=p.id?.uuid??'synthetic',arrangement=fixtureUUID(identity+' master');return {...p,groups:p.groups.map((g,index)=>({...g,uuid:g.uuid??fixtureUUID(identity+' group '+index)})),total_cues:p.groups.reduce((n,g)=>n+(g.slides?.length??0),0),current_arrangement:arrangement,arrangements:[{id:{uuid:arrangement,name:'',index:0},groups:[],total_cues:0}]};}
function apiFixture(data){if(data&&Array.isArray(data.presentation?.groups))return {...data,presentation:presentation(data.presentation)};return presentation(data);}
const apiJSON=(data,...args)=>JSON.stringify(apiFixture(data),...args);
const apiResponse=(data,options)=>Response.json(apiFixture(data),options);
module.exports={apiFixture,apiJSON,apiResponse};
