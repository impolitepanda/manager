import controller from './controller';
import template from './template.html';

const component = {
  bindings: {
    addNode: '<',
    cluster: '<',
    bulkDelete: '<',
    deleteNode: '<',
    kubeId: '<',
    nodes: '<',
    nodePoolName: '<',
    projectId: '<',
    project: '<',
    refreshNodes: '<',
    switchBillingType: '<',
  },
  controller,
  template,
};

export default component;
