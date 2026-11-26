'use strict';
// NR-030 (docs/155): on Windows, ProPresenter slows down over a session after its Bible has been read through
// accessibility (docs/153), and only restarting ProPresenter clears it. VerseCue never restarts ProPresenter.
// This watches how long ProPresenter took to open each chapter and, when it is clearly slowing, suggests a
// restart at a quiet moment. A quick chapter afterwards (for example after a restart) clears the suggestion.
const SLOW_MS=12000,FAST_MS=6000,RECENT=3;
const seconds=ms=>`${Math.round(ms/1000)} s`;
class SlowdownWatch {
 constructor({clock=Date.now}={}){this.clock=clock;this.recent=[];this.hint=null;}
 // Time ProPresenter took for one chapter preparation. Returns the current hint (or null).
 record(ms){
  if(!Number.isFinite(ms)||ms<0)return this.hint;
  // A quick chapter means ProPresenter is fine again (usually after a restart): forget the slow ones before it.
  if(ms<FAST_MS){this.recent=[];this.hint=null;return null;}
  this.recent=[...this.recent,ms].slice(-RECENT);
  const slow=this.recent.filter(value=>value>=SLOW_MS);
  if(slow.length>=2&&this.hint?.reason!=='slow')this.hint={id:this.clock(),reason:'slow',text:`ProPresenter is slowing down: recent passages took ${slow.slice(-2).map(seconds).join(' and ')} to open. Restart ProPresenter at a quiet moment, such as during worship. VerseCue does not restart it.`};
  return this.hint;
 }
 // ProPresenter answered too slowly for VerseCue to click or type safely, so preparation stopped.
 unresponsive(){
  if(this.hint?.reason!=='unresponsive')this.hint={id:this.clock(),reason:'unresponsive',text:'ProPresenter is responding too slowly, so VerseCue stopped before clicking or typing. Restart ProPresenter at a quiet moment, such as during worship. VerseCue does not restart it.'};
  return this.hint;
 }
}
const unresponsiveError=error=>/responding too slowly/i.test(String(error?.message??error));
module.exports={SlowdownWatch,unresponsiveError,SLOW_MS,FAST_MS};
