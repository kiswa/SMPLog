(function() {
    'use strict';

    angular
        .module('SMPLog')
        .run(Run);

    Run.$inject = ['$rootScope', '$location', '$window', 'AuthService'];

    function Run($rootScope, $location, $window, AuthService) {
        var badRoute = 'BAD ROUTE';

        $rootScope.$on('$routeChangeStart', routeChangeStart);
        $rootScope.$on('$routeChangeSuccess', routeChangeSuccess);
        $rootScope.$on('$routeChangeError', routeChangeError);

        function routeChangeStart(event, nextRoute, currentRoute) {
            if (nextRoute !== null && nextRoute.authRequired !== null &&
                    nextRoute.authRequired &&
                    $window.localStorage.smplToken === undefined) {
                $location.path('/admin');
            }

            if ($window.localStorage.smplToken !== undefined) {
                AuthService.authenticate()
                    .success(function(data) {
                        if (data.status !== 'success') {
                            delete $window.localStorage.smplToken;
                            $location.path('/admin');
                        }
                    });
            }
        }

        function routeChangeSuccess(event, currentRoute, previousRoute) {
            if (currentRoute.controller === 'LoginCtrl' && previousRoute &&
                    previousRoute.originalPath !== '') {
                AuthService.attemptedRoute = previousRoute;
            }
        }

        function routeChangeError(event, currentRoute, previousRoute, rejection) {
            if (rejection === badRoute) {
                $location.path('/');
            }
        }
    }
})();
