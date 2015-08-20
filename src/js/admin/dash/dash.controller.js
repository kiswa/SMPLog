(function() {
    'use strict';

    angular
        .module('SMPLog')
        .controller('DashController', DashController);

    DashController.$inject = [
        '$scope',
        '$location',
        '$window',
        'AdminService',
        'ApiService'
    ];

    function DashController($scope, $location, $window,
            AdminService, ApiService) {
        var vm = this,
            body = angular.element(document.body);

        body.removeClass('home');
        body.addClass('admin');

        vm.activeTab = 'posts';
        vm.logOut = logOut;

        vm.passForm = {
            password: '',
            newPass: '',
            verifyPass: '',
            submit: changePassword,
            alerts: []
        };

        vm.authorForm = {
            name: '',
            image: '',
            submit: updateAuthor,
            alerts: []
        };

        vm.blogForm = {
            name: '',
            image: '',
            description: '',
            submit: updateBlogData,
            alerts: []
        };

        vm.newAuthorForm = {
            username: '',
            password: '',
            verifyPass: '',
            submit: addAuthor,
            alerts: []
        };

        vm.publishPost = publishPost;
        vm.unpublishPost = unpublishPost;
        vm.deletePost = deletePost;
        vm.editPost = editPost;

        vm.paging = {
            current: 1,
            total: 1,
            showNewer: false,
            showOlder: false,
            next: nextPage,
            prev: prevPage,
            visiblePosts: []
        };

        vm.removeAuthor = removeAuthor;
        vm.authors = [];
        loadAuthors();

        $scope.posts = [];
        $scope.$watchCollection('posts', updateVisiblePosts);

        ApiService.details()
            .success(function(data) {
                vm.blogForm.name = data.data[0].name;
                vm.blogForm.image = data.data[0].image;
                vm.blogForm.description = data.data[0].desc;
            });

        AdminService.getAuthor()
            .success(function(data) {
                setAuthorData(data);

                AdminService.getPostsByAuthor(vm.authorId)
                    .success(function(data) {
                        $scope.posts = data.data[0] || [];

                        for (var i = 0; i < $scope.posts.length; ++i) {
                            var text = $scope.posts[i].text,
                                shortText = text.split(/\s+/).slice(0, 20).join(' ') + ' ...';

                            $scope.posts[i].shortText = marked(shortText);
                        }

                        initPaging();
                    });
            });

        function loadAuthors() {
            ApiService.authors()
                .success(function(data) {
                    vm.authors = data.data[0];
                });
        }

        function initPaging() {
            vm.paging.total = Math.ceil($scope.posts.length / 5);

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
            var start = (vm.paging.current - 1) * 5,
                end = start + 5;

            if ($scope.posts) {
                vm.paging.visiblePosts = $scope.posts.slice(start, end);
            }
        }

        function setAuthorData(data) {
            vm.authorForm.name = data.data[0].name;
            vm.authorForm.image = data.data[0].image;
            vm.authorForm.alerts = data.data[0].alerts;

            vm.isAdmin = data.data[0].isAdmin;
            vm.authorId = data.data[0].id;
        }

        function logOut() {
            AdminService.logOut()
                .success(function() {
                    $location.path('/');
                });
        }

        function changePassword() {
            vm.passForm.alerts = [];

            if (!validateNewPass(vm.passForm, vm.passForm.newPass,
                    vm.passForm.verifyPass)) {
                return;
            }

            AdminService.changePassword(vm.passForm.password, vm.passForm.newPass)
                .success(function(data) {
                    if (data.status === 'success') {
                        $scope.$broadcast('notifySuccess', 'Password Changed');

                        vm.passForm.password = '';
                        vm.passForm.newPass = '';
                        vm.passForm.verifyPass = '';
                    }

                    vm.passForm.alerts = data.data[0].alerts;
                });
        }

        function updateAuthor() {
            AdminService.updateAuthor(vm.authorForm.name, vm.authorForm.image)
                .success(function(data) {
                    $scope.$broadcast('notifySuccess', 'Author Details Updated');
                    setAuthorData(data);

                    vm.authorForm.alerts = data.data[0].alerts;
                    loadAuthors();
                });
        }

        function updateBlogData() {
            AdminService.updateBlogData(vm.blogForm.name, vm.blogForm.image, vm.blogForm.description)
                .success(function(data) {
                    $scope.$broadcast('notifySuccess', 'Blog Details Updated');

                    vm.blogForm.name = data.data[0].name;
                    vm.blogForm.image = data.data[0].image;
                    vm.blogForm.description = data.data[0].desc;
                    vm.blogForm.alerts = data.data[0].alerts;

                    $scope.vm.blogName = vm.blogForm.name; // Update header directive
                });
        }

        function publishPost(postId) {
            AdminService.setPostPublished(postId)
                .success(function(data) {
                    updatePost(data.data[0]);
                });
        }

        function unpublishPost(postId) {
            AdminService.setPostUnpublished(postId)
                .success(function(data) {
                    updatePost(data.data[0]);
                });
        }

        function updatePost(post) {
            console.log(post);
            for (var i = 0, len = $scope.posts.length; i < len; ++i) {
                if ($scope.posts[i].id === post.id) {
                    $scope.posts[i].isPublished = post.isPublished;
                    $scope.posts[i].publishDate = post.publishDate;
                }
            }
        }

        function deletePost(postId) {
            if ($window.confirm('This cannot be undone. Are you sure?')) {
                AdminService.deletePost(postId)
                    .success(function(data) {
                        $scope.posts.filter(function(post) {
                            return post.id !== postId;
                        });
                    });
            }
        }

        function editPost(slug) {
            $location.path('/admin/new/' + slug);
        }

        function validateNewPass(form, newPass, verifyPass) {
            var retVal = true;

            if (newPass !== verifyPass) {
                form.alerts.push({
                    type: 'error',
                    text: 'New password does not match verify password.'
                });
                retVal = false;
            }

            if (newPass === '') {
                form.alerts.push({
                    type: 'error',
                    text: 'Blank password is not allowed.'
                });
                retVal = false;
            }

            return retVal;
        }

        function addAuthor() {
            vm.newAuthorForm.alerts = [];

            if (vm.newAuthorForm.username === '') {
                vm.newAuthorForm.alerts.push({
                    type: 'error',
                    text: 'Blank username is not allowed.'
                });

                return;
            }

            if (!validateNewPass(vm.newAuthorForm, vm.newAuthorForm.password,
                    vm.newAuthorForm.verifyPass)) {
                return;
            }

            for(var i = 0; i < vm.authors.length; ++i) {
                if (vm.authors[i].username == vm.newAuthorForm.username) {
                    vm.newAuthorForm.alerts.push({
                        type: 'error',
                        text: 'That username is already in use.'
                    });

                    return;
                }
            }

            AdminService.createAuthor(vm.newAuthorForm.username,
                    vm.newAuthorForm.password)
                .success(function(data) {
                    if (data.status === 'success') {
                        vm.newAuthorForm.username = '';
                        vm.newAuthorForm.password = '';
                        vm.newAuthorForm.verifyPass = '';

                        $scope.$broadcast('notifySuccess', 'New Author Created');
                        loadAuthors();
                    }

                    vm.newAuthorForm.alerts = data.data[0].alerts;
                });
        }

        function removeAuthor(id) {
            if ($window.confirm('This will unpublish all posts by this user. Are you sure?')) {
                AdminService.removeAuthor(id)
                    .success(function(data) {
                        loadAuthors();
                    });
            }
        }
    }
})();
