(function() {
    angular
        .module('SMPLog')
        .directive('smplNotify', SmplNotify);

    function SmplNotify() {
        var directive = {
            restrict: 'A',
            replace: true,
            templateUrl: 'js/notify/notify.html',
            controller: NotifyController,
            controllerAs: 'vm',
            scope: {
                timeout: '='
            },
            link: linkFn
        };

        return directive;

        function linkFn(scope, element, attrs, vm) {
            vm.timeout = scope.timeout || 2000;
        }
    }

    NotifyController.$inject = ['$scope', '$timeout'];

    function NotifyController($scope, $timeout) {
        var vm = this;

        vm.visible = false;
        vm.type = '';
        vm.text = '';
        vm.timeout = 2000;

        vm.hide = hide;

        $scope.$on('notifySuccess', showSuccess);
        $scope.$on('notifyError', showError);

        function hide() {
            vm.visible = false;
        }

        function show(type, text) {
            vm.type = type;
            vm.text = text;
            vm.visible = true;

            $timeout(vm.hide, vm.timeout);
        }

        function showSuccess(event, msg) {
            show('success', msg);
        }

        function showError(event, msg) {
            show('error', msg);
        }
    }
})();
