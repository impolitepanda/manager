import controller from './node-pool.controller';
import template from './node-pool.html';

const component = {
  bindings: {
    addNodePool: '<',
    cluster: '<',
    deleteNodePool: '<',
    editNodePool: '<',
    getNodesState: '<',
    kubeId: '<',
    nodePools: '<',
    projectId: '<',
    project: '<',
    refreshNodePools: '<',
  },
  controller,
  template,
};

export default component;
