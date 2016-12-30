/**
 * Created by zoonman on 11/27/16.
 */

app.controller('TopicListCtrl', ['socket', '$scope', '$timeout', '$routeParams', 'CategoriesFactory', 'PerfectScrollBar','$rootScope', function TopicListCtrl(socket, $scope, $timeout, $routeParams, CategoriesFactory, PerfectScrollBar, $rootScope) {

    console.log('init TopicListCtrl...')


    $rootScope.messages = [];
    $scope.topicSwitch = 'newTopics';
    this.params = $routeParams;
    this.name = 'Test';
    $rootScope.category = $routeParams.category;
    $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
        //console.log('$routeChangeSuccess');
        //console.log('event',event);
        //console.log('next', next);
        //console.log('current', current);
        if (next.params.category) {
            $rootScope.category = next.params.category;
            $rootScope.categories = CategoriesFactory.active(next.params.category);

            subscribeToCategory(next.params.category, socket);

            if (current && current.params.category) {
                if (current.params.category === next.params.category) {
                    //
                } else {
                    unSubscribeFromCategory(current.params.category, socket);
                }
            } else {

            }
        } else {
            CategoriesFactory.active('-1');
            $rootScope.category = '';
            $rootScope.messages = [];
        }
    });


    function subscribeToCategory(category, socket) {
        if (! socket.self.hasListeners('topics:' + category)) {

            socket.on('topics:' + category, envelopeReceiver);
        }
        socket.emit('subscribe', {
            type: 'category',
            slug: category
        });
    }
    function unSubscribeFromCategory(category, socket) {
        if (socket.self.hasListeners('topics:' + category)) {
            $rootScope.messages = [];
            socket.off('topics:' + category, envelopeReceiver);
        }
    }

    CategoriesFactory.load().then(function() {
        $rootScope.categories = CategoriesFactory.get();
        $rootScope.categories = CategoriesFactory.active($routeParams.category);

        $rootScope.$applyAsync();
    });

    function array_id_merge(firstArray, secondArray, slug) {
        var items = [], newItems = [];
        items = items.concat(firstArray);
        items = items.concat(secondArray);

        var extractValueToCompare = function (item) {
            if (angular.isObject(item)) {
                return item['_id'];
            } else {
                return item;
            }
        };

        angular.forEach(items, function (item) {
            var isDuplicate = false;
            for (var i = 0; i < newItems.length; i++) {
                var a = extractValueToCompare(newItems[i]);
                var b = extractValueToCompare(item);
                if (angular.equals(a, b)) {
                    isDuplicate = true;
                    //break;
                    if (newItems[i].updated < item.updated) {
                        newItems[i].updated = item.updated;
                    } else {
                        item.updated = newItems[i].updated;
                    }
                }
            }
            if (!isDuplicate) {
                if (slug) {
                    item.active = (item.slug === slug);
                }

                newItems.push(item);
            }
        });
        items = newItems;
        return items;
    }


    var envelopeReceiver = function(envelope) {
        console.log('topics:envelope', envelope);

        switch (envelope.type) {
            case 'topicList':
                //$rootScope.messages._idMerge(envelope.data);
                //var nar = angular.copy($rootScope.messages)
                $rootScope.messages = array_id_merge($rootScope.messages, envelope.data, $routeParams.topic);
                //$rootScope.messages = $rootScope.messages.concat(envelope.data);
                $rootScope.$applyAsync();
                break;
            case 'topic':

                //$rootScope.messages._idMerge([envelope.data], 'updates');
                $rootScope.messages = array_id_merge($rootScope.messages, [envelope.data], $routeParams.topic);

                $rootScope.$applyAsync();
                PerfectScrollBar.setup('topic');

                break;
        }
    };


    $scope.newTopics = function() {
        socket.emit('subscribe', {
            type: 'section',
            section: 'newTopics'
        });
        $scope.topicSwitch = 'newTopics';
    };

    $scope.recentlyViewed = function() {
        socket.emit('subscribe', {
            type: 'section',
            section: 'recentlyViewed'
        });
        $scope.topicSwitch = 'recentlyViewed';
    };

    $scope.participated = function() {
        socket.emit('subscribe', {
            type: 'section',
            section: 'participated'
        });
        $scope.topicSwitch = 'participated';
    };

    $scope.bookmarks = function() {
        socket.emit('subscribe', {
            type: 'section',
            section: 'bookmarks'
        });
        $scope.topicSwitch = 'bookmarks';
    };

}]);
