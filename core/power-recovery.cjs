'use strict';
class PowerRecovery {
  constructor({service,connector,cancelAudio,cancelPreparation,revokeApi,getTarget}){Object.assign(this,{service,connector,cancelAudio,cancelPreparation,revokeApi,getTarget});}
  handle(phase){
    if(!['suspend','resume'].includes(phase))throw new Error('Unknown power transition');
    const {service,connector}=this;service.recovery={required:true,phase};
    this.cancelAudio();this.cancelPreparation();connector.arm(false);
    const target=this.getTarget();connector.configure(target.host,target.port);
    service.configure({dryRun:true,translation:service.translation});service.setMode('paused');
    service.log(phase==='suspend'?'SYSTEM_SUSPEND_PAUSED':'SYSTEM_RESUME_PREFLIGHT_REQUIRED','warning');service.notify();
    try{Promise.resolve(this.revokeApi()).catch(()=>{service.log('POWER_RECOVERY_API_REVOKE_FAILED','warning');service.notify();});}catch{service.log('POWER_RECOVERY_API_REVOKE_FAILED','warning');service.notify();}
  }
}
module.exports={PowerRecovery};
