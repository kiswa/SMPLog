(function() {
    'use strict';

    angular
        .module('SMPLog')
        .factory('AdminService', AdminService);

    AdminService.$inject = ['$http'];

    function AdminService($http) {
        var service = {
                getAuthor: getAuthor,
                getPostsByAuthor: getPostsByAuthor,
                logIn: logIn,
                logOut: logOut,
                changePassword: changePassword,
                updateAuthor: updateAuthor,
                updateBlogData: updateBlogData,
                savePost: savePost,
                publishPost: publishPost,
                setPostPublished: setPostPublished,
                setPostUnpublished: setPostUnpublished,
                deletePost: deletePost,
                createAuthor: createAuthor,
                removeAuthor: removeAuthor
            },
            api = 'api/admin/';

        return service;

        function getAuthor() {
            return $http.get(api + 'author');
        }

        function getPostsByAuthor(authorId) {
            return $http.get(api + 'posts/' + authorId);
        }

        function logIn(username, password) {
            return $http.post(api + 'login', {
                username: username,
                password: password
            });
        }

        function logOut() {
            return $http.post(api + 'logout');
        }

        function changePassword(password, newPass) {
            return $http.post(api + 'changePassword', {
                password: password,
                newPass: newPass
            });
        }

        function updateAuthor(name, image) {
            return $http.post(api + 'updateAuthor', {
                name: name,
                image: image
            });
        }

        function updateBlogData(name, image, desc) {
            return $http.post(api + 'updateBlogData', {
                name: name,
                image: image,
                desc: desc
            });
        }

        function savePost(title, text, id) {
            return $http.post(api + 'savePost', {
                title: title,
                text: text,
                id: id
            });
        }

        function publishPost(title, text, id) {
            return $http.post(api + 'publishPost', {
                title: title,
                text: text,
                id: id
            });
        }

        function setPostPublished(postId) {
            return $http.post(api + 'setPublished', {
                postId: postId
            });
        }

        function setPostUnpublished(postId) {
            return $http.post(api + 'setUnpublished', {
                postId: postId
            });
        }

        function deletePost(postId) {
            return $http.delete(api + 'posts/' + postId);
        }

        function createAuthor(username, password) {
            return $http.post(api + 'newAuthor', {
                username: username,
                password: password
            });
        }

        function removeAuthor(authorId) {
            return $http.post(api + 'removeAuthor', {
                id: authorId
            });
        }
    }
})();
