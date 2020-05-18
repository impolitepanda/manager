import get from 'lodash/get';
import { DEFAULT_NODE_COUNT } from '../../../add/add.constants';

export default class {
  /* @ngInject */
  constructor($http, $translate, CucCloudMessage, OvhApiCloudProjectKube) {
    this.$http = $http;
    this.$translate = $translate;
    this.CucCloudMessage = CucCloudMessage;
    this.OvhApiCloudProjectKube = OvhApiCloudProjectKube;
  }

  $onInit() {
    this.isAdding = false;
    this.nodePool = {
      name: null,
      flavor: null,
      nodeCount: DEFAULT_NODE_COUNT,
      monthlyBilling: false,
    };
    this.loadMessages();
  }

  loadMessages() {
    this.CucCloudMessage.unSubscribe(
      'pci.projects.project.kubernetes.details.nodepools.add',
    );
    this.messageHandler = this.CucCloudMessage.subscribe(
      'pci.projects.project.kubernetes.details.nodepools.add',
      { onMessage: () => this.refreshMessages() },
    );
  }

  refreshMessages() {
    this.messages = this.messageHandler.getMessages();
  }

  create() {
    this.isAdding = true;
    return this.$http
      .post(`/cloud/project/${this.projectId}/kube/${this.kubeId}/nodepool`, {
        desiredNodes: this.nodePool.nodeCount,
        flavorName: this.nodePool.flavor.name,
        name: this.nodePool.name,
      })
      .then(() =>
        this.goBack(
          this.$translate.instant('kube_add_node_pool_success', {
            nodePoolName: this.nodePool.name,
          }),
          'success',
        ),
      )
      .catch((error) => {
        this.CucCloudMessage.error(
          this.$translate.instant('kube_add_node_pool_error', {
            nodePoolName: this.nodePool.name,
            message: get(error, 'data.message', error.message),
          }),
        );
      })
      .finally(() => {
        this.isAdding = false;
      });
  }
}
