(function() {
    'use strict';

    angular
        .module('SMPLog')
        .factory('ApiService', ApiService);

    ApiService.$inject = ['$http'];

    function ApiService($http) {
        var api = 'api/',
            service = {
                details: details,
                post: post,
                posts: posts,
                postsByAuthor: postsByAuthor,
                authors: authors,
                author: author
            };

        return service;

        function details() {
            return $http.get(api + 'details');
        }

        function post(slug) {
            return $http.get(api + 'posts/' + slug);
        }

        function posts() {
            return $http.get(api + 'posts');
        }

        function postsByAuthor(authorId) {
            return $http.get(api + 'posts/author/' + authorId);
        }

        function author(userId) {
            return $http.get(api + 'authors/' + userId);
        }

        function authors() {
            return $http.get(api + 'authors');
        }
    }
})();
