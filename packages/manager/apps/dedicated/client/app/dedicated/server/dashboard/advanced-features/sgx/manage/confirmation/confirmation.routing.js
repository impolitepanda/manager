export default /* @ngInject */ ($stateProvider) => {
  $stateProvider.state(
    'app.dedicated.server.dashboard.sgx.manage.confirmation',
    {
      params: {
        activationMode: null,
        prmrr: null,
      },
      views: {
        modal: {
          component: 'dedicatedServerDashboardSgxManageConfirmation',
        },
      },
      layout: 'modal',
      resolve: {
        activationMode: /* @ngInject */ ($transition$) =>
          $transition$.params().activationMode,
        prmrr: /* @ngInject */ ($transition$) => $transition$.params().prmrr,
        confirm: /* @ngInject */ (
          $http,
          $translate,
          goToDashboard,
          serverName,
        ) => (activationMode, prmrr) =>
          $http
            .post(
              `/dedicated/server/${serverName}/biosSettings/sgx/configure`,
              {
                prmrr,
                status: activationMode,
              },
            )
            .then(() =>
              goToDashboard(
                {
                  message: {
                    text: $translate.instant(
                      'dedicated_server_dashboard_advanced_features_sgx_manage_success',
                    ),
                    type: 'DONE',
                  },
                },
                { reload: true },
              ).catch((error) =>
                goToDashboard({
                  message: {
                    text: $translate.instant(
                      'dedicated_server_dashboard_advanced_features_sgx_manage_success',
                    ),
                    data: error.data,
                    type: 'ERROR',
                  },
                }),
              ),
            ),
        goBack: /* @ngInject */ ($state) => (params = {}, transitionParams) =>
          $state.go(
            'app.dedicated.server.dashboard.sgx.manage',
            params,
            transitionParams,
          ),
      },
    },
  );
};
