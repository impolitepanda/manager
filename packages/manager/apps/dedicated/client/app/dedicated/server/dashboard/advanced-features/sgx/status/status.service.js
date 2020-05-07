import includes from 'lodash/includes';
import values from 'lodash/values';

import { STATUS } from '../sgx.constants';

export default class {
  static isSgxStatusValid(value) {
    const isValidValue = includes(values(STATUS), value);

    if (!isValidValue && !STATUS[value]) {
      return false;
    }

    return true;
  }

  static buildStatusClassName({ isRunning, status }) {
    if (isRunning) {
      return 'oui-status_warning';
    }

    if (status === STATUS.DISABLED) {
      return 'oui-status_error';
    }

    return 'oui-status_success';
  }

  static buildStatusTextId({ isRunning, status }) {
    switch (status) {
      case STATUS.DISABLED:
        return isRunning
          ? 'dedicated_server_dashboard_advanced_features_sgx_status_disabled_isRunning'
          : 'dedicated_server_dashboard_advanced_features_sgx_status_disabled';

      case STATUS.ENABLED:
      case STATUS.SOFTWARE_CONTROLLED:
        return isRunning
          ? 'dedicated_server_dashboard_advanced_features_sgx_status_enabled_isRunning'
          : 'dedicated_server_dashboard_advanced_features_sgx_status_enabled';

      default:
        throw new Error(
          `The input value ${status} should be of type SgxStatus`,
        );
    }
  }
}
