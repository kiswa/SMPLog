(function() {
    'use strict';

    angular
        .module('SMPLog')
        .directive('smplFooter', SmplFooter);

    function SmplFooter() {
        var directive = {
            restrict: 'A',
            replace: true,
            templateUrl: 'js/layout/smplFooter.html'
        };

        return directive;
    }
})();
