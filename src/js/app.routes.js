(function() {
    'use strict';

    angular
        .module('SMPLog')
        .config(Routes);

    Routes.$inject = ['$routeProvider', '$httpProvider', '$locationProvider'];

    function Routes($routeProvider, $httpProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('TokenInterceptor');

        $routeProvider.when('/', {
            templateUrl: 'js/home/home.html',
            controller: 'HomeController',
            controllerAs: 'homeCtrl'
        })
        .when('/posts/:slug', {
            templateUrl: 'js/posts/posts.html',
            controller: 'PostsController',
            controllerAs: 'postsCtrl'
        })
        .when('/authors/:id', {
            templateUrl: 'js/authors/authors.html',
            controller: 'AuthorsController',
            controllerAs: 'authorsCtrl'
        })
        .when('/admin', {
            templateUrl: 'js/admin/login.html',
            controller: 'LoginController',
            controllerAs: 'loginCtrl'
        })
        .when('/admin/dash', {
            templateUrl: 'js/admin/dash/dash.html',
            controller: 'DashController',
            controllerAs: 'dashCtrl',
            authRequired: true
        })
        .when('/admin/new', {
            templateUrl: 'js/admin/new/new.html',
            controller: 'NewPostController',
            controllerAs: 'newPostCtrl',
            authRequired: true
        })
        .when('/admin/new/:slug', {
            templateUrl: 'js/admin/new/new.html',
            controller: 'NewPostController',
            controllerAs: 'newPostCtrl',
            authRequired: true
        })
        .otherwise({
            redirectTo: '/'
        });
    }
})();
