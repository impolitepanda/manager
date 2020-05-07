import controller from './advanced-features.controller';
import template from './advanced-features.html';

export default {
  bindings: {
    /**
     * {Object}     sgx
     * {boolean}    sgx.isRunning - is the status running or completed ?
     * {SgxStatus}  sgx.status    - the status of the SGX option
     */
    sgx: '<',
    goToSgxIntroduction: '<',
    goToSgxManage: '<',
    user: '<',
  },
  controller,
  template,
};
