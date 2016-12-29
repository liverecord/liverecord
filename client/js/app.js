/**
 * Created by zoonman on 11/6/16.
 */

if(window.history && window.history.pushState){
    // we are good
} else {
    if (window.confirm('Your browser is so old that stinks! Would like to update it now?')) {
        window.location = 'http://browsehappy.com/?locale=en';
    }
}

// polyfill to get length
Object.prototype.numberOfKeys = function(){
    return Object.keys(this).length
};


var app = angular.module('app', ['ngSanitize', 'ngAnimate', 'ngRoute', 'ngStorage']);

app.config([
    '$locationProvider', '$routeProvider', '$localStorageProvider', '$sessionStorageProvider',
    function($locationProvider, $routeProvider, $localStorageProvider, $sessionStorageProvider) {
        $routeProvider.
        when('/ask', {
            controller: 'NewTopicCtrl',
            templateUrl: '/dist/t/ask.tpl'
        }).
        when('/settings', {
            controller: 'SettingsCtrl',
            templateUrl: '/dist/t/settings.tpl'
        }).
        when('/users/:slug', {
            controller: 'UsersCtrl',
            controllerAs: 'uctl',

            templateUrl: '/dist/t/users.tpl'
        }).
        when('/users/password/restore', {
            controller: 'UsersPasswordRestoreCtrl',
            controllerAs: 'uctl',

            templateUrl: '/dist/t/users.password.restore.tpl'
        }).
        when('/:category/:topic', {
            controller: 'TopicDetailsCtrl',
            controllerAs: 'topic',

            templateUrl: '/dist/t/topic.tpl'
        }).
        when('/:category', {
            controller: 'TopicStubCtrl',
            controllerAs: 'topicList',
            templateUrl: '/dist/t/topics.tpl'
        }).
        when('/', {
            controller: 'WelcomeCtrl',
            templateUrl: '/dist/t/welcome.tpl'
        }).
        otherwise('/');

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $localStorageProvider.setKeyPrefix('lr_');
        $sessionStorageProvider.setKeyPrefix('lr_');
    }
]);

app.run(function(PerfectScrollBar) {
    PerfectScrollBar.setup('topics');
    FastClick.attach(document.body);
});

