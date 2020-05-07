import template from './manage.html';

export default {
  bindings: {
    activationMode: '<',
    activationModeValues: '<',
    biosSettingsSgx: '<',
    prmrr: '<',
    prmrrValues: '<',

    goBack: '<',
    goToConfirm: '<',
  },
  template,
  require: {
    dedicatedServer: '^dedicatedServer',
  },
};
