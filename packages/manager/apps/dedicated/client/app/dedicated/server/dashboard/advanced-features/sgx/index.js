import angular from 'angular';

import '@uirouter/angularjs';
import 'angular-translate';
import 'ovh-ui-angular';

import introduction from './introduction';
import manage from './manage';
import status from './status';

import routing from './sgx.routing';

const moduleName = 'ovhManagerDedicatedServerDashboardSgx';

angular
  .module(moduleName, [
    introduction,
    manage,
    'oui',
    'pascalprecht.translate',
    status,
    'ui.router',
  ])
  .config(routing)
  .run(/* @ngTranslationsInject:json ./translations */);

export default moduleName;
