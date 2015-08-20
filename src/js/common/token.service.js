(function() {
    'use strict';

    angular
        .module('SMPLog')
        .factory('TokenInterceptor', TokenInterceptor);

    TokenInterceptor.$inject = ['$q', '$window', '$location'];

    function TokenInterceptor($q, $window, $location) {
        var service = {
            request: requestFn,
            requestError: requestErrorFn,
            response: responseFn,
            responseError: responseErrorFn
        };

        return service;

        function requestFn(config) {
            config.headers = config.headers || {};

            if ($window.localStorage.smplToken) {
                config.headers.Authorization = $window.localStorage.smplToken;
            }

            return config;
        }

        function requestErrorFn(rejection) {
            return $q.reject(rejection);
        }

        function responseFn(response) {
            if (response !== null && response.status === 200) {
                if (response.data.status && response.data.alerts.length) {
                    var message = response.data.alerts[0].text;

                    if (message === 'Sign In Successful') {
                        $window.localStorage.smplToken = response.data.data[0];
                    } else if (message === 'Sign Out Complete') {
                        delete $window.localStorage.smplToken;
                    } else if (message === 'Invalid Token') {
                        delete $window.localStorage.smplToken;

                        $location.path('/admin');
                    }
                }
            }

            return response || $q.when(response);
        }

        function responseErrorFn(rejection) {
            if (rejection !== null && rejection.status === 401) {
                if ($window.localStorage.smplToken) {
                    delete $window.localStorage.smplToken;
                }

                $location.path('/admin');
            }

            return $q.reject(rejection);
        }
    }
})();
