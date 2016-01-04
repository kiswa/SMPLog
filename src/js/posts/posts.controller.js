(function() {
    'use strict';

    angular
        .module('SMPLog')
        .controller('PostsController', PostsController);

    PostsController.$inject = ['$window', '$routeParams', '$location', '$rootScope', 'ApiService'];

    function PostsController($window, $routeParams, $location, $rootScope, ApiService) {
        var vm = this;

        angular.element(document.body).removeClass('home');
        angular.element(document.body).removeClass('admin');

        vm.post = {};
        vm.author = {};
        vm.convertedMarkdown = '';
        vm.updateMarkdown = updateMarkdown;
        vm.encodedUrl = '';

        ApiService.post($routeParams.slug)
            .success(function(data) {
                vm.post = data.data[0];

                loadAuthorData();
                updateMarkdown();

                vm.encodedUrl = getUrl();

                loadOpenGraphTags();
            });

        function loadAuthorData() {
            ApiService.author(vm.post.author)
                .success(function(data) {
                    vm.author = data.data[0];
                });
        }

        function updateMarkdown() {
            var myRenderer = new marked.Renderer();

            myRenderer.code = function(code, lang, escaped) {
                if (lang && hljs.listLanguages().indexOf(lang) >= 0) {
                    try {
                        code = hljs.highlight(lang, code).value;
                    } catch (e) { }
                }

                var retVal = '<pre class="hljs' +
                    (lang ? ' ' + this.options.langPrefix + lang + '"' : '"') +
                    '><code>' + code + '\n</code></pre>\n';

                return retVal;
            };

            marked.setOptions({
                renderer: myRenderer
            });
            vm.convertedMarkdown = marked(vm.post.text);
        }

        function getUrl() {
            return $window.encodeURI($location.absUrl());
        }

        function loadOpenGraphTags() {
            $rootScope.vm.openGraphTags = '';
        }
    }
})();
