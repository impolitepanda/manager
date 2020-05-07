import DedicatedServerDashboardSgxManage from './manage.service';

export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state('app.dedicated.server.dashboard.sgx.manage', {
    params: {
      goBack: null,
    },
    url: '/manage',
    views: {
      'tabView@app.dedicated.server': {
        component: 'dedicatedServerDashboardSgxManage',
      },
    },
    resolve: {
      activationMode: /* @ngInject */ (biosSettingsSgx) =>
        biosSettingsSgx.status,
      activationModeValues: /* @ngInject */ (schema) =>
        DedicatedServerDashboardSgxManage.buildActivationMode(schema),
      biosSettingsSgx: /* @ngInject */ ($http, serverName) =>
        $http
          .get(`/dedicated/server/${serverName}/biosSettings/sgx`)
          .then((sgx) => sgx.data),
      prmrr: /* @ngInject */ (biosSettingsSgx) => biosSettingsSgx.prmrr,
      prmrrValues: /* @ngInject */ (schema) =>
        DedicatedServerDashboardSgxManage.buildPrmrr(schema),

      goBack: /* @ngInject */ ($state, $transition$) => (
        params = {},
        transitionParams,
      ) =>
        ($transition$.params().goBack &&
          $transition$.params().goBack(params, transitionParams)) ||
        $state.go('app.dedicated.server.dashboard', params, transitionParams),
      goToConfirm: /* @ngInject */ ($state) => (activationMode, prmrr) =>
        $state.go('app.dedicated.server.dashboard.sgx.manage.confirmation', {
          activationMode,
          prmrr,
        }),
    },
  });
};
