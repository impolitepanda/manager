import controller from './autorenew.controller';
import template from './autorenew.html';

export default {
  bindings: {
    activationLink: '<',
    agreementsLink: '<',
    billingServices: '<',
    canDisableAllDomains: '<',
    cancelServiceResiliation: '<',
    currentActiveLink: '<',
    currentUser: '<',
    defaultPaymentMean: '<',
    disableAutorenewForDomains: '<',
    disableBulkAutorenew: '<',
    enableBulkAutorenew: '<',
    filters: '<',
    getRenewUrl: '<',
    getServices: '<',
    getSMSAutomaticRenewalURL: '<',
    getSMSCreditBuyingURL: '<',
    goToAutorenew: '<',
    hasAutoRenew: '<',
    homeLink: '<',
    isEnterpriseCustomer: '<',
    nicBilling: '<',
    nicRenew: '<',
    nics: '<',
    offset: '<',
    onListParamChanges: '<',
    pageNumber: '<',
    pageSize: '<',
    payDebtLink: '<',
    resiliateService: '<',
    resiliateExchangeService: '<',
    searchText: '<',
    selectedType: '<',
    services: '<',
    serviceTypes: '<',
    sort: '<',
    sshLink: '<',
    terminateEmail: '<',
    terminateEnterpriseCloudDatabase: '<',
    terminateHostingWeb: '<',
    terminatePrivateDatabase: '<',
    terminateWebCoach: '<',
    updateExchangeBilling: '<',
    updateServices: '<',
    warnNicBilling: '<',
  },
  controller,
  template,
};
