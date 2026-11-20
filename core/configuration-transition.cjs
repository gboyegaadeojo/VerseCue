'use strict';
// Enter safety synchronously, then serialize asynchronous configuration work.
class ConfigurationTransition {
 constructor({enterSafe}){if(typeof enterSafe!=='function')throw Error('Configuration safety callback required');this.enterSafe=enterSafe;this.busy=false;}
 async run(operation){if(this.busy)throw Error('Settings are changing; wait for setup to finish');if(typeof operation!=='function')throw Error('Configuration operation required');this.busy=true;try{await this.enterSafe();return await operation();}finally{this.busy=false;}}
}
module.exports={ConfigurationTransition};
