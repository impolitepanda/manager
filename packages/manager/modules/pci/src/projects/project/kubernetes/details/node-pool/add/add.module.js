import angular from 'angular';

import '@ovh-ux/ng-ovh-cloud-universe-components';
import '@ovh-ux/ng-ovh-swimming-poll';
import 'ovh-api-services';
import 'ovh-ui-angular';

import component from './add.component';
import routing from './add.routing';

const moduleName = 'ovhManagerPciProjectKubernetesNodePoolsAdd';

angular
  .module(moduleName, [
    'ngOvhCloudUniverseComponents',
    'ngOvhSwimmingPoll',
    'oui',
    'ovh-api-services',
  ])
  .config(routing)
  .run(/* @ngTranslationsInject:json ./translations */)
  .component('pciProjectKubernetesNodePoolsAddComponent', component);

export default moduleName;
