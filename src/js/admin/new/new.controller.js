(function() {
    'use strict';

    angular
        .module('SMPLog')
        .controller('NewPostController', NewPostController);

    NewPostController.$inject = [
        '$scope',
        '$location',
        '$routeParams',
        'AdminService',
        'ApiService'
    ];

    function NewPostController($scope, $location, $routeParams, AdminService, ApiService) {
        var vm = this,
            body = angular.element(document.body);

        body.removeClass('home');
        body.addClass('admin');

        vm.isEdit = ($routeParams.slug !== undefined);

        vm.logOut = logOut;

        vm.postForm = {
            title: '',
            text: '',
            id: 0,
            isPublished: false,
            save: savePost,
            publish: publishPost,
            unpublish: unpublishPost
        };

        vm.convertedMarkdown = '';
        vm.updateMarkdown = updateMarkdown;

        if (vm.isEdit) {
            ApiService.post($routeParams.slug)
                .success(function(data) {
                    var post = data.data[0];

                    vm.postForm.id = Number(post.id);
                    vm.postForm.title = post.title;
                    vm.postForm.text = post.text;
                    vm.postForm.isPublished = post.isPublished;

                    updateMarkdown();
                });
        }

        function updateMarkdown() {
            var header = '<header><h1>' + vm.postForm.title + '</h1></header>';
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
            vm.convertedMarkdown = header + marked(vm.postForm.text);
        }

        function savePost() {
            if (vm.postForm.title === '' || vm.postForm.text === '') {
                $scope.$broadcast('notifyError', 'All fields are required!');
                return;
            }

            AdminService.savePost(vm.postForm.title, vm.postForm.text, vm.postForm.id)
                .success(function(data) {
                    if (data.status === 'success') {
                        vm.postForm.id = data.data[0].id;
                        vm.isEdit = true;

                        $scope.$broadcast('notifySuccess',
                                'Post "' + vm.postForm.title + '" saved.');
                    } else {
                        $scope.$broadcast('notifyError',
                                'Something went wrong, please try again.');
                    }
                });
        }

        function publishPost() {
            if (vm.postForm.title === '' || vm.postForm.text === '') {
                $scope.$broadcast('notifyError', 'All fields are required!');
                return;
            }

            AdminService.publishPost(vm.postForm.title, vm.postForm.text, vm.postForm.id)
                .success(function (data) {
                    if (data.status === 'success') {
                        $scope.$broadcast('notifySuccess',
                                'Post "' + vm.postForm.title + '" published.');

                        if (vm.isEdit) {
                            vm.postForm.isPublished = true;
                        } else {
                            vm.postForm.title = '';
                            vm.postForm.text = '';
                            vm.postForm.id = 0;
                            vm.convertedMarkdown = '';
                        }
                    } else {
                        $scope.$broadcast('notifyError',
                                'Something went wrong, please try again.');
                    }
                });
        }

        function unpublishPost() {
            if (!vm.isEdit) return;

            AdminService.setPostUnpublished(vm.postForm.id)
                .success(function (data) {
                    if (data.status === 'success') {
                        $scope.$broadcast('notifySuccess',
                                'Post "' + vm.postForm.title + '" unpublished.');

                        vm.postForm.isPublished = false;
                    } else {
                        $scope.$broadcast('notifyError',
                                'Something went wrong, please try again.');
                    }
                });
        }

        function logOut() {
            AdminService.logOut()
                .success(function() {
                    $location.path('/');
                });
        }
    }
})();
