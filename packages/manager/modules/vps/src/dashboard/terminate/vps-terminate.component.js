import controller from './vps-terminate.controller';
import template from './vps-terminate.html';

export default {
  bindings: {
    cancel: '<',
    degressivityInformation: '<',
    hasManualRefund: '<',
    isActionAvailable: '<',
    serviceName: '<',
    supportTicketLink: '<',
    terminateOptions: '<',
    validateTermination: '<',
  },
  controller,
  name: 'ovhManagerVpsTerminate',
  template,
};
