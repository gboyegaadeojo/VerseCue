'use strict';
const {randomUUID}=require('node:crypto');
(async()=>{
  const url=process.env.VERSECUE_API_URL,token=process.env.VERSECUE_API_TOKEN;
  if(!/^http:\/\/127\.0\.0\.1:\d{1,5}$/.test(url??'')||!Number.isInteger(Number(url?.split(':').at(-1)))||Number(url.split(':').at(-1))<1||Number(url.split(':').at(-1))>65535||! /^[a-f0-9]{64}$/.test(token??''))throw new Error('Set the displayed VERSECUE_API_URL and session VERSECUE_API_TOKEN in this trusted client environment');
  const [command,arg,translation]=process.argv.slice(2);let route,body;
  if(command==='status')route='/v1/status';
  else if(command==='reference'){route='/v1/references';body={text:arg,requestId:randomUUID()};}
  else if(command==='prepare'){route='/v1/prepare-passage';body={reference:arg,translation};}
  else if(command==='stop'){route='/v1/stop';body={};}
  else throw new Error('Usage: private-api-client.cjs status | reference "John 3:16" | prepare "Luke 15:11-13" KJV | stop');
  const response=await fetch(url+route,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'error',signal:AbortSignal.timeout(12000)});
  const data=await response.json();console.log(JSON.stringify(data,null,2));if(!response.ok)process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
