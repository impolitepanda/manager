import angular from 'angular';

import add from './add';
import deleteNodePool from './delete';
import nodePoolComponent from './node-pool.component';
import nodes from './nodes';
import routing from './node-pool.routing';

const moduleName = 'ovhManagerPciProjectKubernetesNodePools';

angular
  .module(moduleName, [add, deleteNodePool, nodes])
  .config(routing)
  .run(/* @ngTranslationsInject:json ./translations */)
  .component(
    'ovhManagerPciProjectKubernetesNodePoolsComponent',
    nodePoolComponent,
  );

export default moduleName;
