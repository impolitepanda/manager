import map from 'lodash/map';

import NodePool from './node-pool.class';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('pci.projects.project.kubernetes.details.nodepools', {
    url: '/nodepools',
    views: {
      kubernetesView: 'ovhManagerPciProjectKubernetesNodePoolsComponent',
    },
    translations: {
      value: ['.', './nodes'],
      format: 'json',
    },
    resolve: {
      addNodePool: /* @ngInject */ ($state, kubeId, projectId) => () =>
        $state.go('pci.projects.project.kubernetes.details.nodepools.add', {
          kubeId,
          projectId,
        }),

      editNodePool: /* @ngInject */ ($state, kubeId, projectId) => (nodePoolId, nodePool) =>
        $state.go('pci.projects.project.kubernetes.details.nodepools.nodes', {
          kubeId,
          projectId,
          nodePoolId,
          nodePool,
        }),

      deleteNodePool: /* @ngInject */ ($state, kubeId, projectId) => (
        nodePoolId,
        nodePoolName,
      ) =>
        $state.go('pci.projects.project.kubernetes.details.nodepools.delete', {
          kubeId,
          projectId,
          nodePoolId,
          nodePoolName,
        }),

      getNodesState: /* @ngInject */ (kubeId, projectId) => (nodePoolId) =>
          `pci.projects.project.kubernetes.details.nodepools.details({ projectId: '${projectId}', kubeId: '${kubeId}', nodePoolId: '${nodePoolId}'})`,

      nodePools: /* @ngInject */ ($http, kubeId, projectId) =>
        $http
          .get(`/cloud/project/${projectId}/kube/${kubeId}/nodepool`)
          .then((pools) => map(pools.data, (pool) => new NodePool(pool))),

      refreshNodePools: /* @ngInject */ ($state) => () => $state.reload(),

      goToNodePools: ($state, CucCloudMessage, kubeId, projectId) => (
        message = false,
        type = 'success',
      ) => {
        const reload = message && type === 'success';

        const promise = $state.go(
          'pci.projects.project.kubernetes.details.nodepools',
          {
            kubeId,
            projectId,
          },
          {
            reload,
          },
        );

        if (message) {
          promise.then(() =>
            CucCloudMessage[type](
              message,
              'pci.projects.project.kubernetes.details.nodepools',
            ),
          );
        }

        return promise;
      },

      breadcrumb: /* @ngInject */ ($translate) =>
        $translate.instant('kube_node_pools'),
    },
  });

  $stateProvider.state('pci.projects.project.kubernetes.details.nodepools.details', {
    url: '/:nodePoolId',
    redirectTo: 'pci.projects.project.kubernetes.details.nodepools.details.nodes',
    template: `<div data-ui-view></div>`,
    resolve: {
      nodePool: /* @ngInject */ ($http, kubeId, projectId, nodePoolId) =>
        $http
          .get(`/cloud/project/${projectId}/kube/${kubeId}/nodepool/${nodePoolId}`)
          .then((nodePool) => new NodePool(nodePool.data)),
      nodePoolId: /* @ngInject */ ($transition$) =>  $transition$.params().nodePoolId,
      nodePoolName: /* @ngInject */ (nodePool) =>  nodePool.name,
      breadcrumb: /* @ngInject */ (nodePool) => nodePool.name,
    }
  });
};
