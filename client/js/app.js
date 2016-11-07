/**
 * Created by zoonman on 11/6/16.
 */

angular.module('app', [])
    .service('Categories', function($q, $http) {
        return function () {

            var deferred = $q.defer();

            $http.get('/api/categories').then(function(data) {
                deferred.resolve(data.data);
            });

            return deferred.promise;
        }
    })
    .service('IoTransport', function() {

        return function () {
            var socket = io.connect('/');
            socket.on('news', function (data) {
                console.log(data);
                socket.emit('my other event', { my: 'data' });
            });
            return socket;
        }
    })
    .controller('Main', function(IoTransport, $scope, $timeout, $window) {
        var socket = IoTransport();
        $scope.messages = [];

        function getYOffset() {

            var offset = scroll.yOffset;

            if (isFunction(offset)) {
                offset = offset();
            } else if (isElement(offset)) {
                var elem = offset[0];
                var style = $window.getComputedStyle(elem);
                if (style.position !== 'fixed') {
                    offset = 0;
                } else {
                    offset = elem.getBoundingClientRect().bottom;
                }
            } else if (!isNumber(offset)) {
                offset = 0;
            }

            return offset;
        }

        function scrollTo(elem) {
            if (elem) {
                elem.scrollIntoView();
                var offset = getYOffset();
                if (offset) {
                    var elemTop = elem.getBoundingClientRect().top;
                    $window.scrollBy(0, elemTop - offset);
                }
            } else {
                $window.scrollTo(0, 0);
            }
        }


        socket.on('thread', function(message) {
            console.log(message);
            $scope.messages.push(message);
            $scope.$applyAsync(function() {
                $timeout(function() {
                    var c = document.getElementById('topics');
                    if (c.lastElementChild) {
                        c.lastElementChild.scrollIntoView();
                    }

                }, 100);

            });


        });
    })
    .controller('Categories', function($scope, Categories) {
        $scope.categories = [];
        Categories().then(function(data) {
            $scope.categories = angular.copy(data);
        });

    })
    .run();
