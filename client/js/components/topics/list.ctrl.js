/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'TopicListCtrl',
    [
      'socket',
      '$scope',
      '$timeout',
      '$routeParams',
      'CategoriesFactory',
      'PerfectScrollBar',
      '$rootScope',
      function TopicListCtrl(socket,
                             $scope,
                             $timeout,
                             $routeParams,
                             CategoriesFactory,
                             PerfectScrollBar,
                             $rootScope) {

        console.log('init TopicListCtrl...')

        const SECTION_NEW_TOPICS = 'newTopics';
        const SECTION_RECENTLY_VIEWED = 'recentlyViewed';
        const SECTION_PARTICIPATED = 'participated';
        const SECTION_BOOKMARKS = 'bookmarks';

        $rootScope.messages = [];
        $scope.topicSwitch = SECTION_NEW_TOPICS;
        $scope.searchTerm = '';
        this.params = $routeParams;
        this.name = 'Test';
        $rootScope.category = $routeParams.category;
        $rootScope.$on('$routeChangeSuccess', function(event, next, current) {
          //console.log('$routeChangeSuccess');
          //console.log('event',event);
          //console.log('next', next);
          //console.log('current', current);

          switch ($scope.topicSwitch) {
            case SECTION_NEW_TOPICS:
              if (next.params.category) {
                $rootScope.category = next.params.category;
                $rootScope.categories = CategoriesFactory
                    .active(next.params.category);
                subscribeToCategory(next.params.category, socket);
                if (current && current.params.category) {
                  if (current.params.category === next.params.category) {
                    //
                  } else {
                    unSubscribeFromCategory(current.params.category, socket);
                  }
                } else {
                  //
                }
              } else {
                CategoriesFactory.active('-1');
                $rootScope.category = '';
                $rootScope.messages = [];
              }
              break;
            case SECTION_RECENTLY_VIEWED:
              break;
            case SECTION_PARTICIPATED:
              break;
            case SECTION_BOOKMARKS:
              break;
          }

        });

        function listenSlug(category, socket) {
          if (!socket.self.hasListeners('topics:' + category)) {
            socket.on('topics:' + category, envelopeReceiver);
          }
        }

        function muteSlug(slug, socket) {
          if (!socket.self.hasListeners('topics:' + slug)) {
            socket.on('topics:' + slug, envelopeReceiver);
          }
        }

        function subscribeToCategory(category, socket) {
          listenSlug(category, socket);
          socket.emit('subscribe', {
                type: 'category',
                slug: category,
                term: $scope.searchTerm
              }
          );
        }

        function unSubscribeFromCategory(category, socket) {
          if (socket.self.hasListeners('topics:' + category)) {
            $rootScope.messages = [];
            socket.off('topics:' + category, envelopeReceiver);
          }
        }



        var envelopeReceiver = function(envelope) {
          console.log('topics:envelope', envelope);
          switch (envelope.type) {
            case 'topicList':
              $rootScope.messages = array_id_merge(
                  $rootScope.messages,
                  envelope.data,
                  $routeParams.topic
              );
              $rootScope.$applyAsync();
              break;
            case 'topic':
              $rootScope.messages = array_id_merge($rootScope.messages,
                                                   [envelope.data],
                                                   $routeParams.topic
              );
              $rootScope.$applyAsync();
              PerfectScrollBar.setup('topic');

              break;
          }
        };

        $scope.newTopics = function() {
          $rootScope.messages = [];
          muteSlug($scope.topicSwitch, socket);
          socket.emit('subscribe', {
                type: 'section',
                section: SECTION_NEW_TOPICS,
                slug: $rootScope.category,
                term: $scope.searchTerm
              }
          );
          $scope.topicSwitch = SECTION_NEW_TOPICS;
        };

        $scope.recentlyViewed = function() {
          $rootScope.messages = [];
          muteSlug($scope.topicSwitch, socket);
          listenSlug(SECTION_RECENTLY_VIEWED, socket);
          $scope.topicSwitch = SECTION_RECENTLY_VIEWED;
          socket.emit('subscribe', {
                type: 'section',
                section: SECTION_RECENTLY_VIEWED,
                slug: $rootScope.category,
                term: $scope.searchTerm
              }
          );
        };

        $scope.participated = function() {
          $rootScope.messages = [];
          muteSlug($scope.topicSwitch, socket);
          listenSlug(SECTION_PARTICIPATED, socket);
          $scope.topicSwitch = SECTION_PARTICIPATED;
          socket.emit('subscribe', {
                type: 'section',
                section: SECTION_PARTICIPATED,
                slug: $rootScope.category,
                term: $scope.searchTerm
              }
          );
        };

        $scope.bookmarks = function() {
          $rootScope.messages = [];
          $scope.topicSwitch = SECTION_BOOKMARKS;
          listenSlug(SECTION_BOOKMARKS, socket);
          socket.emit('subscribe', {
                type: 'section',
                section: SECTION_BOOKMARKS,
                slug: $rootScope.category,
                term: $scope.searchTerm
              }
          );
        };

        $scope.$watch('searchTerm', function(newv, oldv) {
          if (newv) {
            $rootScope.messages = [];
            socket.emit('subscribe', {
                  type: 'section',
                  section: $scope.topicSwitch,
                  slug: $rootScope.category,
                  term: $scope.searchTerm
                }
            );
          } else {
            $rootScope.messages = [];
            socket.emit('subscribe', {
                  type: 'section',
                  section: $scope.topicSwitch,
                  slug: $rootScope.category,
                  term: $scope.searchTerm
                }
            );
          }
        });

      }
    ]
);
