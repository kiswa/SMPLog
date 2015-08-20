(function() {
    'use strict';

    angular
        .module('SMPLog')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$window', '$location', 'AdminService'];

    function LoginController($window, $location, AdminService) {
        var vm = this,
            body = angular.element(document.body);

        body.removeClass('home');
        body.addClass('admin');

        vm.formData = {
            username: '',
            password: '',
            alerts: [],
            submit: login
        };

        function login() {
            AdminService.logIn(vm.formData.username, vm.formData.password)
                .success(function(data) {
                    if ($window.localStorage.smplToken) {
                        $location.path('admin/dash');
                    }

                    if (data.alerts.length) {
                        vm.formData.alerts = data.alerts;
                    }
                });
        }
    }
})();
