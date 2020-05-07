import isBoolean from 'lodash/isBoolean';
import isNil from 'lodash/isNil';

import SgxStatus from './status.service';

export default class {
  /* @ngInject */
  constructor($translate) {
    this.$translate = $translate;
  }

  $onChanges({ isRunning, status }) {
    const valuesToUse = {
      isRunning: isNil(isRunning) ? this.isRunning : isRunning.currentValue,
      status: isNil(status) ? this.status : status.currentValue,
    };

    if (!isBoolean(valuesToUse.isRunning)) {
      throw new TypeError(
        `SgxStatus requires the input value to be of type boolean. Current value: ${valuesToUse.isRunning}`,
      );
    }

    if (!SgxStatus.isSgxStatusValid(valuesToUse.status)) {
      throw new TypeError(
        `SgxStatus requires the input status to be of type SgxStatus. Current value: ${valuesToUse.status}`,
      );
    }

    this.className = SgxStatus.buildStatusClassName({
      isRunning: valuesToUse.isRunning,
      status: valuesToUse.status,
    });

    this.text = this.$translate.instant(
      SgxStatus.buildStatusTextId({
        isRunning: valuesToUse.isRunning,
        status: valuesToUse.status,
      }),
    );
  }
}
