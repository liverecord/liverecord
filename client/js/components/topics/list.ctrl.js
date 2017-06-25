/**
 * Created by zoonman on 11/27/16.
 */

app.controller(
    'TopicListController',
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

        console.log('init TopicListController...')

        const SECTION_NEW_TOPICS = 'newTopics';
        const SECTION_RECENTLY_VIEWED = 'recentlyViewed';
        const SECTION_PARTICIPATED = 'participated';
        const SECTION_BOOKMARKS = 'bookmarks';

        $rootScope.messages = [];
        $scope.topicSwitch = SECTION_NEW_TOPICS;
        $scope.searchTerm = '';
        this.params = $routeParams;
        $rootScope.category = $routeParams.category;

        $rootScope.$on('$routeChangeSuccess', function(event, next, current) {

          if (next.params.category) {
            if ($rootScope.category != next.params.category) {
              $rootScope.category = next.params.category;
              CategoriesFactory.active($rootScope.category);
              getTopics();
            }
          } else {
            CategoriesFactory.active('-1');
            $rootScope.categories = CategoriesFactory.categories;
            $rootScope.category = '';
            getTopics();
          }



        });

        /**
         * Filter array by category
         * @param {array} arr
         * @param {string} catSlug
         * @return {array}
         */
        function filterByCategory(arr, catSlug) {
          if (catSlug) {
            return arr.filter(function(item) {
              var itemCat = item.category.slug;
              return itemCat == catSlug;
            });

          } else {
            return arr;
          }
        }

        var envelopeReceiver = function(envelope) {
          console.log('topics:envelope', envelope);

          switch (envelope.type) {
            case 'topicList':
              /*

               envelope = {
                type: 'topicList',
                data: [ {...} ],
                switches: ['newTopics', 'viewed', 'bookmarked'],
                category: ''

               }
               * */
              $rootScope.messages = array_id_merge(
                  $rootScope.messages,
                  filterByCategory(envelope.data, $rootScope.category),
                  $routeParams.topic
              );
              PerfectScrollBar.setup('topics');
              break;
            case 'topic':
              $rootScope.messages = filterByCategory(
                  array_id_merge(
                      $rootScope.messages,
                      [envelope.data],
                      $routeParams.topic
                  ),
                  $rootScope.category
              );
              PerfectScrollBar.setup('topic');
              break;
          }
          $rootScope.$applyAsync();

        };

        socket.on('topics', envelopeReceiver);

        function getTopics() {
          $rootScope.messages = [];
          socket.emit('topics', {
                tab: $scope.topicSwitch,
                category: $rootScope.category,
                term: $scope.searchTerm,
                before: 0
              }
          );
          document.getElementById('topics').scrollTop = '0px';
        }

        $scope.newTopics = function() {
          $scope.topicSwitch = SECTION_NEW_TOPICS;
          getTopics();
        };

        $scope.recentlyViewed = function() {
          $scope.topicSwitch = SECTION_RECENTLY_VIEWED;
          getTopics();
        };

        $scope.participated = function() {
          $scope.topicSwitch = SECTION_PARTICIPATED;
          getTopics();
        };

        $scope.bookmarks = function() {
          $scope.topicSwitch = SECTION_BOOKMARKS;
          getTopics();
        };

        $scope.$watch('searchTerm', function(newv, oldv) {
          getTopics();
        });

        socket.on('connect', getTopics);

      }
    ]
);
