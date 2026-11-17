'use strict';
const http=require('node:http');
const {randomBytes,randomUUID,timingSafeEqual}=require('node:crypto');
class ApiError extends Error {constructor(status,message){super(message);this.status=status;}}
function object(value,allowed){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k)))throw new ApiError(400,'Invalid request fields');return value;}
async function jsonBody(req){
  if(req.headers['content-type']?.split(';')[0].trim()!=='application/json')throw new ApiError(415,'Use application/json');
  if(Number(req.headers['content-length'])>16384)throw new ApiError(413,'Request too large');
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>16384)throw new ApiError(413,'Request too large');chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ApiError(400,'Invalid JSON');}
}
class LocalControlAPI {
  constructor(session,{onStop=()=>session.stop(),onPrepare=null,onRevoke=()=>{},onEvent=()=>{}}={}){
    this.session=session;this.onStop=onStop;this.onPrepare=onPrepare;this.onRevoke=onRevoke;this.onEvent=onEvent;this.server=null;this.token=null;this.port=null;this.allowPreparedSend=false;this.allowPreparation=false;this.accepting=false;this.rateStart=performance.now();this.rateCount=0;
  }
  status(){return {enabled:this.accepting,host:'127.0.0.1',port:this.port,allowPreparedSend:this.allowPreparedSend,allowPreparation:this.allowPreparation,arbitraryLookup:false};}
  async start({port=0,allowPreparedSend=false,allowPreparation=false}={}){
    if(this.server)throw new Error('Private API is already enabled');
    if(!Number.isInteger(port)||port<0||port>65535||typeof allowPreparedSend!=='boolean'||typeof allowPreparation!=='boolean'||allowPreparation&&typeof this.onPrepare!=='function')throw new Error('Invalid or unavailable private API settings');
    this.token=randomBytes(32).toString('hex');this.allowPreparedSend=allowPreparedSend;this.allowPreparation=allowPreparation;
    const server=http.createServer((req,res)=>this.handle(req,res));this.server=server;
    server.maxConnections=16;server.requestTimeout=5000;server.headersTimeout=5000;server.keepAliveTimeout=1000;server.maxHeadersCount=30;
    server.on('clientError',(_error,socket)=>socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'));
    try{
      await new Promise((resolve,reject)=>{server.once('error',reject);server.listen({host:'127.0.0.1',port,exclusive:true},resolve);});
      this.port=server.address().port;this.accepting=true;this.rateStart=performance.now();this.rateCount=0;this.onEvent('PRIVATE_API_ENABLED');return this.status();
    }catch(e){server.close();this.server=null;this.token=null;this.port=null;this.allowPreparedSend=false;this.allowPreparation=false;throw e;}
  }
  async stop(){
    // Revoke before waiting for any asynchronous request-body/preflight work.
    this.accepting=false;this.token=null;this.allowPreparedSend=false;this.allowPreparation=false;const server=this.server;this.server=null;this.port=null;
    this.onRevoke();
    if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));this.onEvent('PRIVATE_API_DISABLED');}
  }
  authenticated(req){
    const expected=this.token;if(!this.accepting||!expected)return false;
    if(typeof req.headers.authorization!=='string'||!/^Bearer [a-f0-9]{64}$/.test(req.headers.authorization))return false;
    const supplied=req.headers.authorization.slice(7);
    return typeof supplied==='string'&&supplied.length===expected.length&&timingSafeEqual(Buffer.from(supplied),Buffer.from(expected));
  }
  async handle(req,res){
    const respond=(status,payload)=>{if(res.destroyed||res.headersSent)return;res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Connection':'close'});res.end(JSON.stringify(payload));};
    try{
      if(!['127.0.0.1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw new ApiError(403,'Loopback clients only');
      if(req.headers.host!==`127.0.0.1:${this.port}`||req.headers.origin)throw new ApiError(403,'Unexpected Host or browser Origin');
      if(!this.authenticated(req))throw new ApiError(401,'Valid session bearer token required');
      const authorizedToken=this.token;const url=new URL(req.url,'http://127.0.0.1');if(url.search)throw new ApiError(400,'Query parameters are not accepted');
      if(performance.now()-this.rateStart>60000){this.rateStart=performance.now();this.rateCount=0;}
      if(url.pathname!=='/v1/stop'&&++this.rateCount>60)throw new ApiError(429,'Private API rate limit reached');
      if(req.method==='GET'&&url.pathname==='/v1/status'){
        const s=this.session.snapshot();return respond(200,{mode:s.mode,dryRun:s.dryRun,stopped:s.stopped,busy:s.busy,candidateCount:s.queue.length,connection:s.connection.state,capabilities:{submitReferences:true,experimentalBiblePreparation:this.allowPreparation,preparedCueSend:this.allowPreparedSend,arbitraryBibleLookup:false,auto:false,clear:false,rearm:false}});
      }
      if(req.method!=='POST')throw new ApiError(404,'Unknown route');
      const body=await jsonBody(req);
      if(!this.accepting||this.token!==authorizedToken)throw new ApiError(403,'Private API session was revoked');
      if(url.pathname==='/v1/references'){
        object(body,['text','requestId']);
        if(typeof body.text!=='string'||body.text.length<1||body.text.length>8192||body.requestId!==undefined&&(typeof body.requestId!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(body.requestId)))throw new ApiError(400,'Invalid text or requestId');
        if(this.session.stopped||this.session.mode==='paused')throw new ApiError(409,'VerseCue is paused or stopped; rearm in the desktop app');
        const candidates=this.session.ingest(body.text,{id:'api-'+(body.requestId??randomUUID()),manual:true});
        this.onEvent('PRIVATE_API_REFERENCE_REVIEW');return respond(201,{state:'review-only',outputRequests:0,candidates:candidates.map(c=>({id:c.id,reference:c.label,translation:c.translation,expiresInMs:Math.max(0,Math.round(c.expiresAt-this.session.clock()))}))});
      }
      if(url.pathname==='/v1/stop'){object(body,[]);await this.onStop();this.onEvent('PRIVATE_API_EMERGENCY_STOP');return respond(200,{state:'stopped',alreadyAcceptedOutputRetracted:false});}
      if(url.pathname==='/v1/send'){
        object(body,['candidateId','confirmReference','confirm']);
        if(!this.allowPreparedSend)throw new ApiError(403,'API output is disabled; review and send from the desktop app');
        if(typeof body.candidateId!=='string'||typeof body.confirmReference!=='string'||body.confirm!==true)throw new ApiError(400,'Explicit candidate and matching reference confirmation required');
        this.session.expire();const c=this.session.queue.find(c=>c.id===body.candidateId);
        if(!c||body.confirmReference!==c.label)throw new ApiError(409,'Candidate expired or confirmation reference does not match');
        const result=await this.session.send(c.id,{additionalGuard:()=>this.accepting&&this.token===authorizedToken&&this.allowPreparedSend});
        this.onEvent('PRIVATE_API_PREPARED_SEND');return respond(200,result);
      }
      if(url.pathname==='/v1/prepare-passage'){
        if(!this.allowPreparation||!this.onPrepare)throw new ApiError(501,'Experimental native preparation is disabled or unavailable. No UI automation or output was attempted.');
        object(body,['reference','translation']);if(typeof body.reference!=='string'||body.reference.length>100||typeof body.translation!=='string'||body.translation.length>30)throw new ApiError(400,'Exact reference and translation required');
        const result=await this.onPrepare(body.reference,body.translation,()=>this.accepting&&this.token===authorizedToken&&this.allowPreparation);
        this.onEvent('PRIVATE_API_NATIVE_PREPARATION');return respond(200,result);
      }
      throw new ApiError(404,'Unknown route');
    }catch(error){respond(error instanceof ApiError?error.status:409,{error:error instanceof ApiError?error.message:'Operation blocked by current VerseCue state or connector validation',retry:false});}
  }
}
module.exports={LocalControlAPI};
