import get from 'lodash/get';

import { DELETE_CONFIRMATION_INPUT } from './constants';

export default class KubernetesNodesDeleteCtrl {
  /* @ngInject */
  constructor($http, $translate) {
    this.$http = $http;
    this.$translate = $translate;
    this.DELETE_CONFIRMATION_INPUT = DELETE_CONFIRMATION_INPUT;
  }

  $onInit() {
    this.isDeleting = false;
  }

  deleteNode() {
    this.isDeleting = true;
    return this.$http.put(`/cloud/project/${this.projectId}/kube/${this.kubeId}/nodepool/${this.nodePoolId}`,
      { desiredNodes: this.nodeCount - this.nodeDeleteCount })
      .then(() =>
        this.goBack(this.$translate.instant('kube_nodes_delete_success')),
      )
      .catch((error) =>
        this.goBack(
          this.$translate.instant('kube_nodes_delete_error', {
            message: get(error, 'data.message'),
          }),
          'error',
        ),
      );
  }
}
