(function() {
    'use strict';

    angular
        .module('SMPLog')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'ApiService'];

    function HomeController($scope, ApiService) {
        var vm = this,
        postsPerPage = 5;

        angular.element(document.body).removeClass('admin');
        angular.element(document.body).addClass('home');

        $scope.posts = [];

        vm.paging = {
            current: 1,
            total: 1,
            showNewer: false,
            showOlder: false,
            next: nextPage,
            prev: prevPage,
            visiblePosts: []
        };

        $scope.$watchCollection('posts', updateVisiblePosts);

        vm.authors = [];

        ApiService.posts()
            .success(function(data) {
                $scope.posts = data.data[0];

                for (var i = 0; i < $scope.posts.length; ++i) {
                    var text = $scope.posts[i].text,
                        shortText = text.split(/\n+/).slice(0, 1).join(' ') +
                            ' <a href="posts/' + $scope.posts[i].slug  + '"><i class="fa fa-angle-double-right"></i></a>';

                    $scope.posts[i].short_text = marked(shortText);
                }

                loadAuthorData();
                initPaging();
            });

        function loadAuthorData() {
            for (var i = 0; i < $scope.posts.length; ++i) {
                if (!vm.authors[$scope.posts[i].author]) {
                    ApiService.author($scope.posts[i].author)
                        .success(setAuthorData);
                }
            }

            function setAuthorData(data) {
                vm.authors[data.data[0].id] = data.data[0];
            }
        }

        function initPaging() {
            vm.paging.total = Math.ceil($scope.posts.length / postsPerPage);

            if (vm.paging.total > 1) {
                vm.paging.showOlder = true;
            }
        }

        function nextPage() {
            if (vm.paging.current < vm.paging.total) {
                vm.paging.current += 1;

                updateVisiblePosts();
                setPrevNextLinks();
            }
        }

        function prevPage() {
            if (vm.paging.current > 1) {
                vm.paging.current -= 1;

                updateVisiblePosts();
                setPrevNextLinks();
            }
        }

        function setPrevNextLinks() {
            vm.paging.showOlder = (vm.paging.current < vm.paging.total);
            vm.paging.showNewer = (vm.paging.current > 1);
        }

        function updateVisiblePosts() {
            var start = (vm.paging.current - 1) * postsPerPage,
                end = start + postsPerPage;

            if ($scope.posts) {
                vm.paging.visiblePosts = $scope.posts.slice(start, end);
            }
        }
    }
})();
