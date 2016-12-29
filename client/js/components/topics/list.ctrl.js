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
        console.log('$routeChangeSuccess');
        console.log('event',event);
        console.log('next', next);
        console.log('current', current);
        if (next.params.category) {
            $rootScope.category = next.params.category;
            CategoriesFactory.active(next.params.category);

            subscribeToCategory(next.params.category, socket);

            if (current.params.category) {
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
        $rootScope.$applyAsync();
    });

    var envelopeReceiver = function(envelope) {
        console.log('topics:envelope', envelope);

        switch (envelope.type) {
            case 'topicList':
                $rootScope.messages = $rootScope.messages.concat(envelope.data);
                break;
            case 'topic':
                $rootScope.messages.unshift(envelope.data);
                PerfectScrollBar.setup('topic');

                break;
        }
    };


    /*
    if ($routeParams.category) {



        $scope.$on('$destroy' ,function(event) {
            console.log('$destroy event' , event)

            if ($routeParams.category) {
                //socket.off('topics:' + $routeParams.category, envelopeReceiver);
                console.log('$routeParams...' , $routeParams)
                console.log('destroying...' + $routeParams.category)
            }
        });

    }*/



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
