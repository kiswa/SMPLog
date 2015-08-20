(function() {
    'use strict';

    angular
        .module('SMPLog')
        .directive('smplHeader', SmplHeader);

    function SmplHeader() {
        var directive = {
            restrict: 'A',
            replace: true,
            templateUrl: 'js/layout/smplHeader.html',
            controller: HeaderController,
            controllerAs: 'vm'
        };

        return directive;
    }

    HeaderController.$inject = ['$rootScope', '$location', 'ApiService'];

    function HeaderController($rootScope, $location, ApiService) {
        var vm = this;

        vm.blogName = 'SMPLog';
        vm.headerStyle = '';
        // The is used by the footer. I'm being lazy by doing it here.
        vm.year = new Date().getFullYear();

        function updateHeaderImage() {
            ApiService.details()
                .success(function(data) {
                    vm.blogName = data.data[0].name;
                    if (angular.element(document.body).hasClass('home')) {
                        vm.headerStyle = {
                            background: 'linear-gradient(rgba(0, 0, 0, .5), rgba(0, 0, 0, .5)),' +
                                        'url("' + data.data[0].image + '")'
                        };
                    } else {
                        vm.headerStyle = { };
                    }
                });
        }

        $rootScope.$on('$routeChangeSuccess', onRouteChange);

        function onRouteChange() {
            vm.showTitle = true;
            vm.showHomeLink = false;

            if ($location.path().indexOf('/posts/') >= 0) {
                vm.showHomeLink = true;
                vm.showTitle = false;
            }

            if ($location.path().indexOf('/authors/') >= 0) {
                vm.showHomeLink = true;
            }

            updateHeaderImage();
        }
    }
})();
