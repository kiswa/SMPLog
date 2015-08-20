(function() {
    'use strict';

    angular
        .module('SMPLog')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$http'];

    function AuthService($http) {
        var service = {
            attemptedRoute: null,
            reset: reset,
            authenticate: authenticate
        };

        return service;

        function reset() {
            service.attemptedRoute = null;
        }

        function authenticate() {
            return $http.post('api/admin/authenticate');
        }
    }
})();
